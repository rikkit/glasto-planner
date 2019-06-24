
import { getAllSets, ISet } from "./scraper";
import { writeFileSync } from "fs";
import * as R from "ramda";

getAllSets().then(async (sets) => {
  console.log(`Found ${sets.length} sets 🤘`);

  const sorted = R.sortWith([
    R.ascend<ISet>(x => x.startTime || new Date("2020")),
    R.ascend<ISet>(x => x.stage),
    R.ascend<ISet>(x => x.title),
  ], sets);

  // TODO ids will shift as the list changes - algo needs to match to existing list
  const withId: ISet[] = [];
  for (let i = 0; i < sorted.length; i++) {
    withId.push({ id: i + 1, ...sorted[i] });
  }

  const data = {
    version: "Glasto 2019",
    sets: withId,
  }

  writeFileSync("./public/sets.json", JSON.stringify(data, null, 2));
});

