import { Component } from "react";
import { actions as AuDocumentActions } from "../../state/slices/documents";
import addIcon from "../../assets/add.svg";
import saveIcon from "../../assets/save.svg";
import openIcon from "../../assets/open.svg";
import settingsIcon from "../../assets/settings.svg";
import accountIcon from "../../assets/account.svg";
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
                onClick: this.openCommandHandler.bind(this, AuDocument.OpenDocument.name),
                tooltip: "Open Document",
            },
            {
                icon: settingsIcon,
                onClick: this.openCommandHandler.bind(this, AuDocument.SettingsDocument.name),
                tooltip: "Settings",
            },
            {
                icon: accountIcon,
                onClick: this.openCommandHandler.bind(this, AuDocument.AccountDocument.name),
                tooltip: "Account",
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

    openCommandHandler(docname) {
        this.props.open(docname);
    }

    saveCommandHandler() {
        const idx = this.props.openDocuments.findIndex(doc => doc.active);
        if(idx < 0) {
            console.log("No active document! Cannot save");
            return;
        }
        const doc = this.props.openDocuments[idx];
        this.props.save(doc.name);
    }

    newCommandHandler() {
        this.props.create();
    }

    
}

function mapStateToProps(state) {
    return {
        openDocuments: state.documents.openList,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        create: () => dispatch(AuDocumentActions.create()),
        open: (name) => dispatch(AuDocumentActions.open({name})),
        save: (name) => dispatch(AuDocumentActions.save({ name })),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);