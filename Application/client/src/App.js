import React, {Component} from 'react';
import './App.css';
import Card from "@material-ui/core/Card";
import LoginPage from "./components/LoginPage/LoginPage";
import UserPage from "./components/UserPage/UserPage";
import {PostgresAPI} from "./services/PostgresAPI";
import "core-js/stable";
import "regenerator-runtime/runtime";
import Cookies from 'universal-cookie';


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {errClass: "error", errMsg: "", mode: ""}
        this.state.bodyContentClass = this.state.mode;
        this.state.sessionId = new Cookies().get('session_id');

        this.showMsg = this.showMsg.bind(this);
        this.hideMsg = this.hideMsg.bind(this);
        this.switchMode = this.switchMode.bind(this);
        this.setUser = this.setUser.bind(this);
        this.initPage = this.initPage.bind(this);
    }

    componentDidMount() {
        this.initPage();
    }

    initPage() {
        if (this.state.sessionId) {
            PostgresAPI.getUserLinks().then((res) => {
                this.setState({username: res.data.username, userLinks: res.data.userlinks});
                this.switchMode('user')
            }).catch((err) => {
                new Cookies().remove('session_id');
                this.switchMode('login')
            });
        } else {
            this.switchMode('login')
        }
    }


    showMsg(errorMsg, severity) {
        this.setState({errClass: ""});
        this.setState({errMsg: ""});
        setTimeout(() => {
            this.setState({errMsg: errorMsg});
            this.setState({errClass: "fadein " + severity});
        }, 0);
    }

    hideMsg() {
        this.setState({errClass: ""});
        this.setState({errMsg: ""});
    }

    switchMode(mode) {
        this.setState({bodyContentClass: "fadeout"});
        setTimeout(() => {
            this.setState({mode: mode});
            this.setState({bodyContentClass: "fadein"});
        }, 250);
    }

    setUser(username) {
        this.setState({username: username})
    }

    render() {
        return (
            <div>
                <Card className="App">
                    <div id="header">
                        <span className="app-logo fadein">RTSP Server</span>
                    </div>
                    <div className="msg-container">
                        <div className={this.state.errClass}>{this.state.errMsg}</div>
                    </div>
                    <Card className={"body " + this.state.mode}>
                        <div className={this.state.bodyContentClass}>
                            {this.state.mode === 'login' &&
                            <LoginPage showMsg={this.showMsg} hideMsg={this.hideMsg}
                                       switchMode={this.switchMode}
                                       setUser={this.setUser}/>
                            }
                            {this.state.mode === 'user' && this.state.username &&
                            <UserPage showMsg={this.showMsg} hideMsg={this.hideMsg} userLinks={this.state.userLinks}
                                      username={this.state.username} switchMode={this.switchMode}/>
                            }
                        </div>
                    </Card>
                </Card>
                <div id="credit"><span> Developed By: Yaniv Lerman for <img src="anyvisionlogo.png"/></span></div>
            </div>
        );
    }
}


export default App;
