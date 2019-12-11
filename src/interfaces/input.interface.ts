import { Output } from './output.interface';

export interface Input {
    address: string
    previous_output: Output
    script: string
    sequence: number
}