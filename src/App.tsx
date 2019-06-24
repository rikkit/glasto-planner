import React, { useState, useEffect } from 'react';
import Picky from "react-picky";
import * as R from "ramda";
import { Share } from './Share';
import { ISet } from '../data/scraper';
import { getSets, decodeShare, encodeShare } from './utils';
import { Planner } from './Planner';

import './App.scss';
import "react-calendar-timeline/lib/Timeline.css";
import "react-picky/dist/picky.css";

const App: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [myName, setMyName] = useState<string>("me");
  const [mySelection, setMySelection] = useState<string[]>([]);
  const [allSets, setAllSets] = useState<ISet[]>([]);
  const [artistOptions, setArtistOptions] = useState<string[]>([]);
  const [friendArtists, setFriendArtists] = useState<Record<string, number[]>>({});

  // Load set data
  useEffect(() => {
    setLoading(true);

    (async () => {
      const sets = await getSets();

      const artists = R.sortBy(x => x, R.uniq(sets.map(s => s.title)));

      setAllSets(sets);
      setArtistOptions(artists);
      setLoading(false);
    })();
  }, []);

  // Initialise selection from query string
  useEffect(() => {
    const me = decodeShare(new URLSearchParams(window.location.search).get("a") || "");
    setFriendArtists({ ...friendArtists, [me.name]: me.ids });
  }, []);
  
  // Update qs when name or sets change
  useEffect(() => {
    const choices = mySelection.filter(x => !!x);
    const sets = R.innerJoin((set, artist) => set.title == artist, Object.values(allSets).flat(), choices);
    const setIds = sets.map(x => x.id);

    const encoded = encodeShare(myName, setIds);

    const params = new URLSearchParams(window.location.search);
    params.set("a", encoded);
    window.history.pushState("", "", "?" + params.toString());

    setFriendArtists({ ...friendArtists, me: setIds });
  }, [mySelection, myName]);

  const chosenSets = R.innerJoin((set, id) => set.id == id, Object.values(allSets).flat(), friendArtists.me || []);
  const chosenArtists = R.uniq(chosenSets.map(x => x.title));

  return (
    <div className="App">
      {isLoading && "Loading..."}

      <input type="text" value={myName} onChange={e => setMyName(e.currentTarget.value)} />

      <Share addUser={(code) => {
        const choices = decodeShare(code);
        setFriendArtists({ ...friendArtists, [choices.name]: choices.ids });
      }} />

      <div className="columns">
        <div className="column is-half-tablet is-full-mobile">
          <Picky
            open
            keepOpen
            multiple
            includeFilter
            options={artistOptions}
            value={chosenArtists || []}
            onChange={selection => setMySelection(selection as string[])}
          />
        </div>

        <div className="column is-half-tablet is-full-mobile">
          <Planner sets={allSets} choices={friendArtists} />
        </div>
      </div>
    </div>
  );
}

export default App;
