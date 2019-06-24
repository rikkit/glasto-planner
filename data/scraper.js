"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const glastoDayToDate = (day) => {
    day = day.toUpperCase();
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
};
const timeOfDayToMs = (HHmm = "") => {
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
};
const parseRowElement = (row) => {
    const [titleEl, stageEl, dayEl, timesEl] = row.children;
    const title = cheerio_1.default(titleEl).text();
    const stage = cheerio_1.default(stageEl).text();
    const matches = cheerio_1.default(timesEl).text().match(/(\d\d:\d\d)/g);
    if (matches) {
        const [setStart, setEnd] = matches;
        const day = cheerio_1.default(dayEl).text();
        const setStartTs = timeOfDayToMs(setStart);
        let startTime = null;
        let endTime = null;
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
        return { title, stage, startTime, endTime };
    }
    else {
        return { title, stage, startTime: null, endTime: null };
    }
};
exports.getAllSets = async () => {
    const setsAzUrl = "https://www.glastonburyfestivals.co.uk/line-up/line-up-2019/?artist";
    const response = await node_fetch_1.default(setsAzUrl);
    const $ = cheerio_1.default.load(await response.text());
    const rows = $(".lineup .letterList > li");
    const sets = [];
    for (let i = 0; i < rows.length; i++) {
        sets.push(parseRowElement(rows[i]));
    }
    return sets.sort((a, b) => a.startTime && b.startTime
        ? a.startTime.valueOf() - b.startTime.valueOf()
        : -1);
};
