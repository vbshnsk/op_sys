import SyncTickPool from "./modules/SyncTickPool";
import AsyncPool from "./modules/AsyncPool";

const syncTickPool = new SyncTickPool([8000, 10000], [5000, 15000], 1000);
const asyncPool = new AsyncPool([2000, 4000], [500, 2500]);

const mainSync = async () => {
    syncTickPool.startPooling();
    await new Promise(res => setTimeout(res, 30000));
    syncTickPool.stopPooling();
}

const mainAsync = async () => {
    asyncPool.startPooling();
    await new Promise(res => setTimeout(res, 30000));
    asyncPool.stopPooling();
}

mainAsync();