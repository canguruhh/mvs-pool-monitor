import { MemoryPool } from './lib/memorypool';
import { NodeManager } from './lib/nodemanager';
import { Transaction } from './interfaces/transaction.interface';

const observedNodes = [
    {
        name: 'node1',
        host: 'ws://127.0.0.1:8821/ws'
    }
]

const manager = new NodeManager({
    memoryPool: new MemoryPool(),
    onBlock: (block, affectedPoolTransactions, node) => {
        node.logger.info(`received new block ${block.hash} height ${block.number}`)
        node.logger.info(`removed ${affectedPoolTransactions.count} transactions from pool.`)
        if (node.memoryPool) {
            node.logger.debug(`new pool size is ${node.memoryPool.count()}`)
        }
        block.transactions.forEach((transaction: Transaction)=>{
            node.logger.info(`confirmed transaction ${transaction.hash}`)
        })
    },
    onTransaction: (transaction, affectedPoolTransactions, node) => {
        if (affectedPoolTransactions.count) {
            node.logger.debug('new unconfirmed transaction', transaction.hash)
            if (node.memoryPool) {
                node.logger.debug(`new pool size is ${node.memoryPool.count()}`)
            }
        }
    },
    onConnect: (connection, node) => {
        node.logger.info(`connection established`)
    },
})


observedNodes.map(config => manager.addNode(config))