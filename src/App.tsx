import React, { useState, useEffect } from 'react';
import Picky from "react-picky";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import * as R from "ramda";
import { compressToEncodedURIComponent as compress, decompressFromEncodedURIComponent as decompress } from "lz-string";
import { format, getDate, subDays, differenceInDays, addDays } from "date-fns";

import { getAllSets, ISet } from './utils/scraper';
import { Share } from './Share';
import { Timeline } from './Timeline';

import './App.scss';
import "react-calendar-timeline/lib/Timeline.css";
import "react-picky/dist/picky.css";

const formatDate = (date: Date | null): string => date ? format(date, "ddd HH:mm") : "TBA";

const App: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [allSets, setAllSets] = useState<Record<string, ISet[]>>({});
  const [artistOptions, setArtistOptions] = useState<string[]>([]);
  const [friendArtists, setFriendArtists] = useState<Record<string, string[]>>({});

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
    const choices = (decompress(compressed) || "").split(";").filter(x => !!x);
    setFriendArtists({ ...friendArtists, me: choices });
  }, []);

  // const getSets = (artists: string[]) => R.values(R.pick(artists)(allSets)).flat();
  // const setsByFriend = R.mapObjIndexed(getSets, friendArtists);

  interface ISetInfo extends ISet {
    setNumber: number;
    totalSetCount: number;
    friends: string[];
  }

  const artistsAndFriends = (artists: string[], friend: string) => artists.map(artist => ({ artist, friend }));
  const coolArtists = R.values(R.mapObjIndexed(artistsAndFriends, friendArtists)).flat();
  const friendsByArtist = R.reduceBy((acc, { friend }) => acc.concat(friend), [] as string[], x => x.artist, coolArtists);
  const setsByArtist = R.mapObjIndexed((friends, artist) => {
    const setsForArtist = allSets[artist] || [];
    return setsForArtist.map((set, setNumber) => ({
      ...set,
      setNumber: setNumber + 1,
      totalSetCount: setsForArtist.length,
      friends,
    } as ISetInfo))
  }, friendsByArtist);

  const setsByTime = R.sortBy(x => x.startTime ? x.startTime.valueOf() : -1, R.values(setsByArtist).flat());
  const setsByDay = R.groupBy(({ startTime }) => {
    // Number of full days between day 0 (Weds 26th @ 5am)
    const zero = new Date(2019, 5, 26, 5, 0);
    return (startTime
      ? format(addDays(zero, differenceInDays(startTime, zero)), "ddd")
      : "TBA");
  }, setsByTime)

  return (
    <div className="App">
      {isLoading && "Loading..."}


      <Share addUser={(name, code) => {
        const choices = (decompress(code) || "").split(";");
        setFriendArtists({ ...friendArtists, [name]: choices });
      }} />
      <div className="columns">
        <div className="column is-half-tablet is-full-mobile">
          <Picky
            open
            keepOpen
            multiple
            includeFilter
            options={artistOptions}
            value={friendArtists.me || []}
            onChange={selection => onSelectionChange(selection as string[])}
          />
        </div>

        <div className="column is-half-tablet is-full-mobile">
          <Tabs defaultIndex={0} forceRenderTabPanel>
            <TabList>
              {Object.keys(setsByDay).map(day => <Tab key={`tab-${day}`}>{day}</Tab>)}
            </TabList>

            {Object.keys(setsByDay).map(day => {
              const sets = setsByDay[day];
              return (
                <TabPanel key={`sets-${day}`}>
                  {sets.map((set, i) => (
                    <div key={i}>
                      <h3>{set.title} ({set.setNumber}/{set.totalSetCount})</h3>
                      <p>{formatDate(set.startTime)} - {formatDate(set.endTime)}</p>
                      <p>{set.stage}</p>
                      <p>{set.friends.join(", ")}</p>
                    </div>
                  ))}
                </TabPanel>
              );
            })}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default App;
