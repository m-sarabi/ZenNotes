const colors = [
    '#FFC0C0',
    '#FFFFC0',
    '#FFC0FF',
    '#C0FFC0',
    '#C0FFFF',
    '#C0C0FF',
];
const MAX_TITLE_LENGTH = 22;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NotesDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('Notes')) {
                const store = db.createObjectStore('Notes', {keyPath: 'noteId'});

                store.createIndex('title', 'title', {unique: false});
                store.createIndex('content', 'content', {unique: false});
                store.createIndex('color', 'color', {unique: false});


                store.transaction.oncomplete = () => {
                    resolve(db);
                };
            } else {
                resolve(db);
            }
        };

        request.onerror = () => {
            console.error("Error opening IndexedDB:", request.error);
            reject(request.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

function addNote(note) {
    return openDB().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['Notes'], 'readwrite');
            const store = transaction.objectStore('Notes');

            const request = store.add({
                content: note.content,
                noteId: note.id,
                title: note.title,
                color: note.color
            });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error("Error adding note:", request.error);
                reject(request.error);
            };
        });
    });
}

function getNotes() {
    return openDB().then((db) => {
        return new Promise((resolve, reject) => {
            const store = db.transaction('Notes').objectStore('Notes');
            const notes = [];
            const cursor = store.openCursor();

            cursor.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    notes.push(new Note(cursor.value.content, cursor.value.noteId, cursor.value.title, cursor.value.color));
                    cursor.continue();
                } else {
                    resolve(notes);
                }
            };

            cursor.onerror = () => {
                console.error("Error getting notes:", cursor.error);
                reject(cursor.error);
            };
        });
    });
}

function deleteNoteById(noteId) {
    return openDB().then((db) => {
        return new Promise((resolve, reject) => {
            const store = db.transaction('Notes', 'readwrite').objectStore('Notes');
            const request = store.delete(noteId);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error("Error deleting note:", request.error);
                reject(request.error);
            };
        });
    });
}

function getNoteById(noteId) {
    return openDB().then((db) => {
        return new Promise((resolve, reject) => {
            const store = db.transaction('Notes').objectStore('Notes');
            const request = store.get(noteId);

            request.onsuccess = () => {
                resolve(new Note(request.result.content, request.result.noteId, request.result.title, request.result.color));
            };

            request.onerror = () => {
                console.error("Error getting note:", request.error);
                reject(request.error);
            };
        });
    });
}

function updateNote(note) {
    return openDB().then((db) => {
        return new Promise((resolve, reject) => {
            const store = db.transaction('Notes', 'readwrite').objectStore('Notes');
            const request = store.put({
                content: note.content,
                noteId: note.id,
                title: note.title,
                color: note.color
            });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error("Error updating note:", request.error);
                reject(request.error);
            };
        });
    });
}

class Note {
    constructor(content, id, title, color) {
        this.content = this.escapeHtml(content);
        this.id = id ? id : this.newId();
        this.title = title ? title : this.generateTitle();
        this.color = color ? color : this.randomColor();
    }

    generateTitle() {
        let title;
        if (this.content.startsWith('#')) {
            title = this.content.slice(1).split('\n')[0];
            this.content = this.content.slice(title.length + 1).trim();
        } else {
            title = this.content.split('\n')[0];
        }
        return title;
    }

    newId() {
        return Date.now();
    }

    randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/`/g, "&#96;");
    }
}