import React from 'react';

export default function InputSlider({min, max, value, label, step, onChange, color, isReversed = false}) {

    const getValue = (value) => isReversed ? max - value : value

    const _onChange = (event) => {
        let newValue = getValue(event.target.value);
        onChange(newValue);
    };

    return <>
        <div className="-pt-3">
            <span className="font-sans text-center">{label}</span>
            <div className="mt-2">
                <input style={{accentColor: color}}
                       type="range"
                       min={min}
                       max={max}
                       step={step}
                       onChange={_onChange}
                       value={getValue(value)}/>
            </div>
        </div>
    </>;
}
