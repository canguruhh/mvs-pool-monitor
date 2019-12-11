import { Output } from './output.interface';
import { Input } from './input.interface';

export interface Transaction {
    hash: string
    height: number
    inputs: Input[]
    lock_time: number
    outputs: Output[]
}