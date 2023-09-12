import React, { Component } from "react";
import "./OpenPage.css";
import IconButton from "../../IconButton/IconButton";
import searchIcon from "../../../assets/search.svg";
import deleteIcon from "../../../assets/delete.svg";
import editIcon from "../../../assets/edit.svg";
import selectIcon from "../../../assets/select.svg";
import emptyIcon from "../../../assets/empty.svg";
import closeIcon from "../../../assets/close.svg";

import { actions as AuDocumentActions } from "../../../state/slices/documents";
import { connect } from "react-redux";
import AuDocument from "../../../utils/AuDocument";
import DialogPrompt from "../../DialogPrompt/DialogPrompt";
import { FileIcons, echo } from "../../../utils/utils";

class OpenPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchbarValue: "",
            renamePrompt: {
                title: "Enter filename:",
                options: { Rename: "Rename", Cancel: "Cancel" },
                visible: false,
                ref: React.createRef(null),
                value: "",
            },
            confirmationPrompt: {
                title: "",
                options: { Yes: "Yes", No: "No" },
                visible: false,
                ref: React.createRef(null),
                handler: echo,
            },
            docslist: this.props.docslist.map((filename) => ({
                filename,
                selected: false,
            })),
        };
    }

    componentDidUpdate() {
        const globalDoclist = this.state.searchbarValue
            ? this.props.docslist.filter((docname) =>
                  docname.includes(this.state.searchbarValue)
              )
            : this.props.docslist;

        const updatesAvailable =
            globalDoclist.length !== this.state.docslist.length ||
            globalDoclist.some(
                (filename) =>
                    this.state.docslist.findIndex(
                        (doc) => doc.filename === filename
                    ) < 0
            );

        if (updatesAvailable) {
            const docslist = globalDoclist.map((filename) => {
                let idx = this.state.docslist.findIndex(
                    (doc) => doc.filename === filename
                );
                if (idx < 0) {
                    // add new item to list
                    return { filename, selected: false };
                }
                return {
                    // keep settings for not-udpated items
                    ...this.state.docslist[idx],
                    filename,
                };
            });
            this.setState({ docslist });
        }

        // Rename-Prompt visibility control
        if (this.state.renamePrompt.visible) {
            this.state.renamePrompt.ref.current?.showModal();
        } else {
            this.state.renamePrompt.ref.current?.close();
        }

        // Confirmation-Prompt visibility control
        if (this.state.confirmationPrompt.visible) {
            this.state.confirmationPrompt.ref.current?.showModal();
        } else {
            this.state.confirmationPrompt.ref.current?.close();
        }
    }

    render() {
        return (
            <div className="OpenPage">
                <header className="search-bar">
                    <input
                        type="text"
                        placeholder="Search Document"
                        value={this.state.searchbarValue}
                        onChange={this.searchbarHandler.bind(this)}
                        autoFocus
                    />
                    {/* <IconButton icon={searchIcon} /> */}
                </header>

                {/* Options applicable on multiple documents */}
                {this.state.docslist.some((doc) => doc.selected) && (
                    <div className="group-options">
                        {/* Delete all selected documents */}
                        <IconButton
                            icon={deleteIcon}
                            tooltip={"Delete multiple"}
                            onClick={() => {
                                this.showConfirmation(
                                    `Are you sure you want to delete ${
                                        this.state.docslist.filter(
                                            (doc) => doc.selected
                                        ).length
                                    } documents?`,
                                    this.multipleDeleteHandler.bind(this)
                                );
                            }}
                        />

                        {/* Deselect all selected documents */}
                        <IconButton
                            icon={closeIcon}
                            tooltip={"Clear Selection"}
                            onClick={this.clearSelectHandler.bind(this)}
                        />
                    </div>
                )}

                {/* Saved Documents List */}
                <ul className="docs-list">
                    {this.state.docslist.map(({ filename, selected }) => (
                        <div className="file-wrapper" key={filename}>
                            {/* options */}
                            <img
                                src={deleteIcon}
                                className="file-option delete-option"
                                alt="delete option"
                                onClick={(ev) => {
                                    this.setState({
                                        confirmationPrompt: {
                                            ...this.state.confirmationPrompt,
                                            title: `Are you sure you want to delete "${filename}"?`,
                                            visible: true,
                                            handler:
                                                this.fileDeleteHandler.bind(
                                                    this,
                                                    filename
                                                ),
                                        },
                                    });
                                }}
                            />
                            <img
                                src={selectIcon}
                                className="file-option select-option"
                                alt="select option"
                                onClick={(ev) =>
                                    this.fileSelectHandler(filename)
                                }
                            />
                            <img
                                src={editIcon}
                                className="file-option edit-option"
                                alt="edit option"
                                onClick={(ev) => {
                                    this.setState({
                                        renamePrompt: {
                                            ...this.state.renamePrompt,
                                            visible: true,
                                            value: filename,
                                        },
                                    });
                                }}
                            />
                            <li
                                // key={filename}
                                className={selected ? "file-selected" : ""}
                                onClick={(ev) => this.fileOpenHandler(filename)}
                            >
                                {/* thumbnail */}
                                <img
                                    src={FileIcons.resolveIcon(filename)}
                                    alt="icon"
                                    className="file-icon"
                                />
                                {/* filename */}
                                <span className="filename">{filename}</span>
                            </li>
                        </div>
                    ))}
                </ul>

                {/* No-Saved-Documents Illustration */}
                {!this.state.docslist.length && (
                    <div className="empty">
                        <img src={emptyIcon} alt="empty icon" />
                        <p>Nothing to see here</p>
                    </div>
                )}

                {/* TODO: Find better method to show-dialog-modal while passing udpated state-props */}
                {this.state.renamePrompt.visible && (
                    <DialogPrompt
                        ref={this.state.renamePrompt.ref}
                        title={this.state.renamePrompt.title}
                        options={Object.values(this.state.renamePrompt.options)}
                        prompt
                        promptValue={this.state.renamePrompt.value}
                        onOptionsSelect={this.fileRenameHandler.bind(this)}
                    />
                )}

                {this.state.confirmationPrompt.visible && (
                    <DialogPrompt
                        ref={this.state.confirmationPrompt.ref}
                        title={this.state.confirmationPrompt.title}
                        options={Object.values(
                            this.state.confirmationPrompt.options
                        )}
                        onOptionsSelect={this.state.confirmationPrompt.handler}
                    />
                )}
            </div>
        );
    }

    searchbarHandler(ev) {
        this.setState({
            searchbarValue: ev.target.value,
        });
        // ...search for files
    }

    fileOpenHandler(filename) {
        this.props.open(filename);
        this.props.close(AuDocument.OpenDocument.name);
    }

    fileSelectHandler(filename) {
        let updatedDocslist = this.state.docslist.map((doc) => {
            if (doc.filename === filename) {
                doc.selected = !doc.selected;
            }
            return doc;
        });
        this.setState({
            docslist: updatedDocslist,
        });
    }

    fileDeleteHandler(filename, confirmationOption) {
        if (confirmationOption === this.state.confirmationPrompt.options.Yes) {
            this.props.delete(filename);
        }

        this.setState({
            confirmationPrompt: {
                ...this.state.confirmationPrompt,
                title: "",
                visible: false,
                handler: echo,
            },
        });
    }

    fileRenameHandler(option, newName) {
        switch (option) {
            case this.state.renamePrompt.options.Rename:
                this.props.rename(this.state.renamePrompt.value, newName);
                break;
            case this.state.renamePrompt.options.Cancel:
                break;
        }
        this.setState({
            renamePrompt: {
                ...this.state.renamePrompt,
                visible: false,
            },
        });
    }

    multipleDeleteHandler(confirmationOption) {
        if (confirmationOption === this.state.confirmationPrompt.options.Yes) {
            this.state.docslist
                .filter((doc) => doc.selected)
                .forEach((doc) => this.props.delete(doc.filename));
        }
        this.closeConfirmation();
    }

    clearSelectHandler() {
        this.setState({
            docslist: this.state.docslist.map((doc) => ({
                ...doc,
                selected: false,
            })),
        });
    }

    showConfirmation(title, handler) {
        this.setState({
            confirmationPrompt: {
                ...this.state.confirmationPrompt,
                title,
                visible: true,
                handler: handler ?? echo,
            },
        });
    }

    closeConfirmation() {
        this.setState({
            confirmationPrompt: {
                ...this.state.confirmationPrompt,
                title: "",
                visible: false,
                handler: echo,
            },
        });
    }
}

function mapStateToProps(state) {
    return {
        docslist: state.documents.savedList,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        open: (name) => dispatch(AuDocumentActions.open({ name })),
        close: (name) => dispatch(AuDocumentActions.close({ name })),
        rename: (name, newName) =>
            dispatch(AuDocumentActions.rename({ name, newName })),
        delete: (name) => dispatch(AuDocumentActions.delete({ name })),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenPage);
