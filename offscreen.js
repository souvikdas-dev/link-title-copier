chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "offscreen-doc") {
    return;
  }

  // Dispatch the message to an appropriate handler.
  switch (message.type) {
    case "copy-data-to-clipboard":
      await handleClipboardWrite(message.data);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
  }
});

// Use the offscreen document's `document` interface to write a new value to the
// system clipboard.
//
// At the time this demo was created (Jan 2023) the `navigator.clipboard` API
// requires that the window is focused, but offscreen documents cannot be
// focused. As such, we have to fall back to `document.execCommand()`.
async function handleClipboardWrite(data) {
  try {
    // Error if we received the wrong kind of data.
    if (typeof data !== "string") {
      throw new TypeError(
        `Value provided must be a 'string', got '${typeof data}'.`
      );
    }

    // `document.execCommand('copy')` works against the user's selection in a web
    // page. As such, we must insert the string we want to copy to the web page
    // and to select that content in the page before calling `execCommand()`.
    const textArea = document.createElement("textarea");
    textArea.value = data;
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand("copy");
    console.log(`Text copy was ${success ? "successful" : "unsuccessful"}.`);

    document.body.removeChild(textArea);
  } catch (err) {
    console.error(err.name, err.message);
  } finally {
    // Job's done! Close the offscreen document.
    // window.close();
  }
}
