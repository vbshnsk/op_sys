"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler_1 = require("./scheduler");
const scheduler = new scheduler_1.default();
const main = () => {
    const nodes = [{ performanceFactor: 0.1 }, { performanceFactor: 0.7 }, { performanceFactor: 0.5 }, { performanceFactor: 1 }];
    const tasks = [
        {
            startTime: 1,
            endTime: 5,
            computingTime: 2,
            schedulingTime: 1,
        },
        {
            startTime: 3,
            endTime: 7,
            computingTime: 1,
            schedulingTime: 2,
        },
        {
            startTime: 2,
            endTime: 4,
            computingTime: 1,
            schedulingTime: 1,
        },
        {
            startTime: 1,
            endTime: 5,
            computingTime: 2,
            schedulingTime: 1,
        },
    ];
    console.log(scheduler.schedule(tasks, nodes));
};
main();
