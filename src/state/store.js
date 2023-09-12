import { configureStore } from "@reduxjs/toolkit";
import { reducer as documentsReducer } from "./slices/documents";
import { reducer as settingsReducer } from "./slices/settings";

const store = configureStore({
    reducer: {
        documents: documentsReducer,
        settings: settingsReducer,
    },
});

export default store;
