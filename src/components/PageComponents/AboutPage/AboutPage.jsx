import { Component } from "react";
import "./AboutPage.css";

class AboutPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="AboutPage">
                <h1>About</h1>
                <p>This is a simple text editor, with plans to improve it further into something of its own. For now enjoy the simple text editing, and please let me know if you would like to have a component added!</p>
                <p>Your documents are stored locally on your system. Nothing is sent over the network.</p>
                <p>Have Fun!</p>
            </div>
        );
    }
}

export default AboutPage;