
import * as R from "ramda";
import React, { useState, useEffect } from 'react';
import RCTimeline, { TimelineItem, TimelineGroup } from "react-calendar-timeline";
import moment from "moment";
import { ISet } from "../data/scraper";

interface SetTimelineItem extends TimelineItem {
  itemProps: {
    friends: string[];
  };
}

interface Props {
  setsByFriend: { [name: string]: ISet[] };
}

export const Timeline = ({ setsByFriend }: Props) => {
  const [timelineItems, setTimelineItems] = useState<SetTimelineItem[]>([]);
  const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([]);

  useEffect(() => {
    (async () => {
      let items: { [id: string]: SetTimelineItem } = {};
      let groups: TimelineGroup[] = [];
      for (const friend of Object.keys(setsByFriend)) {
        for (const set of setsByFriend[friend]) {
          if (!set.startTime || !set.endTime) {
            continue;
          }

          let groupId = groups.findIndex(g => g.title === set.stage);
          if (groupId < 0) {
            groupId = groups.length + 1;
            groups.push({
              id: groupId,
              title: set.stage,
            })
          }

          const itemId = parseInt(`${groupId}${set.startTime.valueOf()}`); // 🤔

          const match = items[itemId];
          if (match) {
            match.itemProps.friends = [ ...match.itemProps.friends, friend ];
          }
          else {
            items[itemId] = {
              id: itemId,
              title: set.title,
              group: groupId,
              start_time: set.startTime.valueOf(),
              end_time: set.endTime.valueOf(),
              itemProps: {
                friends: [friend],
              }
            };
          }
        }
      }

      setTimelineItems(R.values(items));
      setTimelineGroups(groups);
    })();
  }, [ setsByFriend ]);

  return (
    <RCTimeline
      defaultTimeStart={moment("2019-06-26").valueOf()}
      defaultTimeEnd={moment("2019-07-01").valueOf()}
      groups={timelineGroups}
      items={timelineItems}
    />
  );
}