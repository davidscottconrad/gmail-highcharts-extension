import * as InboxSDK from '@inboxsdk/core';

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
      }
    });
  });
});
