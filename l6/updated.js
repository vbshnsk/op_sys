'use strict'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function drawCat() {
    for (let i = 0; i < 1000; i++) {
        await sleep(1);
    }
}

async function drawDog() {
    for (let i = 0; i < 1000; i++) {
        await sleep(10);
    }
}

async function main() {
    const animal = process.argv[2];

    for (let i = 0; i < 2; i++) {
        switch (animal) {
            case 'cat':
                await drawCat();
                break;
            case 'dog':
                await drawDog();
                break;
            default:
                console.log('unsupported animal');
                break;
        }
    }
}

main().then(() => {
    console.log('done')
});
