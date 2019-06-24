"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const scraper_1 = require("./scraper");
const fs_1 = require("fs");
const R = __importStar(require("ramda"));
scraper_1.getAllSets().then(async (sets) => {
    console.log(`Found ${sets.length} sets 🤘`);
    const sorted = R.sortWith([
        R.ascend(x => x.startTime || new Date("2020")),
        R.ascend(x => x.stage),
        R.ascend(x => x.title),
    ], sets);
    // TODO ids will shift as the list changes - algo needs to match to existing list
    const withId = [];
    for (let i = 0; i < sorted.length; i++) {
        withId.push(Object.assign({ id: i + 1 }, sorted[i]));
    }
    const data = {
        version: "Glasto 2019",
        sets: withId,
    };
    fs_1.writeFileSync("./public/sets.json", JSON.stringify(data, null, 2));
});
