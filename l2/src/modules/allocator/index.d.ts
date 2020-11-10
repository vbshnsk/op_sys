type Block = Buffer;

export interface Page {
    blocks: Array<Block>
}

export interface Descriptor {
    freePtr: Block;
    blockSize: number;
    free: number;
}