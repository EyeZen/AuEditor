import React, { Component } from "react";
import "./App.css";
import AuEditor from "./components/AuEditor/AuEditor";
import Sidebar from "./components/Sidebar/Sidebar";
import Tabbar from "./components/Tabbar/Tabbar";
import { connect } from "react-redux";
import AuDocument from "./utils/AuDocument";
import { actions as AuDocumentActions } from "./state/slices/documents";
import Pages from "./components/PageComponents";
import { debounce, echo } from "./utils/utils";
import DialogPrompt from "./components/DialogPrompt/DialogPrompt";
const { WelcomePage, OpenPage, SettingsPage, AccountPage, AboutPage } = Pages;

const dialogDefault = {
    visible: false,
    title: "",
    content: "",
    options: [],
    prompt: false,
    promptValue: "",
    handler: echo,
};

class App extends Component {
    dialogRef = React.createRef(null);
    constructor(props) {
        super(props);
        this.state = {
            // docs: [],
            activeDoc: "",
            dialog: { ...dialogDefault },
        };
    }

    componentDidMount() {
        const doc = this.props.openDocuments.filter((doc) => doc.active)[0];
        this.setState({
            activeDoc: doc.name,
        });

        document.addEventListener("keydown", (ev) => {
            switch (ev.key) {
                case "o": // Open
                    {
                        if (ev.ctrlKey) {
                            ev.preventDefault();
                            this.openCommandHandler();
                        }
                    }
                    break;
                case "s": // Save
                    {
                        if (ev.ctrlKey) {
                            ev.preventDefault();
                            this.saveCommandHandler();
                            if (!this.state.activeDoc.saved) {
                                // process event for unsaved, active-file
                                this.setState({
                                    visible: true,
                                    title: "Enter Name:",
                                    options: ["Save", "Cancel"],
                                    prompt: true,
                                    promptValue: this.state.activeDoc,
                                    handler: (choice) => {
                                        if (choice === "Save") {
                                            this.saveCommandHandler();
                                        }
                                        this.resetDialog();
                                    },
                                });
                            }
                        }
                    }
                    break;
                case "m": // New
                    {
                        if (ev.ctrlKey) {
                            ev.preventDefault();
                            this.newCommandHandler();
                        }
                    }
                    break;
                case "q": // Close
                    {
                        if (ev.ctrlKey) {
                            ev.preventDefault();
                            const doc = this.props.openDocuments.filter(
                                (doc) => doc.active
                            )[0];
                            if (!doc.saved) {
                                this.setState({
                                    dialog: {
                                        visible: true,
                                        title: "Close without saving?",
                                        options: ["Yes", "No"],
                                        handler: (choice) => {
                                            if (choice === "Yes") {
                                                // close immediately
                                                this.closeCommandHandler();
                                                this.resetDialog();
                                            } else if (doc.newDoc || doc.name === AuDocument.NewDocument.name) { // save new-doc
                                                this.setState({
                                                    dialog: {
                                                        ...dialogDefault,
                                                        visible: true,
                                                        title: "Enter Name:",
                                                        options: [
                                                            "Save",
                                                            "Cancel",
                                                        ],
                                                        prompt: true,
                                                        promptValue: doc.name,
                                                        handler: (
                                                            choice,
                                                            newName
                                                        ) => {
                                                            if (
                                                                choice ===
                                                                "Save"
                                                            ) {
                                                                // rename
                                                                this.renameCommandHandler(
                                                                    newName
                                                                );
                                                                // save
                                                                setTimeout(this.saveCommandHandler.bind(this), 0);
                                                            }
                                                            this.resetDialog();
                                                        },
                                                    },
                                                });
                                                this.fireKeyCommand("s");
                                            } else { // save old-doc and exit
                                                this.saveCommandHandler();
                                            }
                                        },
                                    },
                                });
                            } else {
                                this.closeCommandHandler();
                            }
                        }
                    }
                    break;
            }
        });
    }

    componentDidUpdate() {
        const doc = this.props.openDocuments.filter((doc) => doc.active)[0];
        if (this.state.activeDoc !== doc.name) {
            this.setState({
                activeDoc: doc.name,
            });
        }

        // Dialog Visibility Control
        if (this.state.dialog.visible) {
            this.dialogRef.current.showModal();
        } else {
            this.dialogRef.current.close();
        }
    }

    render() {
        return (
            <div className="app">
                <DialogPrompt
                    ref={this.dialogRef}
                    title={this.state.dialog.title}
                    content={this.state.dialog.content}
                    options={this.state.dialog.options}
                    onOptionsSelect={this.state.dialog.handler}
                    prompt={this.state.dialog.prompt}
                    promptValue={this.state.dialog.promptValue}
                />
                <Sidebar />
                <main className="vertical-stack">
                    <Tabbar />
                    <div className="pages-container">
                        {this.state.activeDoc ===
                        AuDocument.WelcomeDocument.name ? (
                            <WelcomePage />
                        ) : this.state.activeDoc ===
                          AuDocument.OpenDocument.name ? (
                            <OpenPage />
                        ) : this.state.activeDoc ===
                          AuDocument.SettingsDocument.name ? (
                            <SettingsPage />
                        ) : this.state.activeDoc ===
                          AuDocument.AccountDocument.name ? (
                            <AccountPage />
                        ) : this.state.activeDoc ===
                          AuDocument.AboutDocument.name ? (
                            <AboutPage />
                        ) : (
                            <AuEditor />
                        )}
                    </div>
                </main>
            </div>
        );
    }

    newCommandHandler() {
        this.props.create();
    }
    openCommandHandler() {
        this.props.open(AuDocument.OpenDocument.name);
    }
    closeCommandHandler(choice) {
        const activeDoc = this.props.openDocuments.filter(
            (doc) => doc.active
        )[0];
        this.props.close(activeDoc.name);
    }
    saveCommandHandler() {
        const activeDoc = this.props.openDocuments.filter(
            (doc) => doc.active
        )[0];
        this.props.save(activeDoc.name);
    }
    renameCommandHandler(newName) {
        this.props.rename(this.state.activeDoc, newName);
    }

    fireKeyCommand(key) {
        // Ctrl + key
        const event = new KeyboardEvent("keydown", {
            key: key,
            code: `Key${key.toUpperCase()}`,
            ctrlKey: true, // Set ctrlKey to true for Ctrl key
            shiftKey: false, // Set shiftKey to false for no Shift key
            altKey: false, // Set altKey to false for no Alt key
            metaKey: false, // Set metaKey to false for no Command key (macOS)
            bubbles: true, // Event should bubble up the DOM
            cancelable: true, // Event can be canceled
        });
        document.dispatchEvent(event);
    }

    resetDialog() {
        this.setState({
            dialog: { ...dialogDefault },
        });
    }
}

function mapStateToProps(state) {
    return {
        openDocuments: state.documents.openList,
        settings: state.settings,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        create: () => dispatch(AuDocumentActions.create()),
        open: (name) => dispatch(AuDocumentActions.open({ name })),
        close: (name) => dispatch(AuDocumentActions.close({ name })),
        save: (name) => dispatch(AuDocumentActions.save({ name })),
        rename: (name, newName) =>
            dispatch(AuDocumentActions.rename({ name, newName })),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
