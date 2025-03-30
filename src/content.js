import * as InboxSDK from '@inboxsdk/core';
import Highcharts from 'highcharts';

InboxSDK.load(2, "sdk_DavidConradTest_305edd048f").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    composeView.addButton({
      title: "New Pie Chart",
      iconUrl: "https://cdn-icons-png.flaticon.com/128/12461/12461700.png",
      async onClick(event) {

        const html = await fetch(
          chrome.runtime.getURL("drawer.html"))
          .then(res => res.text());

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const modal = sdk.Widgets.showModalView({
          title: "New Pie Chart",
          el: tempDiv,
          buttons: [
            {
              text: "Save",
              onClick: function () {
                const textarea = tempDiv.querySelector("#extra-info");
                const userText = textarea?.value || "";
                event.composeView.insertTextIntoBodyAtCursor(userText);
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
  console.log("Rendering Highcharts...");
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
