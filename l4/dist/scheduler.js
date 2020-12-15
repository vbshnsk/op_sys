"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Scheduler {
    schedule(tasks, nodes) {
        if (tasks.length !== nodes.length)
            throw new Error('Tasks length must be the same as nodes.');
        const relativeCompTimesMatrix = [];
        for (const task of tasks) {
            const compTimesForNode = [];
            for (const node of nodes) {
                compTimesForNode.push(task.computingTime / node.performanceFactor);
            }
            relativeCompTimesMatrix.push(compTimesForNode);
        }
        let weightMatrix = [];
        for (let i = 0; i < relativeCompTimesMatrix.length; i++) {
            const task = tasks[i];
            const row = [];
            for (let j = 0; j < relativeCompTimesMatrix.length; j++) {
                const value = task.endTime - task.startTime - task.schedulingTime - relativeCompTimesMatrix[i][j];
                row.push(value);
            }
            weightMatrix.push(row);
        }
        const schedule = [];
        let taskIndex = 0;
        while (weightMatrix.length != 0) {
            const taskRow = weightMatrix.pop();
            const max = taskRow.reduce((prev, cur) => Math.max(prev, cur));
            const maxIndex = taskRow.findIndex(v => v === max);
            const maxNode = nodes[maxIndex];
            schedule.push([maxNode, tasks[taskIndex]]);
            for (const row of weightMatrix) {
                row.splice(maxIndex, 1);
            }
            nodes.splice(maxIndex, 1);
            taskIndex++;
        }
        return schedule;
    }
}
exports.default = Scheduler;
