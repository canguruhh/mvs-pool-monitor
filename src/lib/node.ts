import { client as WebSocketClient, connection } from 'websocket';
import { Transaction } from '../interfaces/transaction.interface';
import { MemoryPool, MemoryPoolRemoval } from './memorypool';
import { Block } from '../interfaces/block.interface';
import { Logger } from '../interfaces/logging.interface';
import { getLogger } from 'log4js';

export interface NodeConfig {
    name?: string
    host?: string

    logger?: Logger
    memoryPool?: MemoryPool
    onError?: (message: string) => void
    onClose?: () => void
    onConnect?: (connection?: connection, node?: Node) => void

    onTransaction?: (transaction: Transaction, affectedPoolTransactions?: number, node?: Node) => void
    onBlock?: (block: Block, affectedPoolTransactions?: number, node?: Node) => void
}

export class Node {

    client: WebSocketClient
    connection: connection
    connected = false
    memoryPool: MemoryPool
    logger: Logger

    constructor(private config: NodeConfig = { host: 'http://127.0.0.1:8821/ws' }) {

        this.logger = config.logger === undefined ? getLogger(config.name) : config.logger
        this.logger.level = 'debug'

        this.memoryPool = config.memoryPool

        this.client = new WebSocketClient()

        this.client.on('connect', (connection) => {
            this.connection = connection
            if (this.config.onConnect) {
                this.config.onConnect(connection, this)
            }
            this.connected = true
            connection.on('error', (error) => {
                if (this.config.onError) {
                    this.config.onError(error.toString())
                }
                this.connected = false
            });
            connection.on('close', () => {
                if (this.config.onClose) {
                    this.config.onClose()
                }
                this.connected = false
            });
            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    try {
                        const payload = JSON.parse(message.utf8Data)
                        switch (payload.channel) {
                            case 'block':
                                switch (payload.event) {
                                    case 'publish':
                                        this.receiveBlock(payload.result, payload.event)
                                        break;
                                    case 'subscribed':
                                }
                                break;
                            case 'tx':
                                switch (payload.event) {
                                    case 'publish':
                                        this.receiveTransaction(payload.result, payload.event)
                                        break;
                                    case 'subscribed':
                                }
                                break;
                            case undefined:
                                switch (payload.event) {
                                    case 'ping':
                                    case 'version':
                                    case 'info':
                                        break;
                                }
                                break;
                            default:
                                this.logger.log(`unexpected message on channel ${payload.channel} event ${payload.event}`)
                        }
                    } catch (error) {
                        this.logger.error(`invalid payload error: ${error.message} payload: ${message.utf8Data}`)
                    }
                }
            });
            function subscribeBlocks() {
                if (connection.connected) {
                    connection.sendUTF('{"event": "subscribe", "channel": "block"}');
                }
            }
            function subscribeTransactions() {
                if (connection.connected) {
                    connection.sendUTF('{"event": "subscribe", "channel": "tx", "address":[]}');
                }
            }
            this.ping()
            subscribeTransactions();
            subscribeBlocks();
        });

        this.connect()
    }

    ping() {
        if (this.connection.connected) {
            return this.connection.sendUTF('{"event": "ping"}');
        }
    }

    private receiveBlock(block: Block, event: string) {
        let affectedTransactions
        if (this.config.memoryPool) {
            affectedTransactions = this.config.memoryPool.remove(block.transactions).affected
        }
        if (this.config.onBlock) {
            this.config.onBlock(block, affectedTransactions, this)
        }
    }

    private receiveTransaction(transaction: Transaction, event: string) {
        let affectedPoolTransactions = 0
        if (transaction.height === 0) {
            if (this.config.memoryPool) {
                this.config.memoryPool.add(transaction)
                affectedPoolTransactions = 1
            }
        }
        if (this.config.onTransaction) {
            this.config.onTransaction(transaction, affectedPoolTransactions, this)
        }
    }



    connect() {
        return this.client.connect(this.config.host)
    }

}