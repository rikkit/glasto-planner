import React, { useState, useEffect } from 'react';
import moment from "moment";
import Timeline, { TimelineItem, TimelineGroup } from "react-calendar-timeline";
import { getSets, IGlastoSet } from './utils/scraper';

import './App.css';
import "react-calendar-timeline/lib/Timeline.css";


const App: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([]);

  useEffect(() => {
    setLoading(true);

    (async () => {
      const sets = await getSets();

      const filteredSets = sets//.filter(x => x.title.includes("EMERSON"));

      let counter = 0;
      let items: TimelineItem[] = [];
      let groups: TimelineGroup[] = [];
      for (const set of filteredSets) {
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
      setLoading(false);
    })();
  }, []);

  return (
    <div className="App">
      {isLoading && "Loading..."}

      <Timeline
        defaultTimeStart={moment("2019-06-26").valueOf()}
        defaultTimeEnd={moment("2019-07-01").valueOf()}
        groups={timelineGroups}
        items={timelineItems}
      />
    </div>
  );
}

export default App;
