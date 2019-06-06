import React from 'react';
import logo from './logo.svg';
import './App.css';

import Getsy from "getsy";

const getSets = async () => {
  const setsAzUrl = "https://www.glastonburyfestivals.co.uk/line-up/line-up-2019/?artist";
  const page = await Getsy(setsAzUrl, { corsProxy: "https://cors-anywhere.herokuapp.com/" });
  const rows = page.getMe(".lineup .letterList > li");
  
  const sets = [];
  for (const row of rows) {
    const title = row.getElementsByClassName("title")[0].textContent; // TODO there's a link here sometimes
    const stage = row.getElementsByClassName("stage")[0].textContent;
    const day = row.getElementsByClassName("day")[0].textContent;
    const times = row.getElementsByClassName("end")[0].textContent; // HH:mm - HH:mm

    sets.push({ title, stage, day, times });
  }

  for (const set of sets) {
    console.log(set);
  }
}

getSets();

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload. 
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
