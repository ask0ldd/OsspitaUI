import { Handle, NodeProps, Position, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { TextNodeType, ResultNodeType, UpperCaseNodeType } from "../../../pages/ImageGen";
import { isTextNode } from "./ResultNode";

export default function UpperCaseNode({ id }: NodeProps){
    const { updateNodeData } = useReactFlow();

    // This hook returns an array of connections on a specific node, handle type ('source', 'target') or handle ID.
    const connections = useNodeConnections({
        handleType: 'target',
    });

    // This hook lets you subscribe to changes of a specific nodes data object
    // here : the source node
    const n1TextNode = connections[0]?.source
    const nodesData = useNodesData<TextNodeType | ResultNodeType | UpperCaseNodeType>(n1TextNode);
    const textNode = isTextNode(nodesData) ? nodesData : null;
    
    useEffect(() => {
            // Updates the data attribute of a node
            // here the current node : id
            updateNodeData(id, { text: textNode?.data.text.toUpperCase() });
    }, [textNode]);

    return(
        <div style={{padding:'10px'}}>
            <Handle
                type="target"
                position={Position.Left}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={true}
            />
            <div className="flex flex-col gap-y-[1rem]">
                <span>Transform to UpperCase</span>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                id="a"
                isConnectable={true}
            />
        </div>
    )
}