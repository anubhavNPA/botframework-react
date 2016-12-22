import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import 'whatwg-fetch';

/** 
class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>hdsdellodsdsWelcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}*/


class DirectLineClient {

  startConversation(secretOrToken) {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + secretOrToken);

    return new Promise(function (resolve, reject) {
      fetch('https://directline.botframework.com/v3/directline/conversations', { method: 'POST', headers: headers }).then(function (response) {
        if (!response.ok) {
          reject(response.statusText);
        }
        else {
          response.json().then(function (data) {
            resolve(data);
          });
        }
      });
    });
  }

  refreshToken(token) {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token);

    return new Promise(function (resolve, reject) {
      fetch('https://directline.botframework.com/v3/directline/tokens/refresh', { method: 'POST', headers: headers }).then(function (response) {
        if (!response.ok) {
          reject(response.statusText);
        }
        else {
          response.json().then(function (data) {
            resolve(data);
          });
        }
      });
    });
  }

  secretToToken(secret) {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + secret);

    return new Promise(function (resolve, reject) {
      fetch('https://directline.botframework.com/v3/directline/tokens/generate', { method: 'POST', headers: headers }).then(function (response) {
        if (!response.ok) {
          reject(response.statusText);
        }
        else {
          response.json().then(function (data) {
            resolve(data);
          });
        }
      });
    });
  }

  postMessage(secretOrToken, conversationId, text, from) {
    var activity = { type: 'message', text: text, from: {id: from}};

    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + secretOrToken);
    headers.append('Content-Type', 'application/json');

    return new Promise(function (resolve, reject) {
      fetch('https://directline.botframework.com/v3/directline/conversations/' + conversationId +'/activities', { method: 'POST', headers: headers, body: JSON.stringify(activity), mode: 'cors' }).then(function (response) {
        if (!response.ok) {
          reject(response.statusText);
        }
        else {
          response.json().then(function (data) {
            resolve(data);
          });
        }
      });
    });
  }
}

class Bob extends Component {
  constructor() {
    super();
    this.directLineClient = new DirectLineClient();
  }

  handleClick() {
    var self = this;
    var conversationId = '';
    var token = '';

    self.directLineClient.secretToToken('80fC1ZWjgYg.cwA._aw.N4uV2Xza27jcWN_NpPNLn44b7bj9DxfQK4tm0vMgeYM').then(function (secretToTokenData) {
      console.log('secretToTokenData=' + JSON.stringify(secretToTokenData));
      var token = secretToTokenData.token;
      self.directLineClient.startConversation(token).then(function(startConversationData) {
          console.log("startConversationData=" + JSON.stringify(startConversationData));
          self.directLineClient.refreshToken(token).then(function(refreshTokenData) {
            console.log("refreshTokenData=" + JSON.stringify(refreshTokenData));
            token = refreshTokenData.token;
            conversationId = refreshTokenData.conversationId;
            
            self.directLineClient.postMessage(token, conversationId, 'Leeds, UK', 'test').then(function(postMessageData) {
              console.log('postMessageData=' + JSON.stringify(postMessageData));
            }).catch(function(error) {
              console.log('Error: ' + error);
            });

          }).catch(function(error) {
              console.log('Error: ' + error);
          });
      }).catch(function(error) {
          console.log('Error: ' + error);
      });
    }).catch(function (error) {
      console.log('Error: ' + error);
    });
  }

  render() {
    return (
      <div className="Bob">
        <button className="square" onClick={this.handleClick.bind(this)}>Click me</button>
      </div>
    );
  }
}

export default Bob;
