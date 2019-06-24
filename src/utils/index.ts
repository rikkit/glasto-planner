
import { ISet } from "../../data/scraper";
import { decompressFromEncodedURIComponent as decompress, compressToEncodedURIComponent as compress } from "lz-string";

/**
 * Load sets from sets.json
 */
export const getSets = async (): Promise<ISet[]> => {
  const response = await fetch("/sets.json");
  const data = await response.json();
  const sets = data.sets as ISet[];
  return sets;
}

export const decodeShare = (compressed: string): { name: string, ids: number[] } => {
  const choices = (decompress(compressed) || "").split(";").filter(x => !!x);
  const name = choices[0];
  const ids = choices.slice(1).map(x => parseInt(x));

  return { name, ids };
}

export const encodeShare = (name: string, ids: number[]): string => {
  const data = [name, ...ids];
  const joined = data.join(";");
  console.log(joined);

  const value = data.length ? compress(joined) : "";
  return value;
}
