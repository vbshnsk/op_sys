interface Node {
    performanceFactor: number;
}

interface Task {
    startTime: number;
    endTime: number;
    computingTime: number;
    schedulingTime: number;
}

type Pair = [Node, Task]

type Schedule = Array<Pair>

export default class Scheduler {

    schedule(tasks: Array<Task>, nodes: Array<Node>): Schedule {
        if (tasks.length !== nodes.length) throw new Error('Tasks length must be the same as nodes.');

        const relativeCompTimesMatrix: Array<Array<number>> = [];
        for (const task of tasks) {
            const compTimesForNode: Array<number> = [];
            for (const node of nodes) {
                compTimesForNode.push(task.computingTime / node.performanceFactor);
            }
            relativeCompTimesMatrix.push(compTimesForNode);
        }

        let weightMatrix: Array<Array<number>> = [];
        for (let i = 0; i < relativeCompTimesMatrix.length; i++) {
            const task = tasks[i];
            const row: Array<number> = [];
            for(let j = 0; j < relativeCompTimesMatrix.length; j++) {
                const value = task.endTime - task.startTime - task.schedulingTime - relativeCompTimesMatrix[i][j];
                row.push(value)
            }
            weightMatrix.push(row);
        }

        const schedule: Schedule = [];

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