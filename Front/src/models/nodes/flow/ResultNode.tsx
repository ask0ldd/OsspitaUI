import { useNodeConnections, useNodesData, Handle, Position } from "@xyflow/react";
import { memo } from "react";
import { TextNodeType, ResultNodeType, UpperCaseNodeType } from "../../../pages/ImageGen";

function ResultNode() {
    // This hook returns an array of connections on a specific node, handle type ('source', 'target') or handle ID.
    const connections = useNodeConnections({
        handleType: 'target',
    });
    
    // This hook lets you subscribe to changes of a specific nodes data object.
    const nodesData = useNodesData<TextNodeType | ResultNodeType | UpperCaseNodeType>(
        connections.map((connection) => connection.source),
    );

    // filter out non text nodes
    const textNodes = nodesData.filter(isTextNode);

    return (
    <div style={{padding:'10px'}}>
        <Handle type="target" position={Position.Left} />
        <div>
            incoming texts:{' '}
            {textNodes.map(({ data }, i) => <div key={i}>{data.text}</div>) ||
                'none'}
        </div>
    </div>
    );
}

export function isTextNode(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: any,
): node is TextNodeType | UpperCaseNodeType | undefined {
    return !node ? false : node.type === 'text' || node.type === 'uppercase';
}

export default memo(ResultNode);