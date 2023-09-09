import React, { Component } from "react";
import "./DialogPrompt.css";

class DialogPrompt extends Component {
    render() {
        return (
            <dialog className="DialogPrompt" ref={this.props.innerRef} open>
                {this.props.title && <h1>{this.props.title}</h1>}
                <p>{this.props.content}</p>
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
            </dialog>
        );
    }

    optionSelectHandler(option) {
        console.log(option);
        this.props.onOptionsSelect(option);
    }
}

export default React.forwardRef((props, ref) => (
    <DialogPrompt innerRef={ref} {...props} />
));
