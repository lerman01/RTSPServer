import React, {Component} from 'react';
import './LoginPage.css';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import {PostgresAPI} from "../../services/PostgresAPI";

/*
This component responsible for the Login page, responsible for two main functionalities, login and signup
 */
class LoginPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loginBtnTxt: 'Login',
            signupBtnTxt: 'Sign Up',
            spinnerMode: undefined
        };
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.loginOnEnterKey = this.loginOnEnterKey.bind(this);
        this.login = this.login.bind(this);
        this.signup = this.signup.bind(this);
    }

    handleUsernameChange(event) {
        this.setState({username: event.target.value});
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    login() {
        if (this.state.username.length == 0) {
            this.props.showMsg("Please enter username", "info");
        } else if (this.state.password.length == 0) {
            this.props.showMsg("Please enter password", "info");
        } else {
            this.props.hideMsg();
            this.showSpinner('login');
            PostgresAPI.login(this.state.username, this.state.password).then((res) => {
                this.props.setUser(res.data.username);
                this.props.switchMode('user')
            }).catch((err) => {
                if (err.response.status == 401) {
                    this.props.showMsg("Invalid username or password", "error");
                } else {
                    this.props.showMsg("Fail to login (Code: " + err.response.status + ", Error: " + err.response.data + ")", "error");
                }
            }).finally(() => {
                this.hideSpinner('login');
            });
        }
    }

    signup() {
        this.showSpinner('signup');
        PostgresAPI.signup(this.state.username, this.state.password).then((res) => {
            this.props.setUser(res.data.username);
            this.props.switchMode('user')
        }).catch((err) => {
            if (err.response.status === 409) {
                this.props.showMsg("Username already exists", "error");
            } else {
                this.props.showMsg("Fail to signup (Code: " + err.response.status + ", Error: " + err.response.data + ")", "error");
            }
        }).finally(() => {
            this.hideSpinner('signup');
        });
    }

    showSpinner(button) {
        if (button === 'login') {
            this.setState({loginBtnTxt: '', spinnerMode: button});
        } else if (button === 'signup') {
            this.setState({signupBtnTxt: '', spinnerMode: button});
        }
    }

    hideSpinner(button) {
        if (button === 'login') {
            this.setState({loginBtnTxt: 'Login', spinnerMode: 'none'});
        } else if (button === 'signup') {
            this.setState({signupBtnTxt: 'Sign Up', spinnerMode: 'none'});
        }
    }

    loginOnEnterKey(event) {
        if (event.key === 'Enter') {
            this.login();
        }
    }

    render() {
        return (
            <div>
                <div>
                    <TextField className="input fadein" label="Username" name="username"
                               variant="outlined" value={this.state.username} onChange={this.handleUsernameChange}
                               onKeyPress={this.loginOnEnterKey}/>
                </div>
                <div>
                    <TextField className="input fadein" label="Password" type="password" name="password"
                               variant="outlined" value={this.state.password} onChange={this.handlePasswordChange}
                               onKeyPress={this.loginOnEnterKey}/></div>
                <div>
                    <Button className="btn fadein" variant="contained" color="primary"
                            onClick={this.login}> {this.state.loginBtnTxt} <CircularProgress size="25px" style={{
                        color: "white",
                        display: (this.state.spinnerMode === 'login') ? 'block' : 'none'
                    }}/>
                    </Button>
                    <Button className="btn fadein" variant="contained" color="primary"
                            onClick={this.signup}>  {this.state.signupBtnTxt}
                        <CircularProgress size="25px" style={{
                            color: "white",
                            display: (this.state.spinnerMode === 'signup') ? 'block' : 'none'
                        }}/>
                    </Button>
                </div>
            </div>
        );
    }
}


export default LoginPage;
