import React from 'react';
import ReactDOM from 'react-dom';
import "./global.css";
import App from './App';

const now = new Date().getTime();

ReactDOM.render(
    now>1593741168000?"软件过期":<App />,
  document.getElementById('root')
);

