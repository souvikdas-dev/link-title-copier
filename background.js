// This is a service worker background script
let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ["CLIPBOARD"],
      justification: "reason for needing the document",
    });
    await creating;
    creating = null;
  }
}

async function addToClipboard(value) {
  await setupOffscreenDocument("offscreen.html");

  // Now that we have an offscreen document, we can dispatch the
  // message.
  chrome.runtime.sendMessage({
    type: "copy-data-to-clipboard",
    target: "offscreen-doc",
    data: value,
  });

  // chrome.offscreen.closeDocument();
}

chrome.runtime.onInstalled.addListener(() => {
  // chrome.action.setBadgeText({
  //   text: "OFF",
  // });

  chrome.contextMenus.create({
    id: "cptitle&utl",
    title: "Copy web address with title",
    type: "normal",
    contexts: ["page"],
  });
});

const manifest = chrome.runtime.getManifest();

chrome.action.onClicked.addListener(async (tab) => {
  console.info(`(${manifest.name}) contextMenu clicked`);
  console.table(tab);

  const text = `[${tab.title}](${tab.url})`;
  console.log(`text to be copied: ${text}`);

  await addToClipboard(text);
});

chrome.contextMenus.onClicked.addListener(async (item, tab) => {
  console.info(`(${manifest.name}) contextMenu clicked`);
  console.table(tab);

  const text = `[${tab.title}](${tab.url})`;
  console.log(`text to be copied: ${text}`);

  await addToClipboard(text);
});
