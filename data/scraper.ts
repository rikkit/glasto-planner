
import Cheerio from "cheerio";
import fetch from "node-fetch";

type GlastoDay = "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface ISet {
  id: number;
  title: string;
  stage: string;
  startTime: Date | null;
  endTime: Date | null; // null == TBA
}

const glastoDayToDate = (day: string): Date => {
  day = day.toUpperCase() as GlastoDay;
  switch (day) {
    case "WEDNESDAY":
      return new Date(2019, 5, 26);
    case "THURSDAY":
      return new Date(2019, 5, 27);
    case "FRIDAY":
      return new Date(2019, 5, 28);
    case "SATURDAY":
      return new Date(2019, 5, 29);
    case "SUNDAY":
      return new Date(2019, 5, 30);
    default:
      throw new Error(`Unhandled day ${day}`);
  }
}

const timeOfDayToMs = (HHmm: string = ""): number | null => {
  const match = HHmm.match(/(\d\d):(\d\d)/);
  if (match) {
    const [_, HH, mm] = match;
    const hoursInMs = parseInt(HH) * 60 * 60 * 1000;
    const minutesInMs = parseInt(mm) * 60 * 1000;
    return hoursInMs + minutesInMs;
  }
  else {
    return null;
  }
}

const parseRowElement = (row: CheerioElement): ISet => {  
  const [titleEl, stageEl, dayEl, timesEl] = row.children;

  const title = Cheerio(titleEl).text();
  const stage = Cheerio(stageEl).text();

  const matches = Cheerio(timesEl).text().match(/(\d\d:\d\d)/g);
  if (matches) {
    const [setStart, setEnd] = matches;

    const day = Cheerio(dayEl).text();
    const setStartTs = timeOfDayToMs(setStart);
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    if (setStartTs != null && !!day) {
      const startTimeTs = glastoDayToDate(day).valueOf() + setStartTs;
      startTime = new Date(startTimeTs);

      const setEndTs = timeOfDayToMs(setEnd);
      if (setEndTs != null) {
        const setLengthTs = setEndTs > setStartTs
          ? setEndTs - setStartTs // Same day
          : (24 * 60 * 60 * 1000 - setStartTs) + setEndTs; // Crosses midnight
        endTime = new Date(startTimeTs + setLengthTs);
      }
    }

    return { title, stage, startTime, endTime } as ISet;
  }
  else {
    return { title, stage, startTime: null, endTime: null } as ISet;
  }
}

export const getAllSets = async (): Promise<ISet[]> => {
  const setsAzUrl = "https://www.glastonburyfestivals.co.uk/line-up/line-up-2019/?artist";


  const response = await fetch(setsAzUrl);
  const $ = Cheerio.load(await response.text());
  const rows = $(".lineup .letterList > li");

  const sets: ISet[] = [];
  for (let i = 0; i < rows.length; i++) {
    sets.push(parseRowElement(rows[i]));
  }

  return sets.sort((a, b) => a.startTime && b.startTime
    ? a.startTime.valueOf() - b.startTime.valueOf()
    : -1
  );
}

