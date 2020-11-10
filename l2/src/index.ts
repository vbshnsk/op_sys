import Allocator from './modules/allocator';

const a = new Allocator();

let ptr = a.alloc(4);
ptr.write('test');
console.log("\nAllocating a single 4 byte memory block by calling a.alloc(4) and writing 'test' to it. Result:", ptr)
console.log("Resulting allocator structure:")
console.dir(a);

ptr = a.realloc(ptr, 178);
console.log("\nResizing it to a multi page memory block by calling a.realloc(ptr, 178). Result:", ptr);
console.log("Resulting allocator structure:")
console.dir(a);

a.free(ptr);
console.log("\nFreeing the memory by calling a.free(ptr).");
console.log("Resulting allocator structure:")
console.dir(a);

