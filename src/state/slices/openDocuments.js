import { createSlice } from "@reduxjs/toolkit";
import AuDocument from "../../utils/AuDocument";

const openDocumentsSlice = createSlice({
    name: "openDocuments",
    initialState: [AuDocument.WelcomeDocument.serializable()],
    reducers: {
        create: (state) => {
            let newDocIdx = state.findIndex(doc => doc.newDoc);
            console.log(newDocIdx);
            if(newDocIdx >= 0) {
                console.log("Failed to Create New Document!");
                return state;
            }
            let newDoc = new AuDocument("Untitled");
            if(!newDoc.create()) {
                return state;
            }
            let newState = state.map(doc => ({...doc, active: false }));
            newState.push(newDoc.serializable());
            // let newState = [...state, newDoc]
            return newState;
        },
        // adds to list of open-documents
        open: (state, {type, payload}) => {
            const { name } = payload;
            // document name must be unique
            if (state.some((doc) => doc.name === name)) {
                return state;
            } else if(name === AuDocument.OpenDocument.name) {
                let newState = state.map(doc => {
                    let auDoc = AuDocument.from(doc);
                    auDoc.deselect();
                    return auDoc.serializable();
                });
                const openDoc = AuDocument.OpenDocument.serializable();
                newState.push(openDoc);
                return newState;
            }
            // mark new-document active
            const doc = new AuDocument(name);
            doc.open();
            // no other documents should be active
            // let newState = state.map((doc) => {
            //     doc.active = false;
            //     return doc;
            // });
            let newState = state;
            for(let idx=0; idx < newState.length; idx++) {
                newState[idx].active = false;
            }
            newState.push(doc.serializable());

            return newState;
        },
        // removes from list of open-documents
        close: (state, {type, payload}) => {
            const { name } = payload;
            let idx = state.findIndex(doc => doc.name === name);
            if (idx < 0 || (name === AuDocument.WelcomeDocument.name && state.length === 1)) {
                console.error("Failed to close document:", name);
                return state;
            }
            const auDoc = AuDocument.from(state[idx]);
            auDoc.close();
            let newState = state.filter((doc) => doc.name !== name);
            if (!newState.some((doc) => doc.active)) {
                let welcomeIdx = newState.findIndex(
                    (doc) => doc.name === AuDocument.WelcomeDocument.name
                );
                let welcomeDoc = AuDocument.WelcomeDocument.serializable();
                if(welcomeIdx < 0) {
                    newState.unshift(welcomeDoc);
                } else {
                    newState[welcomeIdx] = welcomeDoc;
                }
                // const selectableAuDoc = AuDocument.from(newState[welcomeIdx]);
                // selectableAuDoc.select();
                // newState[welcomeIdx] = selectableAuDoc.serializable();
            }
            return newState;
        },
        // set active
        select: (state, { type, payload}) => {
            // console.log("Select: state:");
            // state.forEach((doc) => console.log("Doc:", doc));
            const { name } = payload;
            let tabIdx = state.findIndex((doc) => doc.name === name);
            if (tabIdx < 0) {
                console.error("Failed to select tab:", name);
                return state;
            }
            let newState = state.map((doc, idx) => {
                const auDoc = AuDocument.from(doc);
                if (idx === tabIdx) {
                    auDoc.select();
                } else {
                    auDoc.deselect();
                }
                return auDoc.serializable();
            });

            return newState;
        },

        rename: (state, { type, payload }) => {
            const { name, newName } = payload;
            if (state.some((doc) => doc.name === newName)) {
                console.error("Cannot rename from `", name, "' to:", newName);
                return state;
            }
            let newState = state.map((doc) => {
                if (doc.name === name) {
                    const auDoc = AuDocument.from(doc);
                    auDoc.rename(newName);
                    return auDoc.serializable();
                }
                return doc;
            });

            return newState;
        },

        setContent: (state, { type, payload }) => {
            const { name, content } = payload;
            const docIdx = state.findIndex((doc) => doc.name === name);
            if (docIdx < 0) {
                console.error("Failed to set-content for ", name);
                return state;
            }
            let newState = state.map((doc, idx) => {
                if (idx === docIdx) {
                    const auDoc = AuDocument.from(doc);
                    auDoc.setContent(content);
                    return auDoc.serializable();
                }
                return doc;
            });

            return newState;
        },

        save: (state, {type, payload}) => {
            const { name } = payload;
            const idx = state.findIndex(doc => doc.name === name);
            if(idx < 0) {
                console.error(type, "Failed to save", name);
                return state;
            }

            const auDoc = AuDocument.from(state[idx]);
            if(auDoc.save()) {
                state[idx] = auDoc.serializable();
            }
            return state;
        }
    },
});

export const reducer = openDocumentsSlice.reducer;
export const actions = openDocumentsSlice.actions;
