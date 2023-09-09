import { Component } from "react";
import addIcon from "../../../assets/add.svg";
import openIcon from "../../../assets/open.svg";
import "./WelcomePage.css";

export default class WelcomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: [
                {
                    title: "New Document",
                    icon: addIcon,
                    action: () => console.log("New Document"),
                },
                {
                    title: "Open Document",
                    icon: openIcon,
                    action: () => console.log("Open Document"),
                },
            ],
            recents: [],
        };
    }

    render() {
        return (
            <div className="WelcomePage">
                <h1>Welcome</h1>
                <p>Let's embark on this linguistic adventure together! Start writing your first document and experience the power of Multilingual Scribbler.</p>
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
                                    <img src={option.icon} alt={option.title} />
                                </div>
                                <span>{option.title}</span>
                            </button>
                        ))}
                    </div>
                </section>
                <section>
                    <h2>Recent</h2>
                    <div>
                        {this.state.recents.length ? this.state.recents.map((doc, idx) => (
                            <button key={idx} className="option-btn">{doc.name}</button>
                        )) : "Nothing to see here!"}
                        
                    </div>
                </section>
                </main>
            </div>
        );
    }
}
