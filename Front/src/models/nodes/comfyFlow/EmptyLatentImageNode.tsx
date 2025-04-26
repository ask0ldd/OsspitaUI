import { Handle, NodeProps, Position, Node } from "@xyflow/react";

export default function EmptyLatentImageNode({ data }: NodeProps<Node<{ width : number, height : number, batch_size : number }>>){

    return(
        <div style={{fontSize:'12px', minHeight : '100px', display: 'flex', flexDirection:'column', rowGap:'2px'}}>
            <div className="nodeTitle" style={{marginBottom:'10px'}}>Empty Latent Image</div>
            <div style={{ position: 'relative' }}>
                <div style={{ 
                    textAlign:'right',
                    marginRight:'10px',
                    fontSize: '10px'
                }}>
                    Latent
                </div>
                <Handle
                    type="source"
                    position={Position.Right}
                    id='latent'
                    style={{ 
                        background: '#555'
                    }}
                />
            </div>
            <div style={{display: 'flex', justifyContent:'space-between', margin:'10px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>width :</span><span>{data.width}</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', margin:'2px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>height :</span><span>{data.height}</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', margin:'2px 10px 10px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>batch size :</span><span>{data.batch_size}</span></div>
        </div>
    )
}