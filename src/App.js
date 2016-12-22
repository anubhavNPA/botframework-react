import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import DirectLineClient from './DirectLineClient'
import _ from 'underscore';

function MessageList(props) {
  const messages = props.messages;
  const listItems = messages.map((message) =>
    <li key={message.id}>{message.text}</li>
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
      messages: [],
      message: ''
    };

    this.handleChange = this.handleChange.bind(this);

    this.directLineClient = new DirectLineClient('80fC1ZWjgYg.cwA._aw.N4uV2Xza27jcWN_NpPNLn44b7bj9DxfQK4tm0vMgeYM');
    this.directLineClient.getMessages(function (streamData) {
      var arrayvar = self.state.messages.slice();
      arrayvar.push(...streamData.activities);
      var sorted = _.sortBy(arrayvar, 'id');
      self.setState({ messages: sorted });
    }); // start streaming
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  postMessage() {
    this.directLineClient.postMessage(this.state.message, 'james');
  }

  render() {
    return (
      <div>
        <MessageList messages={this.state.messages} />
        <input type='text' value={this.state.message} onChange={this.handleChange} />
        <button onClick={this.postMessage.bind(this)}  >Send message</button>
      </div>
    );
  }
}

export default BotClientComponent;
