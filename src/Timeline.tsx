
import React, { useState, useEffect } from 'react';
import RCTimeline, { TimelineItem, TimelineGroup } from "react-calendar-timeline";
import moment from "moment";
import { ISet } from './utils/scraper';

import "react-tabs/style/react-tabs.css";

interface Props {
  sets: ISet[]
}

export const Timeline = ({ sets }: Props) => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([]);

  useEffect(() => {
    (async () => {
      let counter = 0;
      let items: TimelineItem[] = [];
      let groups: TimelineGroup[] = [];
      for (const set of sets) {
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

        items.push({
          id: ++counter,
          title: set.title,
          group: groupId,
          start_time: set.startTime.valueOf(),
          end_time: set.endTime.valueOf(),
        });
      }

      setTimelineItems(items);
      setTimelineGroups(groups);
    })();
  }, []);

  return (
    <RCTimeline
      defaultTimeStart={moment("2019-06-26").valueOf()}
      defaultTimeEnd={moment("2019-07-01").valueOf()}
      groups={timelineGroups}
      items={timelineItems}
    />
  );
}