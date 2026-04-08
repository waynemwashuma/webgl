declare module "*.glsl" {
  const source: string;

  export default source;
}

declare module "graph-2" {
  export type NodeId = number
  export type EdgeId = number

  export class Graph<T = unknown, U = unknown> {
    directed: boolean
    constructor(directed: boolean)
    addNode(weight: T): NodeId
    addEdge(from: NodeId, to: NodeId, weight: U): EdgeId
    getNodeWeight(id: NodeId): T | undefined
  }

  export function kahnTopologySort<T = unknown, U = unknown>(
    graph: Graph<T, U>
  ): NodeId[] | undefined
}
