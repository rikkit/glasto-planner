import React, { useState, useEffect } from 'react';
import Picky from "react-picky";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import * as R from "ramda";
import { compressToEncodedURIComponent as compress, decompressFromEncodedURIComponent as decompress } from "lz-string";
import { getSets, ISet } from './utils/scraper';
import { Timeline } from './Timeline';

import './App.scss';
import "react-calendar-timeline/lib/Timeline.css";
import "react-picky/dist/picky.css";

type SetsByArtist = { [artist: string]: ISet[] };

const App: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [allSets, setAllSets] = useState<SetsByArtist>({});
  const [artistOptions, setArtistOptions] = useState<string[]>([]);
  const [chosenArtists, setChosenArtists] = useState<string[]>([]);

  const onSelectionChange = (selection: string[]) => {
    selection = selection.filter(x => !!x);

    const params = new URLSearchParams(window.location.search);
    const value = selection.length ? compress(selection.join(";")) : "";
    params.set("a", value);

    window.history.pushState("", "", "?" + params.toString());
    setChosenArtists(selection);
  }

  // Load set data
  useEffect(() => {
    setLoading(true);

    (async () => {
      const sets = await getSets();

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
    setChosenArtists(choices);
  }, [])

  const chosenSetsByArtist = R.pick(chosenArtists)(allSets);
  const setsForTimeline = R.values(chosenSetsByArtist).flat();

  return (
    <div className="App">
      {isLoading && "Loading..."}

      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Artists</Tab>
          <Tab>Timeline</Tab>
        </TabList>

        <TabPanel>
          <Picky
            open
            keepOpen
            multiple
            includeFilter
            options={artistOptions}
            value={chosenArtists}
            onChange={selection => onSelectionChange(selection as string[])}
          />
        </TabPanel>

        <TabPanel>
          <Timeline sets={setsForTimeline} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
