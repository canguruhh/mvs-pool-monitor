import { Node } from './lib/node';
import { MemoryPool } from './lib/memorypool';
import { NodeManager } from './nodemanager';

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
        node.logger.info(`removed ${affectedPoolTransactions} transactions from pool.`)
        if (node.memoryPool) {
            node.logger.debug(`new pool size is ${node.memoryPool.count()}`)
        }
    },
    onTransaction: (transaction, affectedPoolTransactions, node) => {
        if (affectedPoolTransactions) {
            node.logger.debug('new unconfirmed transaction', transaction.hash)
            if (node.memoryPool) {
                node.logger.debug(`new pool size is ${node.memoryPool.count()}`)
            }
        } else {
            node.logger.info('new transaction', transaction.hash)
        }
    },
    onConnect: (connection, node) => {
        node.logger.info(`connection established`)
    },
})


observedNodes.map(config => manager.addNode(config))