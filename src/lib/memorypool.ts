import { Transaction } from '../interfaces/transaction.interface'

export interface MemoryPoolRemoval {
    count: number
    map: string[]
}

export class MemoryPool {

    private content: Map<string, Transaction>

    constructor() {
        this.content = new Map<string, Transaction>()
    }

    add(transaction: Transaction) {
        return this.content.set(transaction.hash, transaction)
    }

    remove(target: string | Array<string|Transaction>): MemoryPoolRemoval {
        const response = {
            map: typeof target === 'string' ? [this.removeSingle(target)] : this.removeMany(target),
        }
        return {
            ...response,
            count: response.map.reduce((k, v) => v !== undefined ? ++k : k, 0)
        }
    }

    private removeMany(hashes: Array<string | Transaction>): string[] {
        return hashes.map(entry => {
            if (typeof entry === 'string') {
                return this.removeSingle(entry)
            } else {
                return this.removeSingle(entry.hash)
            }
        }).filter(v=>v!==undefined)
    }

    private removeSingle(hash: string): string {
        return this.content.delete(hash) ? hash : undefined
    }

    get(hash: string) {
        return this.content.get(hash)
    }

    getAll(): Transaction[] {
        return Array.from(this.content.values())
    }

    count() {
        return this.content.size
    }

    clear() {
        return this.content.clear()
    }

}