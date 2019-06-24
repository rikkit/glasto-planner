import React, { useState, useEffect } from 'react';
import Picky, { PickyValue } from "react-picky";
import * as R from "ramda";
import { ISet } from "../data/scraper";

interface OwnProps {
  sets: ISet[];
  value: string[];
  onChange: (x: PickyValue) => void;
}

export const Picker = ({ sets, value, onChange }: OwnProps) => {
  const [currentStages, setStage] = useState<string[]>([]);

  const selectedStages = currentStages.filter(x => !!x);
  const stages = R.sortBy(x => x, R.uniq(sets.map(s => s.stage)));
  const stageSets = sets.filter(set => !selectedStages.length || R.contains(set.stage, selectedStages));
  const artists = R.sortBy(x => x, R.uniq(stageSets.map(set => set.title)));

  return (
    <div className="picker">
      <h3>Stages</h3>
      <Picky
        className="picker__stages"
        multiple
        includeFilter
        options={stages}
        value={currentStages}
        onChange={v => setStage(v as string[])}
      />

      <h3>Artists</h3>
      <Picky
        className="picker__artists"
        multiple
        includeFilter
        options={artists}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}