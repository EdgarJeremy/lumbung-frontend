import React from 'react';
import ReactDOM from 'react-dom';
import ReactNotification from 'react-notifications-component';
import './index.css';
import 'react-notifications-component/dist/theme.css'
import App from './App';
import reportWebVitals from './reportWebVitals';

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css"

ReactDOM.render(
  <React.StrictMode>
    <ReactNotification />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
