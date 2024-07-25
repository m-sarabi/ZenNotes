// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     console.log(sender.tab ?
//         "from a content script:" + sender.tab.url :
//         "from the extension");
//     console.log('Received message from background script:', request);
//     if (request.content) {
//         addNote(new Note(request.content)).then();
//     }
//     sendResponse({received: true});
// });

// pastel colors for note backgrounds

let currentNote = null;
let currentWindow = null;

function updateNotesList() {
    const notesList = document.getElementById('notes-list');
    getNotes().then((notes) => {
        notesList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        notes.forEach((note) => {
            const noteElement = note.createNoteElement();
            fragment.appendChild(noteElement);
            // notesList.appendChild(noteElement);
        });
        notesList.appendChild(fragment);
    });
}

function updateEditWindow() {
    const titleInput = document.getElementById('title-input');
    const contentInput = document.getElementById('content-input');
    const colorInput = document.getElementById('color-input');
    if (currentNote) {
        titleInput.value = currentNote.title;
        contentInput.value = currentNote.content;
        colorInput.value = currentNote.color;
        colorInput.style.backgroundColor = currentNote.color;
    } else {
        titleInput.value = '';
        contentInput.value = '';
    }
}

function closeWindows() {
    document.querySelectorAll('.window').forEach((window) => {
        window.style.display = 'none';
    });
}

function showWindow(windowId) {
    document.getElementById('window-title').style.backgroundColor = "#a7d2ff";
    currentWindow = windowId;
    console.log(currentWindow);
    updateNotesList();
    const titleElement = document.querySelector('#window-title h2');
    const backButton = document.getElementById('back-button');
    closeWindows();
    document.getElementById(windowId).style.display = 'flex';
    switch (windowId) {
        case 'new-note-window':
            currentNote = null;
            titleElement.textContent = 'New Note';
            backButton.style.display = 'block';
            break;
        case 'notes-window':
            currentNote = null;
            titleElement.textContent = 'Notes';
            backButton.style.display = 'None';
            break;
        case 'preview-window':
            titleElement.textContent = currentNote.title.length > MAX_TITLE_LENGTH ? currentNote.title.substring(0, MAX_TITLE_LENGTH) + '...' : currentNote.title;
            backButton.style.display = 'block';
            break;
        case 'edit-window':
            titleElement.textContent = 'Edit Note';
            backButton.style.display = 'block';
            break;
        case 'info-window':
            titleElement.textContent = 'About';
            backButton.style.display = 'block';
            break;
    }
}

function notePreview(note) {
    showWindow('preview-window');
    document.getElementById('window-title').style.backgroundColor = note.color;
    const preview = document.getElementById('preview');
    preview.innerHTML = note.content.replace(/\n/g, '<br>');
}

function saveNote() {
    const noteElement = document.getElementById('note');
    const noteContent = noteElement.value.trim();
    if (noteContent !== '') {
        const note = new Note(noteContent);
        try {
            addNote(note).then(() => {
                showWindow('notes-window');
                updateNotesList();

                // Clear the input field
                noteElement.value = '';
                noteElement.focus();
            });
        } catch (error) {
            console.error('Error adding note:', error);
        }
    } else {
        noteElement.value = '';
        noteElement.focus();
    }
}

function initEvents() {
    document.addEventListener('click', function (event) {
        if (event.target.id === 'new-note-button') {
            showWindow('new-note-window');
        } else if (event.target.id === 'save-button') {
            saveNote();
        } else if (event.target.id === 'back-button') {
            document.getElementById('note').value = '';
            showWindow('notes-window');
        } else if (event.target.id === 'edit-button') {
            updateEditWindow();
            showWindow('edit-window');
        } else if (event.target.id === 'save-edit-button') {
            const newNote = new Note(
                document.getElementById('content-input').value,
                currentNote.id,
                document.getElementById('title-input').value,
                document.getElementById('color-input').value
            );
            updateNote(newNote).then(() => {
                updateNotesList();
                showWindow('notes-window');
            });
        } else if (event.target.id === 'delete-button') {
            deleteNoteById(currentNote.id).then(() => {
                updateNotesList();
                showWindow('notes-window');
            });
        } else if (event.target.id === 'info-button') {
            showWindow('info-window');
        }
    });
    document.addEventListener('change', function (event) {
        if (event.target.id === 'color-input') {
            event.target.style.backgroundColor = event.target.value;
        }
    });
}

function init() {
    initEvents();
    updateNotesList();

    const colorOptions = document.getElementById('color-input').getElementsByTagName('option');
    for (let i = 0; i < colorOptions.length; i++) {
        colorOptions[i].style.backgroundColor = colorOptions[i].value;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});
