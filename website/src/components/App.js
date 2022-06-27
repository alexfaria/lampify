import {useState, useRef, useEffect} from 'react';
import mqtt from 'precompiled-mqtt';

import LampIcon from './LampIcon';
import InputSlider from './InputSlider';
import DropdownMenu from './DropdownMenu';
import ColorPickerModal from './ColorPickerModal';
import {config, mqttOptions, defaultColor} from '../config';

const isDevelopmentEnv = () => !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export default function App() {
    const [color, setColor] = useState(defaultColor);
    const [speed, setSpeed] = useState(0);
    const [brightness, setBrightness] = useState(0);
    const [mode, setMode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lampStatus, setLampStatus] = useState(Object.assign(...config.lamps.map(name => ({[name]: false}))));

    const client = useRef(null);

    useEffect(() => {
        if (client.current) return;

        client.current = mqtt.connect(config.url, mqttOptions);

        client.current.on('offline', () => {
            setIsLoading(true);
            setColor(defaultColor);
        });

        client.current.on('error', e => console.error(e));
        client.current.on('connect', () => client.current && client.current.subscribe(config.topic));

        client.current.on('message', (topic, message) => {
            message = String(message);

            switch (topic) {
                case config.topics.mode:
                    setMode(message);
                    break;

                case config.topics.speed:
                    setSpeed(message);
                    break;

                case config.topics.brightness:
                    setBrightness(message);
                    break;

                case config.topics.hex:
                    let hexString = message.replace('0x', '');
                    let prependZeros = '#' + '0'.repeat(6 - hexString.length);
                    let fixHex = prependZeros + hexString;
                    setColor(fixHex);
                    setIsLoading(false);
                    break;

                default:
                    if (topic.endsWith('/status') || topic.endsWith('/online')) {
                        const lampName = topic.lastIndexOf('/status') !== -1
                            ? topic.slice(topic.lastIndexOf('id/') + 'id/'.length, topic.lastIndexOf('/status'))
                            : topic.slice(topic.lastIndexOf('id/') + 'id/'.length, topic.lastIndexOf('/online'));

                        let status = false;

                        if (message === 'online' || message === '1') {
                            status = true;
                        } else if (message === 'offline' || message === '0') {
                            status = false;
                        }

                        setLampStatus(prevLampStatus => ({
                            ...prevLampStatus, [lampName]: status
                        }));
                    }
                    break;
            }
        });
    });

    const publish = (topic, message, options) => {
        if (client.current && client.current.connected) {
            client.current.publish(topic, message, {...options, qos: 1, retain: true});
        }
    }

    const onChangeColor = (color) => {
        setColor(color);
        publish(config.topics.hex, color.replace('#', '0x'));
    }

    const onChangeMode = (index) => {
        setMode(config.modes[index]);
        publish(config.topics.mode, config.modes[index]);
    }

    const onChangeBrightness = (value) => {
        setBrightness(brightness);
        publish(config.topics.brightness, value.toString());
    }

    const onChangeSpeed = (value) => {
        setSpeed(value);
        publish(config.topics.speed, value.toString());
    }

    return <>
        <div
            className={`${isDevelopmentEnv() ? 'debug-screens' : ''} flex bg-background-dark text-background-dark h-screen`}
            key="background-container">
            <div className="max-w-xs md:max-w-l xl:max-w-xl 2xl:max-w-2xl container
                            m-auto mt-12 md:m-auto xl:m-auto py-12 px-4
                            bg-background-light
                            rounded-3xl shadow-md drop-shadow-lg overflow-hidden">

                <h1 className="font-sans text-center font-semibold text-3xl">
                    Lampify
                </h1>

                <ColorPickerModal isLoading={isLoading} color={color} setColor={setColor} onChange={onChangeColor}/>

                <div className="flex place-content-center space-x-20 my-4">
                    {config.lamps.map(key =>
                        <div title={key} key={'lamp-icon-' + key}>
                            <LampIcon isOn={lampStatus[key]}/>
                        </div>
                    )}
                </div>

                <div className="flex place-content-center mt-8">
                    <DropdownMenu label="Colour Modes"
                                  items={config.modes}
                                  activeItem={mode}
                                  onChange={onChangeMode}/>
                </div>

                <div className="flex flex-col place-items-center mt-10 text-center space-y-10">
                    <InputSlider label="Brightness"
                                 value={brightness}
                                 color={color}
                                 min="0" max="255" step="1"
                                 onChange={onChangeBrightness}/>

                    <InputSlider label="Speed"
                                 value={speed}
                                 color={color}
                                 min="0" max="65535" step="1000"
                                 isReversed={true}
                                 onChange={onChangeSpeed}/>
                </div>
            </div>
        </div>
    </>;

}

