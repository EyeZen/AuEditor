// import store from "../state/store";
// import { actions as AuDocumentActions } from "../state/slices/openDocuments";
// import { actions as DocList } from "../state/slices/savedDocuments";

class AuDocument {
    name = null;
    saved = false;
    content = null;
    isOpen = false;
    active = false;
    newDoc = false;

    static open_docs = [];
    static settings = {
        autoSave: false,
    };

    static WelcomeDocument = null;
    static OpenDocument = null;

    constructor(doc_name) {
        this.name = doc_name;
    }
    static from({name, saved, content, isOpen, active, newDoc}) {
        const doc = new AuDocument(name);
        doc.saved = saved;
        doc.content = content;
        doc.isOpen = isOpen;
        doc.active = active;
        doc.newDoc = newDoc;
        return doc;
    }

    serializable() {
        return {
            name: this.name,
            saved: this.saved,
            content: this.content,
            isOpen: this.isOpen,
            active: this.active,
            newDoc: this.newDoc,
        }
    }

    create() {
        let doc = window.localStorage.getItem(this.name);
        if (!doc) {
            this.newDoc = true;
            this.isOpen = true;
            this.saved = false;
            this.active = true;

            return true;
        }
        return false;
    }

    open() {
        let doc = window.localStorage.getItem(this.name);
        if (doc) {
            this.content = doc;
            this.isOpen = true;
            this.saved = true;
            this.active = true;
            // AuDocument.open_docs.push({ name: [this.name], ref: this });
            // store.dispatch(openDocuments.open({ name: this.name, ref: this }));

            return true;
        }
        return false;
    }

    close() {
        if(this.save()) {
            this.isOpen = false;
            this.active = false;
            return true;
        }
        return false;
    }

    save() {
        if (!this.saved && this.content !== null && !this.newDoc) {
            window.localStorage.setItem(this.name, this.content);
            this.saved = true;
            
            // store.dispatch(DocList.add({ name: this.name }));

            return true;
        }
        return false;
    }

    setContent(new_content) {
        this.content = new_content;
        this.saved = false;
        this.newDoc = false;
    }

    getContent() {
        return this.content;
    }

    select() {
        this.active = true;
        this.isOpen = true;
        return true;
    }

    deselect() {
        this.active = false;
        return true;
    }

    rename(newName) {
        if (this.save()) {
            const docContent = window.localStorage.getItem(this.name);
            if (docContent) {
                window.localStorage.setItem(newName, docContent);
            }
        }
        this.name = newName;
        return true;
    }
}

// Welcome Page
AuDocument.WelcomeDocument = new AuDocument("Welcome");
AuDocument.WelcomeDocument.create();
AuDocument.WelcomeDocument.saved = true;
AuDocument.WelcomeDocument.newDoc = false;

// Open Page
AuDocument.OpenDocument = new AuDocument("Open");
AuDocument.OpenDocument.create();
AuDocument.OpenDocument.saved = true;
AuDocument.OpenDocument.newDoc = false;
// AuDocument.OpenDocument.isOpen = false;

export default AuDocument;
