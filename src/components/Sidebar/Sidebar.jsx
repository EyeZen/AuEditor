import { Component } from "react";
import { actions as AuDocumentActions } from "../../state/slices/openDocuments";
import doneIcon from "../../assets/done.svg";
import addIcon from "../../assets/add.svg";
import saveIcon from "../../assets/save.svg";
import openIcon from "../../assets/open.svg";
import IconButton from "../IconButton/IconButton";
import "./Sidebar.css";
import { connect } from "react-redux";
import AuDocument from "../../utils/AuDocument";

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.buttons = [
            {
                icon: addIcon,
                onClick: this.newCommandHandler.bind(this),
                tooltip: "New Document",
            },
            {
                icon: saveIcon,
                onClick: this.saveCommandHandler.bind(this),
                tooltip: "Save Document",
            },
            {
                icon: openIcon,
                onClick: this.openCommandHandler.bind(this),
                tooltip: "Open Document",
            },
        ];
    }

    componentDidMount() {
        document.addEventListener("keydown", ev => {
            switch(ev.key) {
                case 'o': {
                    if(ev.ctrlKey) {
                        ev.preventDefault();
                        console.log("Open Document Command");
                    }
                }
                break;
                case 's': {
                    if(ev.ctrlKey) {
                        ev.preventDefault();
                        console.log("Save Document Command");
                    }
                }
                break;
                case 'm': {
                    if(ev.ctrlKey) {
                        ev.preventDefault();
                        console.log("New Document Command");
                    }
                }
                break;
                case 'w': {
                    if(ev.ctrlKey) {
                        ev.preventDefault();
                        console.log("Close Document Command");
                    }
                }
                break;
            }
        })
    }

    render() {
        return (
            <aside className="Sidebar">
                <div className="options">
                    {this.buttons.map(({ icon, onClick, tooltip }, i) => (
                        <IconButton
                            key={i}
                            icon={icon}
                            onClick={onClick}
                            tooltip={tooltip}
                        />
                    ))}
                </div>
            </aside>
        );
    }

    openCommandHandler() {
        this.props.open(AuDocument.OpenDocument.name);
    }

    saveCommandHandler() {

    }

    newCommandHandler() {
        this.props.create();
    }
}

function mapStateToProps() {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        create: () => dispatch(AuDocumentActions.create()),
        open: (name) => dispatch(AuDocumentActions.open({name})),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);