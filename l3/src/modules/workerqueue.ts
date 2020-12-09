import Task from "../@types/task";

export default class WorkerQueue {

    private _tasks: Array<Task> = []

    executeSync(tickDuration: number) {
        const taskToExecute = this._tasks.shift();
        if (taskToExecute == undefined) return;
        taskToExecute.weight -= tickDuration;
        if (taskToExecute.weight <= 0) {
            return;
        }
        this._tasks.unshift(taskToExecute);
    }

    async executeAsync(): Promise<Task & {executedOn: number}> {
        const taskToExecute = this._tasks.shift();
        if (taskToExecute == undefined) {
            await new Promise(res => setTimeout(res, 100));
            return {
                weight: 0,
                addedOn: 0,
                executedOn: 0
            };
        }
        await new Promise(res => setTimeout(res, taskToExecute.weight));
        return {
            weight: taskToExecute.weight,
            addedOn: taskToExecute.addedOn,
            executedOn: Date.now()
        };
    }

    add(task: Task) {
        this._tasks.unshift(task);
    }
}