export default function InputSlider({min, max, value, label, step, onChange, isReversed = false}) {

    const getValue = () => isReversed ? max - value : value

    const _onChange = (event) => {
        let value = event.target.value;
        let newValue = isReversed ? max - value : value;
        onChange(newValue);
    };

    return <>
        <div className="field">
            <label className="label">{label}</label>
            <div className="control">
                <input className="slider"
                       onChange={_onChange}
                       value={getValue()}
                       step={step}
                       min={min}
                       max={max}
                       type="range"/>
            </div>
        </div>
    </>;
}
