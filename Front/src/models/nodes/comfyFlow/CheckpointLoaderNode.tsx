import { Handle, NodeProps, Position, Node } from "@xyflow/react";

export default function CheckpointLoaderNode({ data }: NodeProps<Node<{ activeCheckpoint: string }>>){

    const handlePositions = [
        { id: 'model', label: 'Model', top: '0%' },
        { id: 'clip', label: 'Clip', top: '10%' },
        { id: 'vae', label: 'VAE', top: '20%' }
    ];

    return(
        <div style={{fontSize:'12px', minHeight : '100px', display: 'flex', flexDirection:'column', rowGap:'2px'}}>
            <div className="nodeTitle" style={{marginBottom:'10px'}}>Load Checkpoint</div>
            {handlePositions.map((handle) => (
                <div key={handle.id} style={{ position: 'relative' }}>
                    <div style={{ 
                        textAlign:'right',
                        marginRight:'10px',
                        fontSize: '10px'
                    }}>
                        {handle.label}
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={handle.id}
                        style={{ 
                            background: '#555'
                        }}
                    />
                </div>
            ))}
            <span style={{margin:'10px 10px 10px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}>{data.activeCheckpoint}</span>
        </div>
    )
}