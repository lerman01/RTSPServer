import React from 'react';
import axios from "axios";

export class PostgresAPI {

    static login(username, password) {
        return axios.post('login', {username: username, password: password});
    };

    static signup(username, password) {
        return axios.post('signup', {username: username, password: password});
    };

    static getUserLinks() {
        return axios.get('userlinks');
    };

    static videoUrlValidation(link) {
        return axios.get('video_validation?videoURL=' + link);
    };

    static insertNewLink(link) {
        return axios.post('addurl', {link: link});
    };

    static removeLink(link) {
        return axios.put('removeurl', {link: link});
    };
}
