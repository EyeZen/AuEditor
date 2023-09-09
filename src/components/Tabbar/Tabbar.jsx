import { Component } from "react";
import closeIcon from "../../assets/close.svg";
import IconButton from "../IconButton/IconButton";
import "./Tabbar.css";

import { actions as AuDocumentActions } from "../../state/slices/openDocuments";
import { connect } from "react-redux";

function mapStateToProps(state) {
    return {
        openDocuments: state.openDocuments,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        close: (name) => dispatch(AuDocumentActions.close({ name })),
        rename: (name, newName) =>
            dispatch(AuDocumentActions.rename({name, newName})),
        select: (name) => dispatch(AuDocumentActions.select({name})),
    };
}

class Tabbar extends Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.state = {
            renameValue: "",
            docs: [],
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
        console.log("Update-received: ", docs);
        let currentSelected = this.state.docs?.find(doc => doc.active);
        let newSelected = docs.find(doc => doc.active);
        if (!this.state.docs || this.state.docs.length !== docs.length || currentSelected.name !== newSelected.name) {
            console.log("Update accepted");
            this.setState({ docs });
        }
    }

    render() {

        return (
            <div className="Tabbar">
                {this.state.docs.map((doc, idx) => {
                    if (doc.name === "Welcome" && doc.isOpen) {
                        return (
                            <div
                                className={
                                    "tab default-tab" +
                                    (doc.active ? " active-tab" : "")
                                }
                                onClick={this.tabClickHandler.bind(this, doc)}
                                key={idx}
                            >
                                <span className="tab-name">Welcome</span>
                                <IconButton
                                    icon={closeIcon}
                                    onClick={this.tabCloseHandler.bind(
                                        this,
                                        doc
                                    )}
                                    className="btn-tab-close"
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div
                                className={
                                    "tab" +
                                    (doc.active ? " active-tab" : "") +
                                    (doc.newDoc ? " default-tab" : "")
                                }
                                onClick={this.tabClickHandler.bind(this, doc)}
                                key={idx}
                            >
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
                                            // let tabs = this.state.tabs;
                                            doc.renameState = true;
                                            this.setState({
                                                // tabs,
                                                renameValue: doc.name,
                                            });
                                        }}
                                    >
                                        {doc.name}
                                    </span>
                                )}
                                <IconButton
                                    icon={closeIcon}
                                    onClick={this.tabCloseHandler.bind(
                                        this,
                                        doc
                                    )}
                                    tooltip={`Close ${doc.name}`}
                                    className="btn-tab-close"
                                />
                            </div>
                        );
                    }
                })}
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

    tabCloseHandler(doc) {
        this.props.close(doc.name); // dispatch close
    }

    tabClickHandler(doc) {
        this.props.select(doc.name);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabbar);
