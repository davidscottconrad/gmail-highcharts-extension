import * as InboxSDK from '@inboxsdk/core';
import Highcharts from 'highcharts';

InboxSDK.load(2, "sdk_DavidConradTest_305edd048f").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    composeView.addButton({
      title: "New Pie Chart",
      iconUrl: "https://cdn-icons-png.flaticon.com/128/12461/12461700.png",
      async onClick(event) {
        const html = await fetch(chrome.runtime.getURL("drawer.html")).then(res => res.text());

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const modal = sdk.Widgets.showModalView({
          title: "New Pie Chart",
          el: tempDiv,
          buttons: [
            {
              text: "Save",
              onClick: async function () {
                const svg = tempDiv.querySelector('#highchart-container svg');
                if (svg) {
                  const imgSrc = await convertSvgToPngDataUrl(svg);
                  const imgHTML = `<img src="${imgSrc}"/>`;
                  event.composeView.insertHTMLIntoBodyAtCursor(imgHTML);
                }

                const textarea = tempDiv.querySelector("#extra-info");
                const userText = textarea?.value || "";
                if (userText) {
                  event.composeView.insertTextIntoBodyAtCursor(`<p>${userText}</p>`);
                }

                modal.close();
              }
            },
            {
              text: "Cancel",
              onClick: function () {
                modal.close();
              }
            }
          ]
        });

        requestAnimationFrame(() => {
          const container = tempDiv.querySelector('#highchart-container');
          if (container) {
            addHighCharts(container);
          } else {
            console.warn("No #highchart-container found in modal.");
          }
        });
      }
    });
  });
});

function addHighCharts(container) {
  Highcharts.chart(container, {
    chart: {
      type: 'pie'
    },
    title: {
      text:'Active Days This Month'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      colorByPoint: true,
      data: [
        { name: 'Climbing', y: 8 },   
        { name: 'Soccer', y: 4 }, 
        { name: 'Run', y: 7 }, 
        { name: 'Lift Weight', y: 7 }  
      ]
    }]
  });
}

function convertSvgToPngDataUrl(svgNode) {
  return new Promise((resolve) => {
    const svgData = new XMLSerializer().serializeToString(svgNode);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width ;
      canvas.height = img.height ;
      const context = canvas.getContext('2d');
      context.scale(1, 1);
      context.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = url;
  });
}
