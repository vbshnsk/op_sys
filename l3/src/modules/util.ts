import {Range} from '../@types/range'

export const valueInRange = (range: Range) => Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]


