import React, {Component} from 'react';
import './UserPage.css';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import Icon from "@material-ui/core/Icon";
import Chip from "@material-ui/core/Chip";
import Cookies from 'universal-cookie';
import {PostgresAPI} from "../../services/PostgresAPI";

class UserPage extends Component {

    constructor(props) {
        super(props);
        this.URI_REGEX = /\w+:(\/?\/?)[^\s]+/;
        this.state = {
            username: props.username,
            userLinks: props.userLinks,
            selectedIndex: undefined,
            currentURL: undefined,
            validURL: true,
            urlInput: '',
            savingNewUrl: false
        };
        this.onKeyPressUrl = this.onKeyPressUrl.bind(this);
        this.addNewUrl = this.addNewUrl.bind(this);
        this.handelUrlChange = this.handelUrlChange.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.state.userLinks) {
            this.refreshLinks()
        }
    }

    handleListItemClick(event, index, link) {
        this.props.hideMsg();
        this.setState({validURL: true, selectedIndex: index, currentURL: undefined});
        PostgresAPI.videoUrlValidation(link).then(() => {
            this.setState({selectedIndex: index, currentURL: link});
        }).catch((err) => {
            this.setState({validURL: false, currentURL: undefined});
            this.props.showMsg("Cannot get video from URL", "error")
        });
    }

    onKeyPressUrl(event) {
        if (event.key === 'Enter') {
            this.addNewUrl();
        }
    }

    addNewUrl() {
        if (!this.state.savingNewUrl && this.state.urlInput.length > 0) {
            if (this.URI_REGEX.test(this.state.urlInput)) {
                this.props.hideMsg();
                this.setState({savingNewUrl: true});
                PostgresAPI.insertNewLink(this.state.urlInput).then((res) => {
                    this.setState({urlInput: ''});
                    this.refreshLinks();
                    this.props.showMsg('URL saved', 'info');
                }).catch((err) => {
                    this.props.showMsg('Failed to save url', 'error');
                }).finally(() => {
                    this.setState({savingNewUrl: false});
                })
            } else {
                this.props.showMsg('Invalid URL', 'error');
            }
        }
    }

    refreshLinks() {
        PostgresAPI.getUserLinks(this.state.username).then((res) => {
            this.setState({userLinks: res.data.userlinks});
        });
    }

    removeUrl(link) {
        PostgresAPI.removeLink(link).then((res) => {
            this.props.showMsg('url removed', 'info');
            this.refreshLinks();
        }).catch((err) => {
            this.props.showMsg('Failed to remove url', 'error');
        });
    }

    generateSingleListItem(link, sequence) {
        return (<ListItem key={sequence} button selected={this.state.selectedIndex === sequence}
                          onClick={event => this.handleListItemClick(event, sequence, link)}>
            <ListItemText primary={link}/>
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="comments" onClick={() => {
                    this.removeUrl(link)
                }}>
                    <Icon color="error">remove_circle_outline</Icon>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>);
    }

    generateAllLinkItems() {
        let listItems = undefined;
        if (this.state.userLinks) {
            listItems = this.state.userLinks.map((link, sequence) => {
                    return this.generateSingleListItem(link, sequence)
                }
            );
        }
        return listItems;
    }

    handelUrlChange(event) {
        this.setState({urlInput: event.target.value});
    }

    logout() {
        this.props.hideMsg();
        new Cookies().remove('session_id');
        this.props.switchMode('login')
    }

    render() {
        let listItems = this.generateAllLinkItems();
        return (
            <div>
                <Chip label="Logout" href="#chip" clickable onClick={this.logout} style={{float: "left"}}/>
                <div className="section-container">
                    <span className="section-title">User Links:</span>
                    <Card id="userLinks">
                        <List>
                            {listItems}
                        </List>
                    </Card>
                </div>
                <div className="section-container">
                    <span className="section-title">Add New URL:</span>
                    <Card id="addNewUrl">
                        <TextField onKeyPress={this.onKeyPressUrl} id="addNewUrlInput" margin="normal"
                                   value={this.state.urlInput} onChange={this.handelUrlChange}/>
                        <Button id="addUrlButton" variant="contained" color="primary"
                                disabled={this.state.savingNewUrl || this.state.urlInput.length === 0}
                                onClick={this.addNewUrl}>
                            {this.state.savingNewUrl &&
                            <CircularProgress size="15px" style={{color: "white"}}/>}
                            {!this.state.savingNewUrl &&
                            <span>Add</span>
                            }
                        </Button>
                    </Card>
                </div>
                <div className="section-container">
                    <span className="section-title">Stream:</span>
                    <Card id="videoPlayer">
                        {this.state.currentURL &&
                        <img src={"video_feed?videoURL=" + this.state.currentURL} alt={this.state.currentURL}/>
                        }
                        {this.state.selectedIndex !== undefined && this.state.currentURL === undefined && this.state.validURL &&
                        <CircularProgress size="150px" style={{color: "#31409f", position: "relative", top: "30%"}}/>
                        }
                    </Card>
                </div>
            </div>
        );
    }
}

export default UserPage;
