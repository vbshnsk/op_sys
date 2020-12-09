import WorkerQueue from './workerqueue';
import {Range} from '../@types/range'
import {valueInRange} from "./util";
import Task from "../@types/task";

export default class AsyncPool {
    private readonly _queue: WorkerQueue;
    private readonly _executedTasks: Array<Task & {executedOn: number}>;
    private readonly _weightRange: Range;
    private readonly _intervalRange: Range;
    private _timeConsumed: number = 0;
    private _isPooling: boolean;
    private _executionPromise: Promise<never>;
    private _taskAdditionPromise: Promise<never>;

    constructor(weight: Range, interval: Range) {
        this._weightRange = weight;
        this._intervalRange = interval;
        this._queue = new WorkerQueue();
        this._executedTasks = [];
    }

    public startPooling() {
        this._isPooling = true;
        this._timeConsumed = 0;
        this._taskAdditionPromise = new Promise(async () => {
            while (this._isPooling) {
                this._queue.add({
                    weight: valueInRange(this._weightRange),
                    addedOn: Date.now()
                })
                await new Promise(res => setTimeout(res, valueInRange(this._intervalRange)));
            }
        });
        this._executionPromise = new Promise(async () => {
            while (this._isPooling) {
                const executed = await this._queue.executeAsync();
                if (executed.weight != 0) {
                    this._printState();
                    this._timeConsumed += executed.weight;
                    this._executedTasks.push(executed);
                }
            }
        });

    }

    public stopPooling() {
        this._isPooling = false;
    }

    private _printState() {
        console.log('Time consumed overall:', this._timeConsumed);
        console.log('Current queue:')
        console.dir(this._queue);
        console.log('Executed tasks:')
        for (const executedTask of this._executedTasks) {
            console.log('weight: ' + executedTask.weight, 'time consumed: ' + (executedTask.executedOn - executedTask.addedOn))
        }
    }
}