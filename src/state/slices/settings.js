import { createSlice } from "@reduxjs/toolkit";

const defaultSettings = {
    autoSave: false,
    translate: {
        enabled: false,
        target: "ja",
    },
    theme: {
        backgroundColor: {
            default: "",
            dark: "",
            light: "",
        },
        textColor: {
            normal: "",
            light: "",
        }
    },
};

const settingsSlice = createSlice({
    name: "settings",
    initialState: defaultSettings,
    reducers: {}
});

export const reducer = settingsSlice.reducer;
export const actions = settingsSlice.actions;