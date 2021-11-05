let currSfHost = undefined;
const inspectorLink = "chrome-extension://aodjmnfhjibkcdimpodiifdjnnncaafh/data-export.html?host=";

window.addEventListener(
  "keyup",
  (event) => {
    console.log(currSfHost, event.key);

    if (currSfHost && event.altKey && event.key === "e") {
      window.open(inspectorLink + currSfHost);           
    }else if( event.altKey && event.key === 'c'){
      window.open('/ltng/switcher?destination=classic&referrer=%2Flightning%2Fsetup%2FSetupOneHome%2Fhome%3F0.source%3DalohaHeader','_self')
    }
     else if (event.altKey && event.ctrlKey) {
      chrome.storage.local.get("sfdcShortcuts", (result) => {
        openLink(JSON.parse(result.sfdcShortcuts), event.key);
      });
    }
  },
  false
);

const openLink = (links, key) => {
  if (links) {
    const link = links.find((l) => l.char === key);
    if (link) {
      window.open("https://" + location.hostname + link.link);
    }
  }
};

if (!currSfHost) {
  chrome.runtime.sendMessage({ message: "getSfHost", url: location.href }, (sfHost) => {
    if (sfHost) {
      console.log(sfHost);
      currSfHost = sfHost;
    }
  });
}
