import { configureStore } from "@reduxjs/toolkit";

import { reducer as savedDocumentsReducer } from "./slices/savedDocuments";
import { reducer as openDocumentsReducer } from "./slices/openDocuments";

const store = configureStore({
    reducer: {
        openDocuments: openDocumentsReducer,
        savedDocuments: savedDocumentsReducer,
    }
});

export default store;