import { Handle, Position } from "@xyflow/react";

export default function KSamplerNode(){

    const leftHandlePositions = [
        { id: 'model', label: 'Model', top: '0%' },
        { id: 'positive', label: 'Positive', top: '10%' },
        { id: 'negative', label: 'Negative', top: '20%' },
        { id: 'latent_image', label: 'Latent_image', top: '30%' }
    ];

    return(
        <div style={{fontSize:'12px', minHeight : '100px', display: 'flex', flexDirection:'column', rowGap:'2px'}}>
            <div className="nodeTitle" style={{marginBottom:'10px'}}>KSampler</div>
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
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
                        Latent
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={"latent"}
                        style={{ 
                            background: '#555'
                        }}
                    />
                </div>
            </div>
            <div style={{display: 'flex', justifyContent:'space-between', columnGap:'10px', margin:'10px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>seed :</span><span>000000000000000000000000000</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', columnGap:'10px', margin:'2px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>control_after_generate :</span><span>randomize</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', columnGap:'10px', margin:'2px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>steps :</span><span>20</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', columnGap:'10px', margin:'2px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>cfg :</span><span>000000000000000000000000000</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', columnGap:'10px', margin:'2px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>sampler_name :</span><span>8.0</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', columnGap:'10px', margin:'2px 10px 2px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>scheduler :</span><span>denoise</span></div>
            <div style={{display: 'flex', justifyContent:'space-between', columnGap:'10px', margin:'2px 10px 10px 10px', backgroundColor:'#dee3ef66', border:'1px solid #dee3ef99', padding:'2px 5px', borderRadius:'4px', fontSize:'10px'}}><span>denoise :</span><span>1.0</span></div>
        </div>
    )
}