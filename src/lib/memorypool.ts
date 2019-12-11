import { Transaction } from '../interfaces/transaction.interface'

export interface MemoryPoolRemoval {
    affected: number
    map: Boolean | Boolean[]
}

export class MemoryPool {

    private content: Map<string, Transaction>

    constructor() {
        this.content = new Map<string, Transaction>()
    }

    add(transaction: Transaction) {
        return this.content.set(transaction.hash, transaction)
    }

    remove(target: string | any[]): MemoryPoolRemoval {
        const response = {
            map: typeof target === 'string' ? [this.removeSingle(target)] : this.removeMany(target),
        }
        return {
            ...response,
            affected: response.map.reduce((k, v) => v ? ++k : k, 0)
        }
    }

    private removeMany(hashes: Array<string | Transaction>): Boolean[] {
        return hashes.map(entry => {
            if (typeof entry === 'string') {
                return this.removeSingle(entry)
            } else {
                return this.removeSingle(entry.hash)
            }
        })
    }

    private removeSingle(hash: string): Boolean {
        return this.content.delete(hash)
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