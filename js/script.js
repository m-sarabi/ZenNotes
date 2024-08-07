import { Note, ExpandingNoteCard, FlyingStatus } from './classes.js';
import { addNote, getNotes, deleteNoteById, getNoteById, updateNote } from './indexed_db.js';

// global variables
window.currentNote = null;
let currentWindow = null;
let isDark;
const categories = [];
const colors = [
    '--card-red',
    '--card-yellow',
    '--card-magenta',
    '--card-green',
    '--card-cyan',
    '--card-blue',
];

function createNoteElement(note, index) {
    return note.element.render(index);
}

function updateNotesList() {
    const notesList = document.getElementById('notes-list');
    const searchTerm = document.getElementById('search')?.value.trim().toLowerCase();
    const localCategories = {};
    categories.splice(0, categories.length);
    window.currentNote = null;
    getNotes().then((notes) => {
        notesList.innerHTML = '';
        let index = 0;
        notes.forEach((note) => {
            if (note.category && !categories.includes(note.category)) {
                categories.push(note.category);
            }
            if (!note.element) {
                note.element = new ExpandingNoteCard(note);
            }
            note.element.card.classList.toggle('expanded', false);
            if (searchTerm &&
                !note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
                return;
            }
            if (!filterNote(note)) return;
            if (!localCategories[note.category]) {
                localCategories[note.category] = [];
            }
            localCategories[note.category].push(note);
            index++;
        });
        let top = 10;
        Object.keys(localCategories).sort().forEach((category) => {
            if (category) {
                const categoryElement = createCategoryElement(category);
                categoryElement.style.top = (top + 2) + 'px';
                notesList.appendChild(categoryElement);
                top += 30;
            }
            localCategories[category] = localCategories[category].sort((a, b) => {
                return b.priority - a.priority;
            });
            localCategories[category].forEach((note) => {
                const noteElement = createNoteElement(note);
                noteElement.style.top = `${top}px`;
                note.element.pos = top;
                top += 50;
                notesList.appendChild(noteElement);
            });
        });
        updateCategoriesList();
        notesList.style.height = top + 10 + 'px';
    });

    function createCategoryElement(category) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-header';
        categoryElement.appendChild(document.getElementById('tag-svg').content.cloneNode(true));
        categoryElement.appendChild(document.createTextNode(category));
        return categoryElement;
    }

    function filterNote(note) {
        const startDate = createDate(
            document.getElementById('start-date-input').value,
            document.getElementById('start-time-input').value,
        );
        const endDate = createDate(
            document.getElementById('end-date-input').value,
            document.getElementById('end-time-input').value,
            true,
        );
        const priority = document.getElementById('priority-search-input').value;
        const category = document.getElementById('category-search-input').value;

        if (startDate && note.id < startDate) return false;
        if (endDate && note.id > endDate) return false;
        if (priority !== '' && note.priority !== Number(priority)) return false;
        return !(category && note.category !== category);
    }

    function createDate(date, time, end = false) {
        if (!date) return null;
        if (!time) return new Date(date + (end ? 'T23:59:59' : 'T00:00'));
        return new Date(date + 'T' + time);
    }
}

function updateCategoriesList() {
    const categoriesList = document.getElementById('categories');
    const categoriesSearchList = document.getElementById('categories-search');
    const fragment = document.createDocumentFragment();
    categories.forEach((category) => {
        const categoryElement = document.createElement('option');
        categoryElement.value = category;
        fragment.appendChild(categoryElement);
    });
    categoriesList.innerHTML = '';
    categoriesSearchList.innerHTML = '';
    categoriesList.appendChild(fragment.cloneNode(true));
    categoriesSearchList.appendChild(fragment.cloneNode(true));
}

function updateEditWindow(mode) {
    const titleInput = document.getElementById('title-input');
    const contentInput = document.getElementById('content-input');
    const colorInput = document.getElementById('color-input');
    const categoryInput = document.getElementById('category-input');
    const priorityInput = document.getElementById('priority-input');
    if (mode === 'edit' && window.currentNote) {
        titleInput.value = window.currentNote.title;
        contentInput.value = window.currentNote.content;

        // set color
        colorInput.value = window.currentNote.color;

        // set category
        categoryInput.value = window.currentNote.category;

        // set priority
        priorityInput.value = window.currentNote.priority;

        document.getElementById('delete-button').style.display = 'inline-block';
    } else {
        titleInput.value = '';
        contentInput.value = '';
        colorInput.value = colors[Math.floor(Math.random() * colors.length)];
        categoryInput.value = '';
        priorityInput.value = '0';

        document.getElementById('delete-button').style.display = 'none';
    }
    // color
    document.getElementById('color-box').querySelector('div.selected')?.classList.remove('selected');
    document.getElementById('color-box').querySelector(`div[data-color="${colorInput.value}"]`).classList.add('selected');

    //priority
    document.getElementById('priority-box').querySelector('div.selected')?.classList.remove('selected');
    document.getElementById('priority-box').querySelector(`div[data-priority="${priorityInput.value}"]`)
        .classList.add('selected');
    document.getElementById('save-edit-button').setAttribute('data-mode', mode);
}

function closeWindows() {
    document.querySelectorAll('.window').forEach((window) => {
        window.style.display = 'none';
    });
}

function showWindow(windowId, mode) {
    currentWindow = windowId;
    const titleElement = document.querySelector('header h2');
    const backButton = document.getElementById('back-button');
    const searchInput = document.getElementById('search-wrapper');
    closeWindows();
    document.getElementById(windowId).style.display = 'flex';
    switch (windowId) {
        case 'notes-window':
            updateNotesList();
            window.currentNote = null;
            titleElement.textContent = 'ZenNotes';
            break;
        case 'edit-window':
            titleElement.textContent = mode === 'new' ? 'New Note' : 'Edit Note';
            break;
        case 'info-window':
            titleElement.textContent = 'About';
            break;
    }
    if (windowId === 'notes-window') {
        backButton.style.display = 'none';
        searchInput.style.display = 'block';
        document.getElementById('reset-search-button').click();
    } else {
        backButton.style.display = 'block';
        searchInput.style.display = 'none';
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
                const status = new FlyingStatus('Note saved', 'green');
                status.render();

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

function updateThemeIcon() {
    const themeButton = document.getElementById('theme-switch');
    themeButton.innerHTML = '';
    themeButton.appendChild(isDark ?
        document.getElementById('moon-svg').content.cloneNode(true) :
        document.getElementById('sun-svg').content.cloneNode(true));
}

function themeInit() {
    isDark = localStorage.getItem('notes-theme') === null ?
        window.matchMedia('(prefers-color-scheme: dark)').matches :
        localStorage.getItem('notes-theme') === 'dark-mode';
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    document.querySelector(':root').style.setProperty('color-scheme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function dragScrollEvent() {
    const scrollContainer = document.getElementById('notes-wrapper');
    let dragging = false;
    scrollContainer.addEventListener('pointerdown', startDrag);
    scrollContainer.addEventListener('pointerup', endDrag);
    scrollContainer.addEventListener('pointermove', drag);

    function startDrag(event) {
        if (event.target.classList.contains('card') || event.target.parentNode.classList.contains('card')) return;

        if (window.currentNote && window.currentNote.element.card.classList.contains('expanded')) {
            window.currentNote.element.toggleExpand();
        }

        dragging = true;
        scrollContainer.setPointerCapture(event.pointerId);
    }

    function endDrag(event) {
        dragging = false;
        scrollContainer.releasePointerCapture(event.pointerId);
    }

    function drag(event) {
        if (window.currentNote && window.currentNote.element.card.classList.contains('expanded')) return;
        if (dragging && event.buttons === 1) {
            scrollContainer.scrollTop -= event.movementY;
        }
    }
}

function disableScroll() {
    document.addEventListener('scroll', function (event) {
        if (event.target.classList.contains('card') && !event.target.classList.contains('expanded')) {
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

function searchEvent() {
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', function () {
        updateNotesList();
    });
}

function createColorOptions() {
    const colorBox = document.getElementById('color-box');
    colors.forEach((color) => {
        const colorElement = document.createElement('div');
        colorElement.classList.add('color-option', 'input-option');
        colorElement.setAttribute('data-color', color);
        colorElement.setAttribute('title', ((text) => {
            return text[0].toUpperCase() + text.slice(1);
        })(color.replace('--card-', '')));
        colorElement.style.backgroundColor = `var(${color})`;
        colorBox.appendChild(colorElement);
        colorElement.addEventListener('click', function () {
            document.getElementById('color-input').value = color;
            document.getElementById('color-input').dispatchEvent(new Event('input'));
            colorBox.querySelectorAll('.color-option').forEach((option) => {
                option.classList.remove('selected');
            });
            colorElement.classList.add('selected');
        });
    });
}

function createPriorityOptions(parent, input) {
    const priorities = ['none', 'low', 'medium', 'high'];
    priorities.forEach((priority, index) => {
        const priorityElement = document.createElement('div');
        if (index > 0) {
            priorityElement.appendChild(document.getElementById(`${index}-star-svg`).content.cloneNode(true));
        }
        priorityElement.classList.add('priority-option', 'input-option');
        priorityElement.setAttribute('data-priority', index.toString());
        priorityElement.setAttribute('title', priority[0].toUpperCase() + priority.slice(1));
        parent.appendChild(priorityElement);
        priorityElement.addEventListener('click', function () {
            if (priorityElement.classList.contains('selected')) {
                priorityElement.classList.remove('selected');
                input.value = null;
                input.dispatchEvent(new Event('input'));
                return;
            }
            input.value = index;
            input.dispatchEvent(new Event('input'));
            parent.querySelectorAll('.priority-option').forEach((option) => {
                option.classList.remove('selected');
            });
            priorityElement.classList.add('selected');
        });
    });
}

function applySave(mode) {
    const newNote = new Note(
        document.getElementById('content-input').value,
        mode === 'edit' ? window.currentNote.id : null,
        document.getElementById('title-input').value,
        document.getElementById('color-input').value,
        document.getElementById('category-input').value,
        Number(document.getElementById('priority-input').value),
    );
    if (mode === 'edit') {
        updateNote(newNote).then(finish);
    } else if (mode === 'new') {
        addNote(newNote).then(finish);
    }

    function finish() {
        updateNotesList();
        showWindow('notes-window');
    }
}

function initEvents() {
    document.addEventListener('click', function (event) {
        if (!event.target.closest('#advanced-search-wrapper')
            && !['advanced-search-button', 'search', 'theme-switch'].includes(event.target.id)) {
            document.getElementById('advanced-search-wrapper').classList.toggle('show', false);
        }
        if (event.target.id === 'new-note-button') {
            showWindow('edit-window', 'new');
            updateEditWindow('new');
        } else if (event.target.id === 'save-button') {
            saveNote();
        } else if (event.target.id === 'back-button') {
            showWindow('notes-window');
        } else if (event.target.id === 'save-edit-button') {
            applySave(event.target.dataset.mode);
        } else if (event.target.id === 'delete-button') {
            deleteNoteById(window.currentNote.id).then(() => {
                updateNotesList();
                showWindow('notes-window');
                const status = new FlyingStatus('Note deleted', 'red');
                status.render();
            });
        } else if (event.target.id === 'info-button') {
            showWindow('info-window');
        } else if (event.target.classList.contains('wallet')) {
            if (document.getSelection().toString().length === 0) {
                navigator.clipboard.writeText('UQBNEQ5HZPcBRy4xmvRDvJnwZF9B8OYOXq9dvqwUB2H5IJ7h').then(() => {
                    const status = new FlyingStatus('Copied', 'green');
                    status.render();
                });
            }
        } else if (event.target.id === 'reset-search-button') {
            document.querySelector('#advanced-search-wrapper').querySelectorAll('input').forEach((input) => {
                input.value = null;
            });
            document.querySelector('#priority-search-box').querySelectorAll('.priority-option').forEach((option) => {
                option.classList.remove('selected');
            });
            document.getElementById('search').value = null;
            updateNotesList();
        } else if (event.target.id === 'advanced-search-button') {
            const wrapper = document.getElementById('advanced-search-wrapper');
            wrapper.classList.toggle('show');
        }
    });
    document.getElementById('theme-switch').addEventListener('click', () => {
        isDark = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        localStorage.setItem('notes-theme', document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
        document.querySelector(':root').style.setProperty('color-scheme', isDark ? 'dark' : 'light');
        updateThemeIcon();
    });
    dragScrollEvent();
    disableScroll();
    searchEvent();

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && currentWindow !== 'notes-window') {
            showWindow('notes-window');
            event.preventDefault();
        }
    });

    document.querySelector('#advanced-search-wrapper').querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', function () {
            updateNotesList();
        });
    });
}

function init() {
    showWindow('notes-window');
    initEvents();
    updateNotesList();
    themeInit();
    createColorOptions();
    createPriorityOptions(
        document.getElementById('priority-box'),
        document.getElementById('priority-input'),
    );
    createPriorityOptions(
        document.getElementById('priority-search-box'),
        document.getElementById('priority-search-input'),
    );

}

document.addEventListener('DOMContentLoaded', function () {
    init();
});

window.updateEditWindow = updateEditWindow;
window.showWindow = showWindow;