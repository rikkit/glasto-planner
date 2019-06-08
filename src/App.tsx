import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { getSets, IGlastoSet } from './utils/scraper';
import './App.css';


const App: React.FC = () => {
  const [allSets, setSetTimes] = useState<IGlastoSet[]>([]);

  useEffect(() => {
    getSets().then(sets => setSetTimes(sets));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>

      <ul>
        {allSets.map(set => (
          <li>
            {set.title} ({set.stage})
            {set.startTime && set.startTime.toLocaleString()} - {set.endTime && set.endTime.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
