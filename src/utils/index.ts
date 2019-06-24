
import { ISet } from "../../data/scraper";

/**
 * Load sets from sets.json
 */
export const getSets = async (): Promise<ISet[]> => {
  const response = await fetch("/sets.json");
  const data = await response.json();
  const sets = data.sets as ISet[];
  return sets;
}