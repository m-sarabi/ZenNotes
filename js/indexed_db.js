const colors = [
    '--card-red',
    '--card-yellow',
    '--card-magenta',
    '--card-green',
    '--card-cyan',
    '--card-blue',
];

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
                store.createIndex('order', 'order', {unique: false});


                store.transaction.oncomplete = () => {
                    resolve(db);
                };
            } else {
                resolve(db);
            }
        };

        request.onerror = () => {
            console.error('Error opening IndexedDB:', request.error);
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
                color: note.color,
                order: note.order,
            });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error('Error adding note:', request.error);
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
                    notes.push(new Note(cursor.value.content, cursor.value.noteId, cursor.value.title, cursor.value.color, cursor.value.order));
                    cursor.continue();
                } else {
                    resolve(notes);
                }
            };

            cursor.onerror = () => {
                console.error('Error getting notes:', cursor.error);
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
                console.error('Error deleting note:', request.error);
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
                resolve(new Note(request.result.content, request.result.noteId, request.result.title, request.result.color, request.result.order));
            };

            request.onerror = () => {
                console.error('Error getting note:', request.error);
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
                color: note.color,
                order: note.order,
            });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error('Error updating note:', request.error);
                reject(request.error);
            };
        });
    });
}