import React, { Component } from "react";
import "./DialogPrompt.css";

class DialogPrompt extends Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.state = {
            promptValue: this.props.promptValue ?? "",
        };
    }
    render() {
        return (
            <dialog className="DialogPrompt-wrapper" ref={this.props.innerRef}>
                <div className="DialogPrompt">
                    {this.props.title && <h1>{this.props.title}</h1>}
                    <p>{this.props.content}</p>
                    {this.props.prompt && (
                        <input
                            type="text"
                            className="prompt-input"
                            autoFocus
                            value={this.state.promptValue}
                            onChange={this.promptValueChangeHandler.bind(this)}
                        />
                    )}
                    <div className="options">
                        {this.props.options.map((option) => (
                            <button
                                onClick={this.optionSelectHandler.bind(
                                    this,
                                    option
                                )}
                                key={option}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </dialog>
        );
    }

    optionSelectHandler(option) {
        this.props.onOptionsSelect(option, this.state.promptValue);
    }

    promptValueChangeHandler(ev) {
        this.setState({ promptValue: ev.target.value });
    }
}

export default React.forwardRef((props, ref) => (
    <DialogPrompt innerRef={ref} {...props} />
));
