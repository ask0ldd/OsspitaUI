import * as Slider from "@radix-ui/react-slider";

function FormSlider({value, onValueChange, max, min, step, ariaLabel, label} : IProps){
    return(
        <div style={{display:'flex', flex: '1 1 100%', height:'100%', flexDirection:'column', rowGap:'1px'}}>
            <Slider.Root className="SliderRoot" value={[value]} max={max} min={min} step={step} onValueChange={onValueChange}>
                <Slider.Track className="SliderTrack">
                    <Slider.Range className="SliderRange" />
                </Slider.Track>
                <Slider.Thumb className="SliderThumb" aria-label={ariaLabel} />
            </Slider.Root>
            <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'9px', fontSize:'14px'}}>
                <span>{label}</span><span>{value}</span>
            </div>
        </div>
    )
}

export default FormSlider

interface IProps{
    value : number
    onValueChange : (e: number[]) => void
    max : number
    min : number
    step : number
    ariaLabel : string
    label : string
}