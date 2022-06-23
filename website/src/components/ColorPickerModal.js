import iro from '@jaames/iro';

import {useEffect, useRef, useState} from 'react';
import LightBulb from './icons/LightBulb';
import Modal from './Modal';

export default function ColorPickerModal({color, setColor, onChange}) {
    const [open, setOpen] = useState(false);

    const colorPicker = useRef(null);
    const pickerElement = useRef(null);

    const toggleModal = () => setOpen(prevOpen => !prevOpen);

    useEffect(() => {
        if (colorPicker.current) return;

        colorPicker.current = new iro.ColorPicker(pickerElement.current, {color, width: 250});

        colorPicker.current.on('input:change', (color) => setColor(color.hexString));

        colorPicker.current.on('input:end', (color) => {
            setColor(color.hexString);
            onChange(color.hexString);
            toggleModal();
        });
    });

    useEffect(() => {
        if (colorPicker.current) {
            colorPicker.current.color.set(color);
        }
    }, [color]);

    return <>
        <div className="container text-center text-[10rem]">
                <span className="icon is-large" onClick={toggleModal}>
                    <LightBulb className="lamp" fill={color}/>
                </span>
        </div>

        <Modal open={open}
               toggleModal={toggleModal}
               content={() => (
                   <div className="flex place-content-center pb-6">
                       <div ref={pickerElement} id="picker"></div>
                   </div>
               )}>
        </Modal>
    </>;
}

