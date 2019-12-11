import { Transaction } from './transaction.interface';

export interface Block {
    hash: string
    transactions: Transaction[]
    number?: number
}