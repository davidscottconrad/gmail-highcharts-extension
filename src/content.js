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

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'chart-controls';
        controlsContainer.style.cssText = 'overflow-y: auto; overflow-x: none; flex: 40%; padding: 3px;';


        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'chart-title';
        titleInput.placeholder = 'Enter chart title';
        titleInput.style.cssText = 'margin-bottom: 1rem; background: #E9EEF6; border-radius: 20px; border: none; padding-left: 1rem; padding-right: 1rem; padding-top: .5rem; padding-bottom: .5rem;';

        const dataWrapper = document.createElement('div');
        dataWrapper.id = 'data-wrapper';
        dataWrapper.style.cssText = 'margin-bottom: 1rem;';

        const addDataRow = () => {
          const row = document.createElement('div');
          row.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem; ';

          const labelInput = document.createElement('input');
          labelInput.type = 'text';
          labelInput.placeholder = 'Label';
          labelInput.style.cssText = 'flex: 2;  background: #E9EEF6; border-radius: 20px; border: none; padding-left: 1rem; padding-right: 1rem; padding-top: .5rem; padding-bottom: .5rem;';

          const valueInput = document.createElement('input');
          valueInput.type = 'number';
          valueInput.placeholder = 'Value';
          valueInput.style.cssText = 'flex: 1; background: #E9EEF6; border-radius: 20px; border: none; padding-left: 1rem; padding-right: 1rem; padding-top: .5rem; padding-bottom: .5rem; ';

          row.appendChild(labelInput);
          row.appendChild(valueInput);
          dataWrapper.appendChild(row);
        };

       
        addDataRow();

        const addRowButton = document.createElement('button');
        addRowButton.textContent = '+ Add Data Row';
        addRowButton.style.cssText = 'padding: 0.5rem 1rem; margin-bottom: 1rem; background: #C2E7FF; border-radius: 20px; border: none; cursor: pointer; width: 150px';
        addRowButton.onclick = () => {
          addDataRow();
          renderChart(); 
        };

        const containerWrapper = tempDiv.querySelector('#highchart-container');
        if (containerWrapper) {
          controlsContainer.appendChild(titleInput);
          controlsContainer.appendChild(dataWrapper);
          controlsContainer.appendChild(addRowButton);
          
          containerWrapper.parentNode.insertBefore(controlsContainer, containerWrapper);          
        }

        const modal = sdk.Widgets.showModalView({
          title: "New Pie Chart",
          el: tempDiv,
          buttons: [
            {
              text: "Insert",
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

        const renderChart = () => {
          const container = tempDiv.querySelector('#highchart-container');
          const title = tempDiv.querySelector('#chart-title')?.value || '';

          const dataRows = tempDiv.querySelectorAll('#data-wrapper > div');
          const data = [];

          dataRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const label = inputs[0]?.value;
            const value = parseFloat(inputs[1]?.value);
            if (label && !isNaN(value)) {
              data.push({ name: label, y: value });
            }
          });

          if (container) {
            addHighCharts(container, title, data);
          }
        };

        requestAnimationFrame(() => {
          renderChart();

          tempDiv.addEventListener('input', renderChart);
        });
      }
    });
  });
});

function addHighCharts(container, titleText = '', data = []) {
  const defaultData = [
  ];

  Highcharts.chart(container, {
    chart: {
      type: 'pie'
    },
    title: {
      text: titleText
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
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      colorByPoint: true,
      data: data.length > 0 ? data : defaultData
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
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext('2d');
      context.scale(1, 1);
      context.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = url;
  });
}
