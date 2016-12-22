import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';

class DirectLineClient {
  constructor(secret) {
    this.secret = secret;
    this.token = '';
    this.conversationId = '';
    this.streamUrl = '';
  }

  startConversation() {
    var self = this;
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + self.token);

    return new Promise(function (resolve, reject) {
      if (self.conversationId !== '') {
        resolve({});
        return;
      }

      fetch('https://directline.botframework.com/v3/directline/conversations', { method: 'POST', headers: headers }).then(function (response) {
        if (!response.ok) {
          reject(response.statusText);
        }
        else {
          response.json().then(function (data) {
            self.streamUrl = data.streamUrl;
            self.conversationId = data.conversationId;
            resolve(data);
          });
        }
      });
    });
  }

  refreshToken() {
    var self = this;

    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + self.token);

    return new Promise(function (resolve, reject) {
      fetch('https://directline.botframework.com/v3/directline/tokens/refresh', { method: 'POST', headers: headers }).then(function (response) {
        if (!response.ok) {
          reject(response.statusText);
        }
        else {
          response.json().then(function (data) {
            self.token = data.token;
            resolve(data);
          });
        }
      });
    });
  }


  getMessages(streamEvent) {
    var self = this;

    return new Promise(function (resolve, reject) {

      self.secretToToken().then(function () {
        self.startConversation().then(function () {
          // stream url
          var exampleSocket = new WebSocket(self.streamUrl);
          exampleSocket.onmessage = function (event) {
            streamEvent(JSON.parse(event.data));
          }
        }).catch(function (startConversationExeption) {
          console.log('startConversationExeption:' + JSON.stringify(startConversationExeption));
        });
      }).catch(function (secretToTokenException) {
        console.log('secretToTokenException:' + JSON.stringify(secretToTokenException));
      });
    });
  }


  secretToToken() {
    var self = this;

    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + self.secret);

    return new Promise(function (resolve, reject) {
      fetch('https://directline.botframework.com/v3/directline/tokens/generate', { method: 'POST', headers: headers }).then(function (response) {
        if (!response.ok) {
          reject(response.statusText);
        }
        else {
          response.json().then(function (data) {
            self.token = data.token;
            resolve(data);
          });
        }
      });
    });
  }

  postMessage(text, from) {
    var self = this;

    self.secretToToken().then(function () {
      self.startConversation().then(function () {
        var activity = { type: 'message', text: text, from: { id: from } };

        var headers = new Headers();
        headers.append('Authorization', 'Bearer ' + self.token);
        headers.append('Content-Type', 'application/json');

        return new Promise(function (resolve, reject) {
          fetch('https://directline.botframework.com/v3/directline/conversations/' + self.conversationId + '/activities', { method: 'POST', headers: headers, body: JSON.stringify(activity), mode: 'cors' }).then(function (response) {
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
      }).catch(function (startConversationExeption) {
        console.log('startConversationExeption:' + JSON.stringify(startConversationExeption));
      });
    }).catch(function (secretToTokenException) {
      console.log('secretToTokenException:' + JSON.stringify(secretToTokenException));
    });
  }
}


function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.id}>{number.text}</li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

class BotClientComponent extends Component {
  constructor() {
    super();
    var self = this;
    this.state = {
      messages: []
    };

    this.directLineClient = new DirectLineClient('80fC1ZWjgYg.cwA._aw.N4uV2Xza27jcWN_NpPNLn44b7bj9DxfQK4tm0vMgeYM');
    this.directLineClient.getMessages(function (streamData) {
      var arrayvar = self.state.messages.slice()
      arrayvar.push(...streamData.activities)
      self.setState({ messages: arrayvar })
      console.log(self.state.messages);
    }); // start streaming
  }

  handleClick() {
    var self = this;
    self.directLineClient.postMessage('Leeds, UK', 'james');
  }

  render() {
    return (
      <div>
        <NumberList numbers={this.state.messages} />,
        <button onClick={this.handleClick.bind(this)}>Send message</button>
      </div>
    );
  }
}

export default BotClientComponent;
