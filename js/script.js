// global variables
let currentNote = null;
let currentWindow = null;
let isDark;
const categories = [];

function createNoteElement(note, index) {
    return note.element.render(index);
}

function updateNotesList() {
    const notesList = document.getElementById('notes-list');
    const searchTerm = document.getElementById('search')?.value.trim().toLowerCase();
    const localCategories = {};
    categories.splice(0, categories.length);
    currentNote = null;
    getNotes().then((notes) => {
        notesList.innerHTML = '';
        // const fragment = document.createDocumentFragment();
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
            if (!localCategories[note.category]) {
                localCategories[note.category] = [];
            }
            // const noteElement = createNoteElement(note, index);
            // fragment.appendChild(noteElement);
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
        // notesList.appendChild(fragment);
        updateCategoriesList();
        notesList.style.height = index * 50 + 10 + 'px';
    });

    function createCategoryElement(category) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-header';
        categoryElement.appendChild(document.getElementById('tag-svg').content.cloneNode(true));
        categoryElement.appendChild(document.createTextNode(category));
        return categoryElement;
    }
}

function updateCategoriesList() {
    const categoriesList = document.getElementById('categories');
    categoriesList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    categories.forEach((category) => {
        const categoryElement = document.createElement('option');
        categoryElement.value = category;
        fragment.appendChild(categoryElement);
    });
    categoriesList.appendChild(fragment);
}

function updateEditWindow(mode) {
    const titleInput = document.getElementById('title-input');
    const contentInput = document.getElementById('content-input');
    const colorInput = document.getElementById('color-input');
    const categoryInput = document.getElementById('category-input');
    const priorityInput = document.getElementById('priority-input');
    if (mode === 'edit' && currentNote) {
        titleInput.value = currentNote.title;
        contentInput.value = currentNote.content;

        // set color
        colorInput.value = currentNote.color;

        // set category
        categoryInput.value = currentNote.category;

        // set priority
        priorityInput.value = currentNote.priority;

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
    console.log(colorInput.value);
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
            currentNote = null;
            titleElement.textContent = 'Quick Notes';
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

function createPriorityOptions() {
    const priorityBox = document.getElementById('priority-box');
    const priorities = ['none', 'low', 'medium', 'high'];
    priorities.forEach((priority, index) => {
        const priorityElement = document.createElement('div');
        if (index > 0) {
            priorityElement.appendChild(document.getElementById(`${index}-star-svg`).content.cloneNode(true));
        }
        priorityElement.classList.add('priority-option', 'input-option');
        priorityElement.setAttribute('data-priority', index.toString());
        priorityElement.setAttribute('title', priority[0].toUpperCase() + priority.slice(1));
        priorityBox.appendChild(priorityElement);
        priorityElement.addEventListener('click', function () {
            document.getElementById('priority-input').value = index;
            document.getElementById('priority-input').dispatchEvent(new Event('input'));
            priorityBox.querySelectorAll('.priority-option').forEach((option) => {
                option.classList.remove('selected');
            });
            priorityElement.classList.add('selected');
        });
    });
}

function applySave(mode) {
    const newNote = new Note(
        document.getElementById('content-input').value,
        mode === 'edit' ? currentNote.id : null,
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
            deleteNoteById(currentNote.id).then(() => {
                updateNotesList();
                showWindow('notes-window');
                const status = new FlyingStatus('Note deleted', 'red');
                status.render();
            });
        } else if (event.target.id === 'info-button') {
            showWindow('info-window');
        } else if (event.target.id === 'donate-wallet-image') {
            navigator.clipboard.writeText('UQBNk6M45pb1JJ7_i1Aqfre5QhZCmIEqOECmw5z_mS5tlPHi').then(() => {
                const status = new FlyingStatus('Copied', 'green');
                status.render();
            });
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
        console.log(currentWindow);
        if (event.key === 'Escape' && currentWindow !== 'notes-window') {
            showWindow('notes-window');
            event.preventDefault();
        }
    });
}

function init() {
    showWindow('notes-window');
    initEvents();
    updateNotesList();
    themeInit();
    createColorOptions();
    createPriorityOptions();
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});
