import { Component } from "react";
import addIcon from "../../../assets/add.svg";
import openIcon from "../../../assets/open.svg";
import deleteIcon from "../../../assets/delete.svg";
import "./WelcomePage.css";

import { actions as AuDocumentActions } from "../../../state/slices/documents";
import { connect } from "react-redux";
import AuDocument from "../../../utils/AuDocument";

class WelcomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: [
                {
                    title: "New Document",
                    icon: addIcon,
                    action: this.newCommandHandler.bind(this),
                },
                {
                    title: "Open Document",
                    icon: openIcon,
                    action: this.openCommandHandler.bind(
                        this,
                        AuDocument.OpenDocument.name
                    ),
                },
                {
                    title: "Reset All",
                    icon: deleteIcon,
                    action: this.resetHandler.bind(this),
                },
            ],
            recents: [],
        };
    }

    render() {
        return (
            <div className="WelcomePage">
                <h1>Welcome</h1>
                {/* <p>
                    Let's embark on this linguistic adventure together! Start
                    writing your first document and experience the power of
                    Multilingual Scribbler.
                </p> */}
                <main>
                    <section className="start">
                        <h2>Start</h2>
                        <div className="start-options">
                            {this.state.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className="option-btn"
                                    onClick={option.action}
                                >
                                    <div className="icon">
                                        <img
                                            src={option.icon}
                                            alt={option.title}
                                        />
                                    </div>
                                    <span>{option.title}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h2>Recent</h2>
                        <div>
                            {this.state.recents.length
                                ? this.state.recents.map((doc, idx) => (
                                      <button key={idx} className="option-btn">
                                          {doc.name}
                                      </button>
                                  ))
                                : "Nothing to see here!"}
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    resetHandler() {
        window.alert("Dispatching Reset");
        this.props.reset();
    }

    newCommandHandler() {
        this.props.create();
    }

    openCommandHandler(docname) {
        this.props.open(docname);
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        create: () => dispatch(AuDocumentActions.create()),
        open: (name) => dispatch(AuDocumentActions.open({ name })),
        reset: () => dispatch(AuDocumentActions.reset()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
