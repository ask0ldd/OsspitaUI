import { Handle, Position } from "@xyflow/react";

export default function VAEDecodeNode(){

    const leftHandlePositions = [
        { id: 'samples', label: 'Samples', top: '0%' },
        { id: 'vae', label: 'VAE', top: '10%' },
    ];

    return(
        <div style={{fontSize:'12px', minHeight : '80px', display: 'flex', flexDirection:'column', rowGap:'2px'}}>
            <div className="nodeTitle" style={{marginBottom:'10px'}}>VAE Decode</div>
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', columnGap:'20px'}}>
                <div style={{display:'flex', flexDirection:'column'}}>
                    {leftHandlePositions.map(handle => (
                        <div key={handle.id} style={{ position: 'relative' }}>
                            <div style={{ 
                                textAlign:'left',
                                marginLeft:'10px',
                                fontSize: '10px'
                            }}>
                                {handle.label}
                            </div>
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={handle.id}
                                style={{ 
                                    background: '#555'
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div style={{ position: 'relative',
                    display: 'flex',
                    alignItems:'center',
                    flexDirection:'column',
                    justifyContent:'center'
                 }}>
                    <div style={{ 
                        textAlign:'right',
                        marginRight:'10px',
                        fontSize: '10px',
                    }}>
                        Image
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="image"
                        style={{ 
                            background: '#555'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}