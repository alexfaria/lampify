import LightBulb from './icons/LightBulb';

export default function LampIcon({isOn = false}) {
    let fillColor = isOn ? '#ffe08a' : 'currentColor';

    return <>
        <div className="column is-2">
            <span className='icon'>
                <LightBulb fill={fillColor}/>
            </span>
        </div>
    </>;
}
