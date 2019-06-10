import React, { useState, useEffect } from 'react';
import Picky from "react-picky";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import * as R from "ramda";
import { compressToEncodedURIComponent as compress, decompressFromEncodedURIComponent as decompress } from "lz-string";
import { getAllSets, ISet } from './utils/scraper';
import { Share } from './Share';
import { Timeline } from './Timeline';

import './App.scss';
import "react-calendar-timeline/lib/Timeline.css";
import "react-picky/dist/picky.css";

type SetsByArtist = { [artist: string]: ISet[] };
type ChoicesByFriend = { [name: string]: string[] };

const App: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [allSets, setAllSets] = useState<SetsByArtist>({});
  const [artistOptions, setArtistOptions] = useState<string[]>([]);
  const [friendArtists, setFriendArtists] = useState<ChoicesByFriend>({});

  const onSelectionChange = (choices: string[]) => {
    choices = choices.filter(x => !!x);

    const params = new URLSearchParams(window.location.search);
    const value = choices.length ? compress(choices.join(";")) : "";
    params.set("a", value);
    window.history.pushState("", "", "?" + params.toString());

    setFriendArtists({ ...friendArtists, me: choices });
  }

  // Load set data
  useEffect(() => {
    setLoading(true);

    (async () => {
      const sets = await getAllSets();

      const groupedByArtists = R.groupBy(set => set.title, R.sortBy(set => set.title, sets));
      const options = Object.keys(groupedByArtists);

      setAllSets(groupedByArtists);
      setArtistOptions(options);
      setLoading(false);
    })();
  }, []);

  // Initialise selection from query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get("a") || "";
    const choices = (decompress(compressed) || "").split(";");
    setFriendArtists({ ...friendArtists, me: choices });
  }, []);

  const getSets = (artists: string[]) => R.values(R.pick(artists)(allSets)).flat();
  const setsByFriend = R.mapObjIndexed(getSets, friendArtists);

  return (
    <div className="App">
      {isLoading && "Loading..."}

      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Artists</Tab>
          <Tab>Timeline</Tab>
          <Tab>Share</Tab>
        </TabList>

        <TabPanel>
          <Picky
            open
            keepOpen
            multiple
            includeFilter
            options={artistOptions}
            value={friendArtists.me || []}
            onChange={selection => onSelectionChange(selection as string[])}
          />
        </TabPanel>

        <TabPanel>
          <Timeline setsByFriend={setsByFriend} />
        </TabPanel>

        <TabPanel>
          <Share addUser={(name, code) => {
            const choices = (decompress(code) || "").split(";");
            setFriendArtists({ ...friendArtists, [name]: choices });
          }} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
