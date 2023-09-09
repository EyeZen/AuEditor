import React, { Component } from "react";
import "./App.css";
import AuEditor from "./components/AuEditor/AuEditor";
import Sidebar from "./components/Sidebar/Sidebar";
import Tabbar from "./components/Tabbar/Tabbar";
import DialogPrompt from "./components/DialogPrompt/DialogPrompt";

class App extends Component {
    dialogRef = React.createRef(null);
    constructor(props) {
        super(props);
        this.state = {
            docs: [],
        };
    }

    render() {
        return (
            <div className="app">
                <Sidebar />
                <main className="vertical-stack">
                    <Tabbar />
                    <AuEditor />
                    {/* <DialogPrompt
                        title="The Title"
                        content="Dialog has some content"
                        options={["Nah!", "Sure!", "Ok"]}
                        onOptionsSelect={this.dialogSelectHandler.bind(this)}
                        ref={this.dialogRef}
                    /> */}
                </main>
            </div>
        );
    }

    dialogSelectHandler(option) {
        
    }
}

export default App;
