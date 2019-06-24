import * as React from "react";
import Picky, { PickyValue } from "react-picky";

interface OwnProps {
  options: string[];
  value: string[];
  onChange: (x: PickyValue) => void;
}

export const Picker = (props: OwnProps) => {
  return (
    <div>
      <Picky
        open
        keepOpen
        multiple
        includeFilter
        {...props}
      />
    </div>
  )
}