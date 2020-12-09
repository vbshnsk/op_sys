import WorkerQueue from './workerqueue'
import {Range} from '../@types/range'
import {valueInRange} from './util';
import Timeout = NodeJS.Timeout;

export default class SyncTickPool {

    private readonly _queue: WorkerQueue;
    private readonly _weightRange: Range;
    private readonly _intervalRange: Range;
    private readonly _tickDuration: number;
    private _tillTaskAddition: number;
    private _timeConsumed: number = 0;
    private _tickInterval: Timeout;
    private _isPooling: boolean;

    constructor(weight: Range, interval: Range, tick: number) {
        this._weightRange = weight;
        this._intervalRange = interval;
        this._tickDuration = tick;
        this._queue = new WorkerQueue();
    }

    public startPooling() {
        this._tillTaskAddition = 0;
        this._tickInterval = setInterval(() => {
            if (!this._isPooling) return;
            if (this._tillTaskAddition <= 0) {
                this._queue.add({
                    weight: valueInRange(this._weightRange),
                    addedOn: Date.now()
                })
                this._tillTaskAddition = valueInRange(this._intervalRange)
            }
            this._queue.executeSync(this._tickDuration);
            this._elapse();
            this._printState();
        }, this._tickDuration);
        this._isPooling = true;
    }

    public stopPooling() {
        this._isPooling = false;
        clearInterval(this._tickInterval);
        this._tickInterval = undefined;
    }

    private _elapse() {
        this._tillTaskAddition -= this._tickDuration;
        this._timeConsumed += this._tickDuration;
    }

    private _printState() {
        console.log(this._timeConsumed);
        console.log(this._queue);
    }

}