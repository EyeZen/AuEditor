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
    static NewDocument = null;
    static SpecialDocuments = [];
    static DocumentList = "DocumentList";

    constructor(doc_name) {
        this.name = doc_name;
    }
    static from({ name, saved, content, isOpen, active, newDoc }) {
        const doc = new AuDocument(name);
        doc.saved = saved;
        doc.content = content;
        doc.isOpen = isOpen;
        doc.active = active;
        doc.newDoc = newDoc;
        return doc;
    }

    static isSpecial(name) {
        return AuDocument.SpecialDocuments.includes(name);
    }

    static getSpecial(name) {
        switch (name) {
            case AuDocument.NewDocument.name:
                return AuDocument.NewDocument;
            case AuDocument.WelcomeDocument.name:
                return AuDocument.WelcomeDocument;
            case AuDocument.OpenDocument.name:
                return AuDocument.OpenDocument;
            case AuDocument.SettingsDocument.name:
                return AuDocument.SettingsDocument;
            case AuDocument.AccountDocument.name:
                return AuDocument.AccountDocument;
            default:
                return null;
        }
    }

    // load saved names-list
    static loadDocumentList() {
        let docnamesList = window.localStorage.getItem(AuDocument.DocumentList);
        if (docnamesList) {
            return JSON.parse(docnamesList);
        }
        return [];
    }

    // overwrite saved names-list
    static saveDocumentList(docnamesList) {
        if (docnamesList) {
            window.localStorage.setItem(
                AuDocument.DocumentList,
                JSON.stringify(docnamesList)
            );
            return true;
        }
        return false;
    }

    serializable() {
        return {
            name: this.name,
            saved: this.saved,
            content: this.content,
            isOpen: this.isOpen,
            active: this.active,
            newDoc: this.newDoc,
        };
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
        if (this.save()) {
            this.isOpen = false;
            this.active = false;
            return true;
        }
        return false;
    }

    save() {
        if (!AuDocument.isSpecial(this.name) && !this.saved && this.content !== null && !this.newDoc) {
            window.localStorage.setItem(this.name, this.content);
            this.saved = true;

            return true;
        }
        if (this.saved) return true;
        return false;
    }

    delete() {
        if (AuDocument.isSpecial(this.name)) return false;
        if (this.isOpen) {
            this.close();
        }
        window.localStorage.removeItem(this.name);

        return true;
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
        if (window.localStorage.getItem(newName)) return false;

        console.log("Rename Processing for doc", this.serializable());
        if (!this.save()) {
            console.log("Failed to save old document");
            return false;
        }
        console.log("Old document saved as", this.name);
        const docContent = window.localStorage.getItem(this.name);
        if (docContent) {
            window.localStorage.setItem(newName, docContent);
            console.log("Saved Old Item as new", newName);
            window.localStorage.removeItem(this.name);
            console.log("Removed old Item", this.name);
        }
        this.name = newName;
        return true;
    }

    static reset() {
        // delete all saved documents
        for(let name of this.loadDocumentList()) {
            window.localStorage.removeItem(name);
        } 
        // delete document-list
        window.localStorage.removeItem(AuDocument.DocumentList);

        // delete special-docs
        for(let name of AuDocument.SpecialDocuments) {
            window.alert(`Deleting Special: ${name}`);
            window.localStorage.removeItem(name);
        }

        window.location.reload();
    }
}

// Welcome Page
AuDocument.WelcomeDocument = new AuDocument("Welcome");
if (AuDocument.WelcomeDocument.create()) {
    AuDocument.WelcomeDocument.saved = true;
    AuDocument.WelcomeDocument.newDoc = false;
} else console.error(`Initailisation: Failed to create WelcomeDocument`);
AuDocument.SpecialDocuments.push(AuDocument.WelcomeDocument.name);

// Open Page
AuDocument.OpenDocument = new AuDocument("Open");
if (AuDocument.OpenDocument.create()) {
    AuDocument.OpenDocument.saved = true;
    AuDocument.OpenDocument.newDoc = false;
} else console.error(`Initailisation: Failed to create OpenDocument`);
AuDocument.SpecialDocuments.push(AuDocument.OpenDocument.name);

// New Document
AuDocument.NewDocument = new AuDocument("Untitled");
if (AuDocument.NewDocument.create()) {
} else console.error(`Initailisation: Failed to create NewDocument`);
AuDocument.SpecialDocuments.push(AuDocument.NewDocument.name);

// Settings Document
AuDocument.SettingsDocument = new AuDocument("Settings");
if (AuDocument.SettingsDocument.create()) {
    AuDocument.SettingsDocument.saved = true;
    AuDocument.SettingsDocument.newDoc = false;
} else console.error(`Initailisation: Failed to create SettingsDocument`);
AuDocument.SpecialDocuments.push(AuDocument.SettingsDocument.name);

// Account Document
AuDocument.AccountDocument = new AuDocument("Account");
if (AuDocument.AccountDocument.create()) {
    AuDocument.AccountDocument.saved = true;
    AuDocument.AccountDocument.newDoc = false;
} else console.error(`Initailisation: Failed to create AccountDocument`);
AuDocument.SpecialDocuments.push(AuDocument.AccountDocument.name);

export default AuDocument;
