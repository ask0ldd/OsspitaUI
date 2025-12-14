/*
https://www.simple-ai.dev/ai-agents

i want to create ai workflows with reactflow and typescript, how to process them
*/

/* eslint-disable @typescript-eslint/no-unused-vars */
export default class WorkflowService{

    static graph: Map<string, string[]> = new Map([
        ['A', ['B','G']],
        ['B', ['C', 'D', 'E']],
        ['C', []],
        ['D', []],
        ['E', ['F']],
        ['F', []],
        ['G', ['H']],
        ['H', ['I']],
        ['I', []],
    ]);

    static outputNode: string = 'A';

    static dfs() {
        const visitedNodes: Set<string> = new Set();
        const stack: string[] = [this.outputNode];

        while (stack.length > 0) {
            const node = stack.pop()!;
            if (visitedNodes.has(node)) continue
            console.log(node);
            visitedNodes.add(node);

            const parents = this.graph.get(node) || [];
            // Add parents to stack in reverse order to maintain traversal order
            stack.push(...[...parents].reverse())
        }
    }

    /*
        function dfs(graph, startNodeId, visited = new Set(), result = []) {
            visited.add(startNodeId);
            result.push(startNodeId);

            for (const neighbor of graph[startNodeId] || []) {
                    if (!visited.has(neighbor)) {
                        dfs(graph, neighbor, visited, result);
                }
            }
            return result;
        }    
    */

    static processNode(){

    }

    static logGraph(){
        console.log(JSON.stringify(Object.keys(this.graph)))
    }
}