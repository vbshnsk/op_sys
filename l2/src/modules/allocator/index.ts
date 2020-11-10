import {Descriptor, Page, Block} from './index.d';

export default class Allocator {
    private _freeMemory: number;
    private readonly _pageSize: number;
    private readonly _freePages: {[key: number]: Array<Page>};
    private readonly _descriptors: Array<Descriptor>;

    constructor() {
        this._freeMemory = 1024;
        this._pageSize = 256;
        this._freePages = {};
        this._descriptors = [];
    }

    public alloc(size: number): Block {
        if (size <= this._pageSize / 2) {
            let block: Block,
                descriptor: Descriptor,
                page: Page;
            const closestPowerOfTwo = Math.ceil(Math.log2(size));

            if (this._freePages[closestPowerOfTwo] !== undefined) {
                page = this._freePages[closestPowerOfTwo][0];
                block = page.blocks.shift();
                if (block === undefined) throw new ReferenceError('Page does not have a free block.');
                descriptor = this._descriptors.find(v => v.freePtr === block);
                if (descriptor === undefined) throw new ReferenceError('No descriptor exists for this page.');
            }
            else {
                const allocSize = Math.pow(2, closestPowerOfTwo);
                if (this._freeMemory === 0) throw new Error('Not enough memory.');
                this._freeMemory -= this._pageSize;
                this._freePages[closestPowerOfTwo] = [];
                page = {
                    blocks: null
                }
                descriptor = {
                    blockSize: Math.pow(2, closestPowerOfTwo),
                    free: this._pageSize / allocSize,
                    freePtr: null
                }
                page.blocks = Array(descriptor.free).fill(Buffer.alloc(allocSize));
                descriptor.freePtr = page.blocks[0];
                this._freePages[closestPowerOfTwo].unshift(page);
                this._descriptors.unshift(descriptor);
                block = page.blocks.shift();
            }
            descriptor.free--;

            if (page.blocks.length === 0) {
                this._freePages[closestPowerOfTwo].shift();
                descriptor.freePtr = null;
                if (this._freePages[closestPowerOfTwo].length === 0) {
                    delete this._freePages[closestPowerOfTwo];
                }
            }
            else {
                descriptor.freePtr = page.blocks[0];
            }

            return block;
        }
        else {
            const pagesToAllocate = Math.ceil(size / this._pageSize);
            const memoryNeeded = this._pageSize * pagesToAllocate;
            if (this._freeMemory < memoryNeeded) throw new Error('Not enough memory.');
            this._freeMemory -= memoryNeeded;
            const block: Block = Buffer.alloc(memoryNeeded);

            for (let i = 0; i < pagesToAllocate; i++) {
                this._descriptors.push({
                    freePtr: null,
                    blockSize: i === 0 ? memoryNeeded : 0,
                    free: 0
                });
            }

            return block;
        }
    }

    public free(ptr: Block) {
        const size = ptr.length;
        const power = Math.ceil(Math.log2(size));
        const descriptor = this._descriptors.find(v => v.blockSize === Math.pow(2, power) || v.blockSize === size);

        if (!descriptor) throw new Error();

        if (power >= Math.log2(this._pageSize)) {
            const i = this._descriptors.findIndex(v => v === descriptor);
            do {
                this._freeMemory += this._pageSize;
                this._descriptors.splice(i, 1);
            } while (this._descriptors[i]?.blockSize === 0);
        }
        else {
            if (this._freePages[power] === undefined) {
                this._freePages[power] = [];
                this._freePages[power].unshift({
                    blocks: []
                });
            }

            this._freePages[power][0].blocks.unshift(ptr);
            descriptor.freePtr = ptr;
            descriptor.free++;
        }
    }

    public realloc(ptr: Block, newSize: number): Block {
        const newBlock = this.alloc(newSize);
        ptr.copy(newBlock, 0, 0, newBlock.length);
        this.free(ptr);
        return newBlock;
    }

}