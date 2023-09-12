import React, { Component } from "react";
import closeIcon from "../../assets/close.svg";
import IconButton from "../IconButton/IconButton";
import DialogPrompt from "../DialogPrompt/DialogPrompt";
import "./Tabbar.css";

import { actions as AuDocumentActions } from "../../state/slices/documents";
import { connect } from "react-redux";
import { FileIcons, echo } from "../../utils/utils";
import AuDocument from "../../utils/AuDocument";

class Tabbar extends Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.state = {
            renameValue: "",
            docs: [],
            confirmationPrompt: {
                title: "",
                options: { Yes: "Yes", No: "No" },
                visible: false,
                handler: echo,
                ref: React.createRef(null),
            },
        };

        this.tabIconStyle = {
            background: "none",
            imgStyle: {
                width: "1.5em",
            },
        };
    }

    componentDidMount() {
        const docs = this.props.openDocuments.map((doc) => ({
            ...doc,
            renameState: false,
        }));

        this.setState({ docs });
    }

    componentDidUpdate() {
        const docs = this.props.openDocuments.map((doc) => ({
            ...doc,
            renameState: false,
        }));
        const updatesAvailable =
            !this.state.docs ||
            this.state.docs.length !== docs.length ||
            docs.some((doc) => {
                // check if the doc is present in the state-docs
                let idx = this.state.docs.findIndex(
                    (stateDoc) => stateDoc.name === doc.name
                );
                if (idx < 0) return true;
                let stateDoc = this.state.docs[idx];
                // check for updates on all properties of doc
                for (const key of Object.getOwnPropertyNames(doc)) {
                    if (key === "renameState") continue;
                    if (stateDoc[key] !== doc[key]) return true;
                }
                return false;
            });
        // let currentSelected = this.state.docs?.find((doc) => doc.active);
        // let newSelected = docs.find((doc) => doc.active);
        if (updatesAvailable) {
            this.setState({ docs });
        }

        // Confirmation Visibility Control
        if (this.state.confirmationPrompt.visible) {
            this.state.confirmationPrompt.ref.current?.showModal();
        } else {
            this.state.confirmationPrompt.ref.current?.close();
        }
    }

    render() {
        return (
            <div className="Tabbar">
                {this.state.docs.map((doc, idx) => (
                    <div
                        className={
                            "tab" +
                            (doc.active ? " active-tab" : "") +
                            (doc.newDoc ||
                            AuDocument.SpecialDocuments.includes(doc.name)
                                ? " default-tab"
                                : "")
                        }
                        onClick={this.tabClickHandler.bind(this, doc)}
                        key={idx}
                    >
                        {/* Tab Thumbnail */}
                        <IconButton
                            icon={FileIcons.resolveIcon(doc.name)}
                            style={this.tabIconStyle}
                            imgStyle={this.tabIconStyle.imgStyle}
                        />

                        {/* Tab Name */}
                        {doc.renameState ? (
                            <input
                                type="text"
                                className="tab-name"
                                autoFocus
                                value={this.state.renameValue}
                                onChange={(ev) =>
                                    this.setState({
                                        renameValue: ev.target.value,
                                    })
                                }
                                onKeyUp={this.tabRenameHandler.bind(
                                    this,
                                    doc,
                                    false
                                )}
                                onBlur={this.tabRenameHandler.bind(
                                    this,
                                    doc,
                                    true
                                )}
                            />
                        ) : (
                            <span
                                className="tab-name"
                                onDoubleClick={() => {
                                    if (
                                        AuDocument.SpecialDocuments.filter(
                                            (docname) =>
                                                docname !==
                                                AuDocument.NewDocument.name
                                        ).includes(doc.name)
                                    )
                                        return;

                                    doc.renameState = true;
                                    this.setState({
                                        renameValue: doc.name,
                                    });
                                }}
                            >
                                {doc.saved ? doc.name : `~${doc.name}~`}
                            </span>
                        )}

                        {/* Tab Close Button */}
                        <IconButton
                            icon={closeIcon}
                            // onClick={this.tabCloseHandler.bind(this, doc)}
                            onClick={() => {
                                if (!doc.saved) {
                                    this.setState({
                                        confirmationPrompt: {
                                            ...this.state.confirmationPrompt,
                                            title: "Close file without saving?",
                                            visible: true,
                                            handler: this.tabCloseHandler.bind(
                                                this,
                                                doc
                                            ),
                                        },
                                    });
                                } else {
                                    this.tabCloseHandler(
                                        doc,
                                        this.state.confirmationPrompt.options
                                            .Yes
                                    );
                                }
                            }}
                        />
                    </div>
                ))}
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

    tabRenameHandler(doc, blurred, ev) {
        if (ev.key === "Enter" || ev.keyCode === 13 || blurred) {
            if (!this.state.renameValue) {
                let name = doc.name;
                doc.renameState = false;
                this.setState({ renameValue: name });
            } else {
                // TODO: rename globally
                this.props.rename(doc.name, this.state.renameValue);
                // ...
                // rename locally
                // let tabs = this.state.tabs;
                // doc.name = this.state.renameValue;
                doc.renameState = false;
                // this.setState({ tabs });
            }
        }
    }

    tabCloseHandler(doc, confirmationOption) {
        if (confirmationOption === this.state.confirmationPrompt.options.Yes) {
            this.props.close(doc.name); // dispatch close
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

    tabClickHandler(doc) {
        this.props.select(doc.name);
    }
}

function mapStateToProps(state) {
    return {
        openDocuments: state.documents.openList,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        close: (name) => dispatch(AuDocumentActions.close({ name })),
        rename: (name, newName) =>
            dispatch(AuDocumentActions.rename({ name, newName })),
        select: (name) => dispatch(AuDocumentActions.select({ name })),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabbar);
