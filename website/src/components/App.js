import {useState, useRef, useEffect} from 'react';
import mqtt from 'precompiled-mqtt';

import LampIcon from './LampIcon';
import InputSlider from './InputSlider';
import DropdownMenu from './DropdownMenu';
import ColorPickerModal from './ColorPickerModal';
import {config, mqttOptions} from '../config';

export default function App() {
    const [color, setColor] = useState('#4a4a4a');
    const [speed, setSpeed] = useState(0);
    const [brightness, setBrightness] = useState(0);
    const [mode, setMode] = useState(null);
    const [lamps, setLamps] = useState(Object.assign(...config.lamps.map(name => ({[name]: false}))));

    const client = useRef(null);

    useEffect(() => {
        if (client.current) return;

        client.current = mqtt.connect(config.url, mqttOptions);

        client.current.on('end', () => console.log('end'));
        client.current.on('offline', () => console.log('offline'));
        client.current.on('close', () => console.log('close'));
        client.current.on('reconnect', () => console.log('reconnect'));
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

                        setLamps({
                            ...lamps,
                            [lampName]: status
                        });
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

    return (
        <div className="has-background-dark" style={{minHeight: '100vh'}}>
            <section className="section">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-5 box has-background-light has-text-centered pb-6 pt-6">
                            <h1 key="title" className="title has-text-centered">
                                Lampify
                            </h1>

                            <ColorPickerModal iconSize="10rem"
                                              key={color}
                                              color={color}
                                              onChange={onChangeColor}/>

                            <div key="lamp-icon-container"
                                 className="columns is-centered is-mobile is-justify-content-center">
                                {config.lamps.map((key) => <LampIcon key={key} isOn={lamps[key]}/>)}
                            </div>

                            <div key="dropdown-menu-container" className="level">
                                <div className="level-item">
                                    <DropdownMenu label="Colour Modes"
                                                  items={config.modes}
                                                  activeItem={mode}
                                                  onChange={onChangeMode}/>
                                </div>
                            </div>

                            <InputSlider key="brightness-slider"
                                         label="Brightness"
                                         value={brightness}
                                         step="1" min="0" max="255"
                                         onChange={onChangeBrightness}/>

                            <InputSlider key="speed-slider"
                                         label="Speed"
                                         value={speed}
                                         step="1000" min="0" max="65535"
                                         isReversed={true}
                                         onChange={onChangeSpeed}/>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

