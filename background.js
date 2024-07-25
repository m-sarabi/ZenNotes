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
        selectedText = info.selectionText;
        console.log("Selected text:", selectedText);
        const note = new Note(selectedText);
        addNote(note).then(() => {
            console.log("Note added:", note);
        });
    }
});