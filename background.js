import {Note} from './js/classes.js';
import {addNote} from './js/indexed_db.js';

let selectedText = '';

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: 'saveAsNote',
        title: 'Save as Note',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'saveAsNote') {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['js/content_script.js'],
        }, function () {
            chrome.tabs.sendMessage(tab.id, {message: 'getSelectedText'}, function (response) {
                if (response && response.content) {
                    selectedText = response.content;
                    const note = new Note(selectedText, null, null, null, tab.url.split('//')[1].split('/')[0]);
                    addNote(note).then(() => {
                        chrome.runtime.sendMessage({action: 'reload'}).then();
                    });
                }
            });
        });
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'open_side_panel') {
        chrome.windows.getCurrent(function (currentWindow) {
            const windowId = currentWindow.id;
            chrome.sidePanel.open({windowId: windowId});
        });
        // note: for firefox:
        /*
        browser.sidebarAction.toggle();
         */
    }
});