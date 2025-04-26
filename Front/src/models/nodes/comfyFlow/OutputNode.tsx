import { Handle, Position } from "@xyflow/react";

export default function OutputNode(){

    return(
        <div style={{fontSize:'12px', minHeight : '100px', minWidth:'120px', display: 'flex', flexDirection:'column', rowGap:'2px'}}>
            <div className="nodeTitle" style={{marginBottom:'10px'}}>Output</div>
            <div style={{ position: 'relative' }}>
                <div style={{ 
                    textAlign:'left',
                    marginLeft:'10px',
                    fontSize: '10px'
                }}>
                    Image
                </div>
                <Handle
                    type="target"
                    position={Position.Left}
                    id='image'
                    style={{ 
                        background: '#555'
                    }}
                />
            </div>
        </div>
    )
}