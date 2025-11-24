import React from "react";
import './index.css';
import ReactDOM from "react-dom/client";
import App from "./App";
import Web3Provider from "./hooks/Web3Provider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
