import LightBulb from './icons/LightBulb';

export default function LampIcon({isOn = false}) {
    let fillColor = isOn ? '#ffe08a' : null;

    return <>
        <LightBulb fill={fillColor}/>
    </>;
}
