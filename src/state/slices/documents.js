import { createSlice } from "@reduxjs/toolkit";
import AuDocument from "../../utils/AuDocument";

const documentsSlice = createSlice({
    name: "openDocuments",
    initialState: {
        savedList: AuDocument.loadDocumentList(),
        openList: [AuDocument.WelcomeDocument.serializable()],
    },
    reducers: {
        /**
         * openList
         */

        create: (state, { type }) => {
            const { openList } = state;
            let newDocIdx = openList.findIndex((doc) => doc.newDoc);
            if (newDocIdx >= 0) {
                console.error(`${type}: Document Already Exists!`);
                return state;
            }
            // create new document
            let newDoc = AuDocument.NewDocument;
            // deselect all other tabs
            let newOpenList = openList.map(doc => {
                const auDoc = AuDocument.from(doc);
                auDoc.deselect();
                return auDoc.serializable();
            });
            newOpenList.push(newDoc.serializable());
            return {
                ...state,
                openList: newOpenList,
            };
        },
        // adds to list of open-documents
        open: (state, { type, payload }) => {
            const { name } = payload;

            if(!name) {
                console.error(`${type}: Invalid Document:`, name);
                return state;
            }

            const { openList } = state;
            const docIdx = openList.findIndex((doc) => doc.name === name);
            // document name must be unique
            // if document is alread-open, focus(make active) it
            if (docIdx >= 0) {
                let newOpenList = openList.map((doc, idx) => {
                    const auDoc = AuDocument.from(doc);
                    if (idx === docIdx) {
                        auDoc.select();
                    } else {
                        auDoc.deselect();
                    }
                    return auDoc.serializable();
                });
                return {
                    ...state,
                    openList: newOpenList,
                };
            }
            // OpenDialog is being opened
            // else if (name === AuDocument.OpenDocument.name) {
            else if (AuDocument.SpecialDocuments.filter(doc => !doc.newDoc).includes(name)) {
                // deselect all other tabs
                let newOpenList = openList.map((doc) => {
                    let auDoc = AuDocument.from(doc);
                    auDoc.deselect();
                    return auDoc.serializable();
                });
                // open and select 'Open-Document' tab
                // const openDoc = AuDocument.OpenDocument.serializable();
                // newOpenList.push(openDoc);
                const newDoc = AuDocument.getSpecial(name).serializable();
                newOpenList.push(newDoc);
                return {
                    ...state,
                    openList: newOpenList,
                };
            }
            // mark new-document active
            const doc = new AuDocument(name);
            doc.open();
            // deselect all other open tabs
            let newOpenList = openList.map((doc) => {
                let auDoc = AuDocument.from(doc);
                auDoc.deselect();
                return auDoc.serializable();
            });
            // for (let idx = 0; idx < newOpenList.length; idx++) {
            //     newOpenList[idx].active = false;
            // }
            newOpenList.push(doc.serializable());

            return {
                ...state,
                openList: newOpenList,
            };
        },
        // removes from list of open-documents
        close: (state, { type, payload }) => {
            const { name } = payload;
            const { openList } = state;
            let idx = openList.findIndex((doc) => doc.name === name);
            if (
                idx < 0 ||
                (name === AuDocument.WelcomeDocument.name && state.length === 1)
            ) {
                console.error("Failed to close document:", name);
                return state;
            }
            const auDoc = AuDocument.from(openList[idx]);
            auDoc.close();
            let newOpenList = openList.filter((doc) => doc.name !== name);
            if (!newOpenList.some((doc) => doc.active)) {
                let welcomeIdx = newOpenList.findIndex(
                    (doc) => doc.name === AuDocument.WelcomeDocument.name
                );
                let welcomeDoc = AuDocument.WelcomeDocument.serializable();
                if (welcomeIdx < 0) {
                    newOpenList.unshift(welcomeDoc);
                } else {
                    newOpenList[welcomeIdx] = welcomeDoc;
                }
            }
            return {
                ...state,
                openList: newOpenList,
            };
        },
        // set active
        select: (state, { type, payload }) => {
            const { name } = payload;
            const { openList } = state;
            let tabIdx = openList.findIndex((doc) => doc.name === name);
            if (tabIdx < 0) {
                console.error("Failed to select tab:", name);
                return state;
            }
            let newOpenList = openList.map((doc, idx) => {
                const auDoc = AuDocument.from(doc);
                if (idx === tabIdx) {
                    auDoc.select();
                } else {
                    auDoc.deselect();
                }
                return auDoc.serializable();
            });

            return {
                ...state,
                openList: newOpenList,
            };
        },

        rename: (state, { type, payload }) => {
            const { name, newName } = payload;
            const { openList, savedList } = state;
            // Invalid Renaming: cannot rename to same name
            if(name === newName) return state;
            else if(name === AuDocument.NewDocument.name) {
                // In-memory Renaming: Does not touch anything in persistent storage
                const idx = openList.findIndex(doc => doc.name === name);
                if(idx < 0) {
                    console.error(`${type}: Document Doesn't Exist: ${name}`);
                    return state;
                }
                
                if(openList.findIndex(doc => doc.name === newName) >= 0) {
                    console.error(`${type}: Document Already Exists: ${newName}`);
                    return state;
                }

                openList[idx].name = newName;
                return state;
            }
            // cannot set name to already-existing-document's name
            else if (
                [AuDocument.SpecialDocuments, ...savedList].some(
                    (doc) => doc.name === newName
                )
            ) {
                console.error("Cannot rename from `", name, "' to:", newName);
                return state;
            }

            // open document to rename
            let auDoc = new AuDocument(name);
            if(!auDoc.open()) {
                console.error(`Renaming Error: ${name} does not exist!`);
                return state;
            }

            // rename to newName
            if(!auDoc.rename(newName)) {
                console.error(`Failed to rename ${name} to ${newName}!`);
                return state;
            }

            // update open-list
            let newOpenList = openList.map((doc) => {
                if (doc.name === name) {
                    return auDoc.serializable();
                }
                return doc;
            });

            // update saved-list
            let newSavedList = state.savedList.map((docname) => {
                if (docname === name) {
                    return newName;
                }
                return docname;
            });
            AuDocument.saveDocumentList([...newSavedList]);

            return {
                ...state,
                openList: newOpenList,
                savedList: newSavedList,
            };
        },

        setContent: (state, { type, payload }) => {
            const { name, content } = payload;
            const { openList } = state;
            const docIdx = openList.findIndex((doc) => doc.name === name);
            if (docIdx < 0) {
                console.error("Failed to set-content for ", name);
                return state;
            }
            let newOpenList = openList.map((doc, idx) => {
                if (idx === docIdx) {
                    const auDoc = AuDocument.from(doc);
                    auDoc.setContent(content);
                    return auDoc.serializable();
                }
                return doc;
            });

            return {
                ...state,
                openList: newOpenList,
            };
        },

        save: (state, { type, payload }) => {
            const { name } = payload;
            // Special Documents are not persistable!
            if (AuDocument.isSpecial(name) || AuDocument.newDoc) {
                console.log("Cannot save special document:", name);
                return state;
            }
            const idx = state.openList.findIndex((doc) => doc.name === name);
            if (idx < 0) {
                console.error(type, "Failed to save", name);
                return state;
            }

            const auDoc = AuDocument.from(state.openList[idx]);
            if (auDoc.save()) {
                state.openList[idx] = auDoc.serializable();

                // add saved document to saved-list, if not already there
                if (
                    state.savedList.findIndex((docName) => docName === name) < 0
                ) {
                    state.savedList.push(name);
                    // TODO: debounce call
                    AuDocument.saveDocumentList([...state.savedList]);
                }
            }
            return state;
        },

        delete: (state, { type, payload }) => {
            const { name } = payload;

            // A special-purpose document is not deletable!
            if(AuDocument.isSpecial(name)) {
                console.error(`${type}: Cannot delete special document: ${name}`);
                return state;
            }

            // The document must exist with the name provided
            const idx = state.savedList.findIndex(docname => docname === name);
            if(idx < 0) {
                console.error(`${type}: Document doesn't exist: ${name}`);
                return state;
            }

            // delete document
            const auDoc = new AuDocument(name);
            if(!auDoc.delete()) {
                console.error(`${type}: Failed to delete ${name}`);
                return state;
            }

            // update state
            const newOpenList = state.openList.filter(doc => doc.name !== name);
            const newSavedList = state.savedList.filter(docname => docname !== name);
            AuDocument.saveDocumentList([...newSavedList]);

            return {
                ...state,
                openList: newOpenList,
                savedList: newSavedList,
            };
        },

        /**
         * savedList
         */

        add: (state, { type, payload }) => {
            const { name } = payload;
            if (
                name &&
                state.savedList.findIndex((docName) => docName === name) < 0
            ) {
                state.savedList.push(name);
                AuDocument.saveDocumentList([...state.savedList]);
                return state;
            }
            console.error("Failed to add", name, "to documents-list!");

            return state;
        },

        remove: (state, { type, payload }) => {
            const { name } = payload;
            let idx = state.savedList.findIndex((docName) => docName === name);
            if (idx < 0) {
                console.error("Failed to remove", name, "from documents-list!");
                return state;
            }
            let newSavedList = state.savedList.filter(
                (docName) => docName === name
            );
            AuDocument.saveDocumentList([...newSavedList]);
            return {
                ...state,
                savedList: newSavedList,
            };
        },
    },
});

export const reducer = documentsSlice.reducer;
export const actions = documentsSlice.actions;
