import { createSlice } from "@reduxjs/toolkit";

const DocumentList = "DocumentList";

// load saved names-list
function loadDocumentList() {
    let docnamesList = window.localStorage.getItem(DocumentList);
    if (docnamesList) {
        return JSON.parse(docnamesList);
    }
    return [];
}

// overwrite saved names-list
function saveDocumentList(docnamesList) {
    if (docnamesList) {
        window.localStorage.setItem(
            DocumentList,
            JSON.stringify(docnamesList)
        );
        return true;
    }
    return false;
}

const savedDocumentsSlice = createSlice({
    name: "savedDocuments",
    initialState: loadDocumentList(),
    reducers: {
        add: (state, { type, payload }) => {
            const { name } = payload;
            if (name && state.findIndex((docName) => docName !== name) < 0) {
                state.push(name);
                saveDocumentList([...state]);
                return state;
            }
            console.error("Failed to add", name, "to documents-list!");

            return state;
        },

        remove: (state, { type, payload }) => {
            const { name } = payload;
            let idx = state.findIndex((docName) => docName === name);
            if (idx < 0) {
                console.error("Failed to remove", name, "from documents-list!");
                return state;
            }
            let newState = state.filter((docName) => docName === name);
            saveDocumentList([...newState]);
            return newState;
        },
    },
});

export const reducer = savedDocumentsSlice.reducer;
export const actions = savedDocumentsSlice.actions;
