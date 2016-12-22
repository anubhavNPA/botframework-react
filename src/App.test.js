import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Bob from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<div><Bob /></div>, div);
});
