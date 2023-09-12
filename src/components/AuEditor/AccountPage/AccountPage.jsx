import { Component } from "react";
import "./AccountPage.css";
import { connect } from "react-redux";

class AccountPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="AccountPage">
                Account Page
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountPage);