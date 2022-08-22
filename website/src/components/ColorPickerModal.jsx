import React, {useEffect, useRef, useState} from 'react';

import iro from '@jaames/iro';

import Modal from './Modal';
import LightBulb from './icons/LightBulb';

export default function ColorPickerModal({isLoading, color, setColor, onChange}) {
    const [open, setOpen] = useState(false);
    const [effect, setEffect] = useState(isLoading);

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
            setEffect(true);
            colorPicker.current.color.set(color);
        }
    }, [color]);

    return <>
        <div className={`container text-center text-[10rem] ${effect ? 'animate-pulse duration-1000 ease-in-out' : ''}`}
             onAnimationIteration={() => !isLoading && setEffect(false)}>
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

