import { Node } from './lib/node';
import { MemoryPool } from './lib/memorypool';

const observedNodes = [
    {
        name: 'node1',
        host: 'ws://127.0.0.1:8821/ws'
    }
]

observedNodes.map(config => {
    const node = new Node({
        ...config,
        memoryPool: new MemoryPool(),
        onBlock: (block, affectedPoolTransactions) => {
            node.logger.info(`received new block ${block.hash} height ${block.number}`)
            node.logger.info(`removed ${affectedPoolTransactions} transactions from pool.`)
            if (node.memoryPool) {
                node.logger.debug(`new pool size is ${node.memoryPool.count()}`)
            }
        },
        onTransaction: (transaction, affectedPoolTransactions) => {
            if (affectedPoolTransactions) {
                node.logger.debug('new unconfirmed transaction', transaction.hash)
                if (node.memoryPool) {
                    node.logger.debug(`new pool size is ${node.memoryPool.count()}`)
                }
            } else {
                node.logger.info('new transaction', transaction.hash)
            }
        },
        onConnect: () => {
            node.logger.info(`connection established`)
        },
    })
    return node
})