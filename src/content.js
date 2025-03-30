import * as InboxSDK from '@inboxsdk/core';

InboxSDK.load(2, "sdk_DavidConradTest_305edd048f").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    composeView.addButton({
      title: "New Pie Chart",
      iconUrl: "https://cdn-icons-png.flaticon.com/128/12461/12461700.png",
      onClick(event) {
        const { el, textarea } = createPopupContent();

        const modal = sdk.Widgets.showModalView({
          title: "New Pie Chart",
          el: el,
          buttons: [
            {
              text: "Save",
              onClick: function () {
                const userText = textarea.value;
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

function createPopupContent() {
  const div = document.createElement('div');
  div.style.padding = "2rem";

  const label = document.createElement('label');
  label.textContent = "Additional Info:";

  const textarea = document.createElement('textarea');
  textarea.style.width = "100%";
  textarea.style.height = "100px";

  div.appendChild(label);
  div.appendChild(document.createElement('br'));
  div.appendChild(textarea);

  return { el: div, textarea };
}
