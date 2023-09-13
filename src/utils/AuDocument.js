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
    createdAt = null;
    updatedAt = null;

    static open_docs = [];
    static settings = {
        autoSave: false,
    };

    // static WelcomeDocument = null;
    // static OpenDocument = null;
    // static NewDocument = null;
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

    static isSpecial(name, skipNewDocs = false) {
        if (skipNewDocs) {
            return AuDocument.SpecialDocuments.filter(
                (doc) => doc.name !== AuDocument.NewDocument.name
            )
                .map((doc) => doc.name)
                .includes(name);
        }
        return AuDocument.SpecialDocuments.map((doc) => doc.name).includes(
            name
        );
    }

    static getSpecial(name) {
        return AuDocument[`${name}Document`] ?? null;
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

            this.createdAt = Date.now();
            this.updatedAt = Date.now();

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
            this.updatedAt = Date.now();
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
        if (
            !AuDocument.isSpecial(this.name) &&
            !this.saved &&
            this.content !== null &&
            !this.newDoc
        ) {
            window.localStorage.setItem(this.name, this.content);
            this.saved = true;
            this.updatedAt = Date.now();

            return true;
        } else if (this.saved) {
            this.updatedAt = Date.now();
            return true;
        }
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
        this.updatedAt = Date.now();
    }

    getContent() {
        this.updatedAt = Date.now();
        return this.content;
    }

    select() {
        this.active = true;
        this.isOpen = true;
        this.updatedAt = Date.now();
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
        this.updatedAt = Date.now();

        return true;
    }

    static reset() {
        // delete all saved documents
        for (let name of this.loadDocumentList()) {
            window.localStorage.removeItem(name);
        }
        // delete document-list
        window.localStorage.removeItem(AuDocument.DocumentList);

        // delete special-docs
        for (let doc of AuDocument.SpecialDocuments) {
            window.localStorage.removeItem(doc.name);
        }

        window.location.reload();
    }

    static addSpecial(doc, create = true) {
        if (create) {
            doc = new AuDocument(doc);
            if (!doc.create()) {
                console.error("Failed to create specila document:", doc);
                return;
            }
            doc.saved = true;
            doc.newDoc = false;
        }
        const docname = `${doc.name}Document`;
        if (Object.getOwnPropertyNames(AuDocument).includes(docname)) {
            console.error(`Special Document already exists: ${docname}`);
            return;
        }
        Object.defineProperty(AuDocument, docname, {
            value: doc,
            enumerable: true, // can be used in loop
            writable: false, // cannot be reassigned
            configurable: true, // doc's properties can be changed
        });

        // AuDocument.SpecialDocuments.push(doc.name);
        AuDocument.SpecialDocuments.push({
            name: doc.name,
            updatedAt: doc.updatedAt,
        });
    }
}

// Welcome Page
AuDocument.addSpecial("Welcome");
// Open Page
AuDocument.addSpecial("Open");
// New Document
const newDoc = new AuDocument("New");
if (!newDoc.create()) {
    console.error("Failed to create NewDocument");
}
newDoc.content = "";
AuDocument.addSpecial(newDoc, false);
// Settings
AuDocument.addSpecial("Settings");
// Account
AuDocument.addSpecial("Account");
// About
AuDocument.addSpecial("About");

export default AuDocument;
