import React, { useState, useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import * as R from "ramda";
import { format, differenceInDays, addDays } from "date-fns";
import { ISet } from "../data/scraper";

interface OwnProps {
  sets: ISet[];
  choices: Record<string, number[]>;
}

interface ISetInfo extends ISet {
  setNumber: number;
  totalSetCount: number;
  friends: string[];
}

const formatDate = (date: Date | null): string => date ? format(date, "ddd HH:mm") : "TBA";

export const Planner = ({ choices, sets }: OwnProps) => {

  // Such efficiency
  const friendsAndSets = Object.values(R.mapObjIndexed((setIds, friend) => setIds.map(id => ({ id, friend })), choices)).flat();
  const friendsAndSetsBySetId = R.groupBy(x => x.id.toString(), friendsAndSets);
  const friendsBySetId = R.mapObjIndexed(fas => fas.map(x => x.friend), friendsAndSetsBySetId);
  const setsByArtist = R.groupBy(x => x.title, sets);
  const allSets = R.mapObjIndexed((friends, id) => {
    const set = sets.find(x => x.id == parseInt(id))!;
    const setGroup = setsByArtist[set.title];

    return {
      ...set,
      setNumber: setGroup.findIndex(x => x.id == set.id) + 1,
      totalSetCount: setGroup.length,
      friends,
    } as ISetInfo;
  }, friendsBySetId);

  const setsByTime = R.sortBy(x => x.startTime ? x.startTime.valueOf() : -1, R.values(allSets).flat());
  const setsByDay = R.groupBy(({ startTime }) => {
    // Number of full days between day 0 (Weds 26th @ 5am)
    const zero = new Date(2019, 5, 26, 5, 0);
    return (startTime
      ? format(addDays(zero, differenceInDays(startTime, zero)), "ddd")
      : "TBA");
  }, setsByTime)

  return (
    <div className="schedule">
      <h3>Schedule</h3>
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
  )
}