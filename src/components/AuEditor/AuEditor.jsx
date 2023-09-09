import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import React, { Component } from "react";
import WelcomePage from "./WelcomePage/WelcomePage";
import { actions as AuDocumentActions } from "../../state/slices/openDocuments";
import { connect } from "react-redux";
import AuDocument from "../../utils/AuDocument";
import OpenPage from "./OpenPage/OpenPage";
import "./AuEditor.css";

// import { marked } from "marked";
// import TurndownService from "turndown";

function debounce(func, timeoutPeriod = 2000) {
    let timeoutRef = null;
    return (...params) => {
        if (!timeoutRef) {
            // if function not called yet
            console.log("func: scheduled");
            timeoutRef = setTimeout(() => {
                // schedule a call
                console.log("func: called");
                func(...params);
                timeoutRef = null;
            }, timeoutPeriod);
        } else {
            // if function is already scheduled for a call, which hasn't happend yet
            console.log("func: rescheduled");
            clearTimeout(timeoutRef); // reschedule the call
            timeoutRef = setTimeout(() => func(...params), timeoutPeriod);
        }
    };
}

function mapStateToProps(state) {
    return {
        openDocuments: state.openDocuments,
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

        this.contentChangeHandler = debounce(this.transform.bind(this), 1000);
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
                ) : (
                    <ReactQuill
                        ref={this.quillRef}
                        theme="snow"
                        value={this.state.content}
                        onChange={this.contentChangeHandler}
                    />
                )}
            </div>
        );
    }

    setCursorPosition(index) {
        const quill = this.quillRef.current?.editor;
        if (quill) {
            console.log("Cursor Change");
            setTimeout(
                () => quill.setSelection(quill.getSelection().index + index, 0),
                0
            );
        }
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
        this.setState({
            content: newContent,
        });

        // TODO: could debounce this part, for decreasing load on the rest of the subscribers of the content
        this.props.setContent(this.state.name, newContent);
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

    async handleContentChange(editorText) {
        console.log("eid-input:", editorText);
        const editorHTML = this.parser.parseFromString(
            editorText,
            "text/html"
        ).body;
        let text = this.turndownService.turndown(editorHTML.innerHTML ?? "");
        console.log("turned-down: ", editorHTML.innerHTML, "=>", text);

        if (
            /(^\1)*([a-zA-Z\s]+[?.!])$/.test(text) &&
            this.sentence_end.test(text)
        ) {
            let reverseText = text
                .slice(0, text.length - 1)
                .split("")
                .reverse()
                .join("");
            let lastSentenceStart = reverseText.search(
                this.sentence_end_marker
            );
            // let lastSentenceStart = text.lastIndexOf(".", text.length - 2) + 1;
            if (lastSentenceStart < 0) lastSentenceStart = 0;
            else lastSentenceStart = text.length - 1 - lastSentenceStart;
            const translatedSentence = await this.translate(
                text.slice(lastSentenceStart)
            );
            let preText = text.slice(0, lastSentenceStart);
            let newText = `${preText} ${translatedSentence}`;
            let cursorPos = newText.length;
            // if (lastSentenceStart === 0) {
            //     newText = `<p>${newText}</p>`;
            // }
            console.log("modified:", newText);
            newText = marked(newText);
            if (!/^<([a-zA-Z]+)>.*<\/\1>$/.test(newText)) {
                newText = `<p>${newText}</p>`;
            }
            console.log("marked", newText);
            this.setState({ content: newText });
            this.setCursorPosition(cursorPos);
        } else {
            this.setState({ content: editorText });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuEditor);
