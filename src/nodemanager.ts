import { NodeConfig, Node } from './lib/node';

export class NodeManager {
    private nodes: Node[]

    constructor(private defaultConfig: NodeConfig = {}){
        this.nodes = []
    }

    addNode(config: NodeConfig){
        this.nodes.push(new Node({
            ...this.defaultConfig,
            ...config
        }))
    }
}