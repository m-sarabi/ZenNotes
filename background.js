importScripts('js/indexed_db.js');

let selectedText = "";

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "saveAsNote",
        title: "Save as Note",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "saveAsNote") {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ["js/content_script.js"]
        }, function () {
            chrome.tabs.sendMessage(tab.id, {message: "getSelectedText"}, function (response) {
                if (response && response.content) {
                    selectedText = response.content;
                    const note = new Note(selectedText);
                    addNote(note).then(() => {
                        console.log("Note added:", note);
                    });
                }
            });
        });
    }
});