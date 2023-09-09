import { Component } from "react";
import "./OpenPage.css";
import IconButton from "../../IconButton/IconButton";
import searchIcon from "../../../assets/search.svg";

import emptyIcon from "../../../assets/empty.svg";
import cIcon from "../../../assets/filetypes/c.svg";
import codeIcon from "../../../assets/filetypes/code.svg";
import cppIcon from "../../../assets/filetypes/cpp.svg";
import cssIcon from "../../../assets/filetypes/css.svg";
import docIcon from "../../../assets/filetypes/doc.svg";
import htmlIcon from "../../../assets/filetypes/html.svg";
import jsIcon from "../../../assets/filetypes/js.svg";
import mdIcon from "../../../assets/filetypes/md.svg";
import { connect } from "react-redux";

const FileIcons = {
    c: cIcon,
    code: codeIcon,
    cpp: cppIcon,
    css: cssIcon,
    doc: docIcon,
    html: htmlIcon,
    js: jsIcon,
    md: mdIcon,
};

class OpenPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchbarValue: "",
            docslist: this.props.docslist,
        };
    }

    componentDidUpdate() {
        const docslist = this.props.docslist;
        if (docslist.length !== this.state.docslist.length) {
            this.setState({ docslist });
        }
    }

    render() {
        return (
            <div className="OpenPage">
                <header className="search-bar">
                    <input
                        type="text"
                        placeholder="Document Name"
                        value={this.state.searchbarValue}
                        onChange={this.searchbarHandler.bind(this)}
                        autoFocus
                    />
                    <IconButton icon={searchIcon} />
                </header>
                <ul className="docs-list">
                    {this.state.docslist.map((filename) => {
                        let extIdx = filename.lastIndexOf(".");
                        let icon = null;
                        if (extIdx < 0) {
                            icon = FileIcons.doc;
                        } else {
                            let ext = filename.slice(extIdx + 1);
                            if (
                                ext !== "" &&
                                Object.keys(FileIcons).includes(ext)
                            ) {
                                icon = FileIcons[ext];
                            } else {
                                icon = FileIcons.code;
                            }
                        }

                        return (
                            <li
                                key={filename}
                                onClick={(ev) => this.props.onOpen(filename)}
                            >
                                <img
                                    src={icon}
                                    alt="icon"
                                    className="file-icon"
                                />
                                <span className="filename">{filename}</span>
                            </li>
                        );
                    })}
                </ul>

                {!this.state.docslist.length && (
                    <div className="empty">
                        <img src={emptyIcon} alt="empty icon" />
                        <p>Nothing to see here</p>
                    </div>
                )}
            </div>
        );
    }

    searchbarHandler(ev) {
        this.setState({
            searchbarValue: ev.target.value,
        });
        // ...search for files
    }
}

function mapStateToProps(state) {
    return {
        docslist: state.savedDocuments,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenPage);
