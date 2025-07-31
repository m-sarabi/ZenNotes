export class Note {
    constructor(content, id, title, color, category, priority) {
        // this.content = this.escapeHtml(content);
        this.content = content;
        this.id = id ? id : this.newId();
        this.title = title ? title : this.generateTitle();
        this.color = color ? color : this.randomColor();
        this.category = category ? category : '';
        this.priority = priority ? priority : 0;
        this.order = 0;
        this.element = null;
    }

    generateTitle() {
        return this.content.split('\n')[0];
    }

    newId() {
        return Date.now();
    }

    randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    decodeText(text) {
        const txt = document.createElement('textarea');
        txt.innerHTML = text;
        return txt.value;
    }
}

export class ExpandingNoteCard {
    constructor(note) {
        this.note = note;
        this.card = document.createElement('div');
        this.card.className = 'card';
        this.card.setAttribute('data-id', note.id);
        this.editButton = document.getElementById('edit-btn-template').content.cloneNode(true);
        this.pos = null;
    }

    render() {
        const title = document.createElement('h3');
        title.textContent = this.note.decodeText(this.note.title);
        setDirection(title, this.note.title);
        this.card.style.backgroundColor = `var(${this.note.color})`;
        this.card.appendChild(title);

        const category = this.note.category ? document.createElement('div') : null;
        if (category) {
            category.className = 'category';
            category.textContent = this.note.decodeText(this.note.category);
            setDirection(category, this.note.category);
            this.card.appendChild(category);
        }

        this.card.appendChild(this.editButton);
        this.note.content.split('\n').forEach((line) => {
            const content = document.createElement('p');
            while (line.includes('  ')) line = line.replace('  ', '&nbsp;&nbsp;');
            content.textContent = this.note.decodeText(line === '' ? '&nbsp;' : line);
            setDirection(content, line);
            this.card.appendChild(content);
        });
        const timeElement = document.createElement('div');
        timeElement.className = 'time';
        const time = new Date(this.note.id);
        timeElement.textContent = [time.getFullYear(), time.getMonth() + 1, time.getDate()]
                .map((item) => item.toString().padStart(2, '0'))
                .join('-') + ' ' +
            [time.getHours(), time.getMinutes(), time.getSeconds()]
                .map((item) => item.toString().padStart(2, '0'))
                .join(':');
        this.card.appendChild(timeElement);

        this.card.style.zIndex = '1';

        this.addPriority();
        this.expandEvent();

        return this.card;
    }

    addPriority() {
        const priority = this.note.priority;
        if (priority === '0' || priority === 0) return;
        const prioritySvg = document.getElementById(`${priority}-star-svg`).content.cloneNode(true).querySelector('svg');
        prioritySvg.classList.add('priority-svg');
        this.card.appendChild(prioritySvg);
    }

    expandEvent() {
        let startX, startY, mouseDown = false, textSelected = false;
        this.card.addEventListener('mousedown', (event) => {
            startX = event.clientX;
            startY = event.clientY;
            if (event.button === 0) mouseDown = 1;
        });

        this.card.addEventListener('mousemove', () => {
            if (mouseDown) return;
            textSelected = document.getSelection().toString().length > 0;
        });

        this.card.addEventListener('click', (event) => {
            let endX = event.clientX;
            let endY = event.clientY;

            if (Math.abs(endX - startX) > 5 || Math.abs(endY - startY) > 5 || textSelected) {
                mouseDown = false;
                textSelected = false;
                return;
            }

            this.toggleExpand(event);
        });
    }

    toggleExpand(event) {
        if (window.currentNote && !this.card.classList.contains('expanded') && window.currentNote !== this.note) {
            return;
        }
        this.card.classList.toggle('expanded');
        if (this.card.classList.contains('expanded')) {
            // document.getElementById('edit-button').classList.toggle('show', true);
            this.card.style.top = `${document.getElementById('notes-wrapper').scrollTop + 10}px`;
            this.card.style.zIndex = '2';
            this.card.style.height = Math.min(document.getElementById('notes-wrapper').offsetHeight - 40, 600) + 'px';
            this.card.style.userSelect = 'text';
            window.currentNote = this.note;
            document.getElementById('new-note-button').classList.add('invisible');
            setTimeout(() => {
                if (!this.card.classList.contains('expanded')) return;
                this.card.classList.add('full');
            }, 500);
        } else {
            this.card.classList.remove('full');
            this.card.style.top = `${this.pos}px`;
            this.card.style.height = '40px';
            this.card.scrollTo(0, 0);
            document.getElementById('new-note-button').classList.remove('invisible');
            setTimeout(() => {
                if (this.card.classList.contains('expanded')) return;
                this.card.style.userSelect = 'none';
                this.card.style.zIndex = '1';
            }, 1000);
            if (event && event.target.classList.contains('edit-button')) {
                updateEditWindow('edit');
                showWindow('edit-window');
            } else {
                window.currentNote = null;
            }
        }
    }
}

export class FlyingStatus {
    constructor(text, type) {
        this.text = text;
        this.element = document.createElement('div');
        this.element.classList.add('flying-status', type);
        this.element.textContent = text;
    }

    render() {
        document.body.appendChild(this.element);
        setTimeout(() => {
            this.element.classList.add('fly');
            setTimeout(() => {
                this.element.remove();
            }, 2000);
        }, 50);
    }
}

function setDirection(element, text) {
    if (/^[^a-zA-Z\u0600-\u06FF]*[\u0600-\u06FF]/.test(text)) {
        element.dir = 'rtl';
    }
}

const colors = [
    '--card-red',
    '--card-yellow',
    '--card-magenta',
    '--card-green',
    '--card-cyan',
    '--card-blue',
];
