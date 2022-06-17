import {useState, useEffect, useRef} from 'react';
import iro from '@jaames/iro';
import LightBulb from './icons/LightBulb';

export default function ColorPickerModal(props) {
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState(props.color);

    const colorPicker = useRef(null);
    const pickerElement = useRef(null);

    const toggleModal = () => setOpen(!open);

    useEffect(() => {
        if (colorPicker.current) return;

        colorPicker.current = new iro.ColorPicker(pickerElement.current, {color});

        colorPicker.current.on('input:change', (color) => setColor(color.hexString));

        colorPicker.current.on('input:end', (color) => {
            toggleModal();
            setColor(color.hexString);
            props.onChange(color.hexString);
        });
    });

    useEffect(() => {
        if (colorPicker.current) {
            colorPicker.current.color.set(color);
        }
    }, [color]);

    return <>
        <div key="icon-container-key" className="container has-text-centered"
             style={{fontSize: props.iconSize}}>
                <span className="icon is-large" onClick={toggleModal}>
                    <LightBulb className="lamp" fill={color}/>
                </span>
        </div>

        <div key="modal-key" className={`modal ${open ? 'is-active' : ''}`}>
            <div key="modal-background-key" className="modal-background" onClick={toggleModal}></div>
            <div className="modal-content">
                <div className="level">
                    <div className="level-item">
                        <div ref={pickerElement} id="picker"></div>
                    </div>
                </div>
            </div>
            <button className="modal-close is-large" onClick={toggleModal} aria-label="close"></button>
        </div>
    </>;
}

