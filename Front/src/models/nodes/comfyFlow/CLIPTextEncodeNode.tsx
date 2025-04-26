import { Handle, NodeProps, Position, Node } from "@xyflow/react";

export default function CLIPTextEncodeNode({ data }: NodeProps<Node<{ prompt: string }>>){

    return(
        <div style={{fontSize:'12px', minHeight : '100px', display: 'flex', flexDirection:'column', rowGap:'2px'}}>
            <div className="nodeTitle" style={{marginBottom:'10px'}}>Clip Text Encode (Prompt)</div>
                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            textAlign:'left',
                            marginLeft:'10px',
                            fontSize: '10px'
                        }}>
                            Clip
                        </div>
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={"clip"}
                            style={{ 
                                background: '#555'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            textAlign:'right',
                            marginRight:'10px',
                            fontSize: '10px'
                        }}>
                            Conditioning
                        </div>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={"conditioning"}
                            style={{ 
                                background: '#555'
                            }}
                        />
                    </div>
                </div>
            <textarea rows={6} style={{margin:'10px 10px 10px 10px', width:'300px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}} readOnly value={data.prompt ?? ''}/>
        </div>
    )
}