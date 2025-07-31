chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "getSelectedText") {
        const selectedText = document.getSelection().toString();
        sendResponse({content: selectedText});
    }
});