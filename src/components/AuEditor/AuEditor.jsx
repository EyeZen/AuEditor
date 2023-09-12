import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import React, { Component } from "react";
import WelcomePage from "./WelcomePage/WelcomePage";
import OpenPage from "./OpenPage/OpenPage";
import SettingsPage from "./SettingsPage/SettingsPage";
import AccountPage from "./AccountPage/AccountPage";
import "./AuEditor.css";

import { actions as AuDocumentActions } from "../../state/slices/documents";
import { connect } from "react-redux";
import AuDocument from "../../utils/AuDocument";
import { debounce } from "../../utils/utils";

class AuEditor extends Component {
    english_text = /([a-zA-Z]+\s*)+/;
    sentence_end = /[.?!]$/;
    sentence_end_marker = /[.?!]/;
    punctuations = /[.?!,;:&'"<>{}[\]]/;

    parser = new DOMParser();
    quillRef = React.createRef(null);
    docRef = React.createRef(null);

    constructor(props) {
        super(props);
        this.props = props;
        // const { openDocuments } = this.props;
        this.state = {
            name: "",
            content: "",
        };
    }

    componentDidMount() {
        const doc = this.props.openDocuments.filter(
            (doc) => doc.active === true
        )[0];
        this.setState({
            name: doc.name,
            content: doc.content,
        });
    }

    componentDidUpdate() {
        const doc = this.props.openDocuments.filter(
            (doc) => doc.active === true
        )[0];
        if (
            this.state.name !== doc.name ||
            this.state.content !== doc.content
        ) {
            this.setState({
                name: doc.name,
                content: doc.content,
            });
        }
    }

    render() {
        // this.docRef.current = this.props.openDocuments.filter(doc => doc.active === true)[0];
        // console.log("AuEditor: render: doc: ", this.docRef.current);
        return (
            <div className="editor vertical-stack">
                {this.state.name === AuDocument.WelcomeDocument.name ? (
                    <WelcomePage />
                ) : this.state.name === AuDocument.OpenDocument.name ? (
                    <OpenPage
                        onOpen={(file) => console.log("Opening file:", file)}
                    />
                ) : this.state.name === AuDocument.SettingsDocument.name ? (
                    <SettingsPage />
                ) : this.state.name === AuDocument.AccountDocument.name ? (
                    <AccountPage />
                ) : (
                    <ReactQuill
                        ref={this.quillRef}
                        theme="snow"
                        value={this.state.content}
                        onChange={debounce(
                            this.contentChangeHandler.bind(this),
                            1000
                        )}
                    />
                )}
            </div>
        );
    }

    contentChangeHandler(content) {
        let newContent = content;
        if (this.props.settings.translate.enabled) {
            newContent = this.transform(content);
        }

        this.setState({
            content: newContent,
        });
        this.props.setContent(this.state.name, newContent);
    }

    async translate(sentence) {
        // if (!this.english_text.test(sentence)) return sentence;
        console.log("fumbling:", sentence);
        let result = sentence;
        try {
            const res = await fetch("http://localhost:5000/translate", {
                method: "POST",
                body: JSON.stringify({
                    q: sentence,
                    source: "en",
                    target: "ja",
                    format: "text",
                    api_key: "",
                }),
                headers: { "Content-Type": "application/json" },
            });
            result = (await res.json()).translatedText;
        } catch (err) {
            console.log("Error translating: ", err);
        }
        return result;
    }

    async transform(editorText) {
        let editorHTML = this.parser.parseFromString(
            editorText,
            "text/html"
        ).body;
        let parsedHTML = await this.parseText(editorHTML);
        console.log("Transformed:", parsedHTML.innerHTML, parsedHTML);
        const newContent = parsedHTML.innerHTML;
        return newContent;
    }

    async parseText(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (this.english_text.test(node.nodeValue)) {
                let arr = this.langSplit(node.nodeValue).filter(
                    (text) => text.trim() !== ""
                );
                console.log("arr:", arr);
                for (let i = 0; i < arr.length; i++) {
                    if (
                        this.english_text.test(arr[i]) &&
                        !(arr[i].length === 1 && this.punctuations.test(arr[i]))
                    ) {
                        arr[i] = await this.translate(arr[i].trim());
                    }
                }
                console.log("arr-2:", arr);
                node.nodeValue = arr.join(" ");
                // node.nodeValue = await this.translate(node.nodeValue);
            }
            return node;
        } else if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.hasChildNodes()
        ) {
            console.log("parsing-element:", node);
            for (let i = 0; i < node.childNodes.length; i++) {
                let parsedChild = await this.parseText(node.childNodes[i]);
                // node.childNodes[i] = await this.parseText(node.childNodes[i]);
                node.replaceChild(parsedChild, node.childNodes[i]);
            }
            // Array.from(node.childNodes).forEach(chNode => this.parseText(chNode));
        }
        return node;
    }

    langSplit(text) {
        let match = null;
        let textArray = [];
        while ((match = this.english_text.exec(text)) !== null) {
            textArray.push(text.slice(0, match.index));
            textArray.push(match[0]);
            text = text.slice(match.index + match[0].length);
        }
        textArray.push(text);
        return textArray;
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
        setContent: (name, content) =>
            dispatch(AuDocumentActions.setContent({ name, content })),
        // open: (doc) => dispatch(AuDocumentActions.open(doc)),
        // close: (doc) => dispatch(AuDocumentActions.close(doc)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuEditor);
