import { Component } from "react";
import "./SettingsPage.css";
import { connect } from "react-redux";
import IconButton from "../../IconButton/IconButton";
import settingsIcon from "../../../assets/settings.svg";

class SettingsPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="SettingsPage">
                <div className="settings-wrapper">
                    <main>
                        <header>
                            <IconButton icon={settingsIcon} />
                            Settings
                        </header>

                        {/* Editor Behaviour Settings */}
                        <section className="behaviour settings-pane">
                            <h1>Behaviour Settings</h1>

                            {/* Auto-Save Settings */}
                            <label htmlFor="autosave">
                                <span>Auto-Save</span>
                                <input type="checkbox" id="autosave" name="autosave" />
                            </label>

                            {/* Translate Behaviour */}
                            <div className="translate settings-sub-pane">
                                <h2>Translate</h2>
                                <label htmlFor="target">
                                    <span>Language</span>
                                    <select value="ja">
                                        {/* ... */}
                                        <option value="en">English</option>
                                        <option value="ja">Japanese</option>
                                        {/* ... */}
                                    </select>
                                </label>
                                <label htmlFor="translate-enable">
                                    <span>Enabled</span>
                                    <input
                                        type="checkbox"
                                        name="translate-enable"
                                        id="translate-enable"
                                    />
                                </label>
                            </div>
                        </section>

                        {/* Theme Settings */}
                        <section className="theme settings-pane">
                            <h1>Theme Settings</h1>

                            {/* Theme Select and Create */}
                            <div className="theme-select">
                                <label htmlFor="theme-select">
                                    <span>Current Theme</span>
                                    <select
                                        name="theme-select"
                                        id="theme-select"
                                    >
                                        <option value="default">Default</option>
                                    </select>
                                </label>
                                <button id="create-theme">Create New Theme</button>
                            </div>

                            {/* Background Color */}
                            <div className="background-color settings-sub-pane">
                                <h2>Backgorund Color</h2>

                                <label htmlFor="background-color-default">
                                    <span>Default Color</span>
                                    <input
                                        type="color"
                                        id="background-color-default"
                                        name="background-color"
                                    />
                                    <span>#000000</span>
                                </label>

                                <label htmlFor="background-color-light">
                                    <span>Light Color</span>
                                    <input
                                        type="color"
                                        id="background-color-light"
                                        name="background-color"
                                    />
                                    <span>#000000</span>
                                </label>

                                <label htmlFor="background-color-dark">
                                    <span>Dark Color</span>
                                    <input
                                        type="color"
                                        id="background-color-dark"
                                        name="background-color"
                                    />
                                    <span>#000000</span>
                                </label>
                            </div>

                            {/* Text Color */}
                            <div className="text-color settings-sub-pane">
                                <h2>Text Color</h2>

                                <label htmlFor="text-color-default">
                                    <span>Default Color</span>
                                    <input
                                        type="color"
                                        name="text-color-default"
                                        id="text-color-default"
                                    />
                                    <span>#000000</span>
                                </label>

                                <label htmlFor="text-color-light">
                                    <span>Light Color</span>
                                    <input
                                        type="color"
                                        name="text-color-light"
                                        id="text-color-light"
                                    />
                                    <span>#000000</span>
                                </label>

                                <label htmlFor="text-color-dark">
                                    <span>Dark Color</span>
                                    <input
                                        type="color"
                                        name="text-color-dark"
                                        id="text-color-dark"
                                    />
                                    <span>#000000</span>
                                </label>
                            </div>
                        </section>
                        <footer>
                            <button id="save-settings">Save Settings</button>
                        </footer>
                    </main>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        settings: state.settings,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
