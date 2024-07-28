// global variables
let currentNote = null;
let currentWindow = null;
let isDark;
let noteCounter = 0;

function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function createNoteElement(note, index) {
    return note.element.render(index);
}

function updateNotesList() {
    const notesList = document.getElementById('notes-list');
    getNotes().then((notes) => {
        noteCounter = notes.length;
        notesList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        notes.forEach((note, index) => {
            const noteElement = createNoteElement(note, index);
            fragment.appendChild(noteElement);
        });
        notesList.appendChild(fragment);
        notesList.style.height = notes.length * 50 + 10 + 'px';
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
    document.getElementById('edit-button').classList.toggle('show', false);
    document.getElementById('window-title').style.backgroundColor = '#a7d2ff';
    currentWindow = windowId;
    // console.log(currentWindow);
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

function themeHandler() {
    isDark = localStorage.getItem('theme') === 'dark-mode';

    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);

    // temp: Temporary change theme button
    document.getElementById('change-theme').addEventListener('click', () => {
        isDark = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', isDark);

        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
    });
}

function dragScrollEvent() {
    const scrollContainer = document.getElementById('notes-wrapper');
    let dragging = false;
    scrollContainer.addEventListener('pointerdown', startDrag);
    scrollContainer.addEventListener('pointerup', endDrag);
    scrollContainer.addEventListener('pointermove', drag);

    function startDrag(event) {
        if (event.target.classList.contains('card') || event.target.parentNode.classList.contains('card')) return;

        if (currentNote && currentNote.element.card.classList.contains('expanded')) {
            currentNote.element.toggleExpand();
        }

        dragging = true;
        scrollContainer.setPointerCapture(event.pointerId);
    }

    function endDrag(event) {
        dragging = false;
        scrollContainer.releasePointerCapture(event.pointerId);
    }

    function drag(event) {
        if (currentNote && currentNote.element.card.classList.contains('expanded')) return;
        if (dragging && event.buttons === 1) {
            scrollContainer.scrollTop -= event.movementY;
        }
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
                document.getElementById('color-input').value,
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
    dragScrollEvent();
}

function init() {
    initEvents();
    updateNotesList();
    themeHandler();

    const colorOptions = document.getElementById('color-input').getElementsByTagName('option');
    for (let i = 0; i < colorOptions.length; i++) {
        colorOptions[i].style.backgroundColor = colorOptions[i].value;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});
