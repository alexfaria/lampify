'use strict';
import htm from '../libs/htm.module.js'

const html = htm.bind(React.createElement);

import LampIcon from './LampIcon.js';
import InputSlider from './InputSlider.js';
import DropdownMenu from './DropdownMenu.js';
import ColorPickerModal from './ColorPickerModal.js';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.config = {
            lamps: ['user1', 'user2'],
            url: 'wss://example.com/wss',
            topic: 'lampify/#',
            topics: {
                hex: 'lampify/hex',
                mode: 'lampify/mode',
                speed: 'lampify/speed',
                brightness: 'lampify/brightness',
            },
            modes: [
                'static',
                'blink',
                'breath',
                'color_wipe',
                'color_wipe_inv',
                'color_wipe_rev',
                'color_wipe_rev_inv',
                'color_wipe_random',
                'random_color',
                'single_dynamic',
                'multi_dynamic',
                'rainbow',
                'rainbow_cycle',
                'scan',
                'dual_scan',
                'fade',
                'theater_chase',
                'theater_chase_rainbow',
                'running_lights',
                'twinkle',
                'twinkle_random',
                'twinkle_fade',
                'twinkle_fade_random',
                'sparkle',
                'flash_sparkle',
                'hyper_sparkle',
                'strobe',
                'strobe_rainbow',
                'multi_strobe',
                'blink_rainbow',
                'chase_white',
                'chase_color',
                'chase_random',
                'chase_rainbow',
                'chase_flash',
                'chase_flash_random',
                'chase_rainbow_white',
                'chase_blackout',
                'chase_blackout_rainbow',
                'color_sweep_random',
                'running_color',
                'running_red_blue',
                'running_random',
                'larson_scanner',
                'comet',
                'fireworks',
                'fireworks_random',
                'merry_christmas',
                'halloween',
                'fire_flicker',
                'fire_flicker_soft',
                'fire_flicker_intense',
                'circus_combustus',
                'bicolor_chase',
                'tricolor_chase',
                'icu',
            ]
        };

        this.mqttOptions = {
            keepalive: 10,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000
        };

        this.state = {
            color: '#4a4a4a',
            brightness: 65535,
            speed: 255,
            lamps: this.config.lamps.reduce((o, key) => ({ ...o, [key]: false}), {})
        };

        this.client = null;

        this.onChangeMode = this.onChangeMode.bind(this);
        this.onChangeColor = this.onChangeColor.bind(this);
        this.onChangeSpeed = this.onChangeSpeed.bind(this);
        this.onChangeBrightness = this.onChangeBrightness.bind(this);
    }

    componentDidMount() {
        let client = mqtt.connect(this.config.url, this.mqttOptions);
        this.client = client;

        client.on('end', () => console.log('end'));
        client.on('offline', () => console.log('offline'));
        client.on('close', () => console.log('close'));
        client.on('reconnect', () => console.log('reconnect'));
        client.on('error', e => console.error(e));
        client.on('connect', () => this.client.subscribe(this.config.topic));

        client.on('message', (topic, message) => {
            message = String(message);
            if (topic === this.config.topics.hex) {
                let hex = message.replace('0x', '#');
                this.setState({color: hex});
            } else if (topic === this.config.topics.brightness) {
                this.setState({brightness: message});
            } else if (topic === this.config.topics.speed) {
                this.setState({speed: message});
            } else if (topic === this.config.topics.mode) {
                this.setState({mode: message});
            } else if (topic.endsWith('/status') || topic.endsWith('/online')) {
                const name = topic.lastIndexOf('/status') !== -1
                    ? topic.slice(topic.lastIndexOf('id/') + 'id/'.length, topic.lastIndexOf('/status'))
                    : topic.slice(topic.lastIndexOf('id/') + 'id/'.length, topic.lastIndexOf('/online'));

                let status = false;

                if (message === 'online' || message === '1') {
                    status = true;
                } else if (message === 'offline' || message === '0') {
                    status = false;
                }

                this.setState(prevState => ({
                    lamps: {
                        ...prevState.lamps,
                        [name]: status
                    }
                }));
            }
        });
    }

    publish(topic, message, options) {
        if (this.client && this.client.connected) {
            this.client.publish(topic, message, {...options, qos: 1, retain: true});
        }
    }

    onChangeColor(color) {
        this.setState({color: color.hexString});
        this.publish(this.config.topics.hex, color.hexString.replace('#', '0x'));
    }

    onChangeMode(index) {
        this.setState({mode: this.config.modes[index]});
        this.publish(this.config.topics.mode, this.config.modes[index]);
    }

    onChangeBrightness(value) {
        this.setState({brightness: value});
        this.publish(this.config.topics.brightness, value.toString());
    }

    onChangeSpeed(value) {
        this.setState({speed: value});
        this.publish(this.config.topics.speed, value.toString());
    }

    render() {
        return html`
          <div className="has-background-dark" style="${{minHeight: '100vh'}}">
            <section className="section">
              <div className="container">
                <div className="columns is-centered">
                  <div className="column is-5 box has-background-light has-text-centered pb-6 pt-6">
                    <h1 key="title" className="title has-text-centered">
                      Lampify
                    </h1>

                    <${ColorPickerModal} iconSize="10rem" key="${this.state.color}" color="${this.state.color}"
                                         onChange="${this.onChangeColor}"/>

                    <div key="lamp-icon-container" className="columns is-centered is-mobile is-justify-content-center">
                        ${this.config.lamps.map((key, idx) => html`<${LampIcon} key="${key}" isOn="${this.state.lamps[key]}"/>`)}
                    </div>

                    <div key="dropdown-menu-container" className="level">
                      <div className="level-item">
                        <${DropdownMenu} label="Colour Modes" items="${this.config.modes}"
                                         activeItem="${this.state.mode}"
                                         onChange="${this.onChangeMode}"/>
                      </div>
                    </div>

                    <${InputSlider} key="brightness-slider" label="Brightness" value="${this.state.brightness}"
                                    step="1" min="0" max="255"
                                    onChange="${this.onChangeBrightness}"/>

                    <${InputSlider} key="speed-slider" label="Speed" value="${this.state.speed}"
                                    direction="rtl"
                                    step="1000" min="0" max="65535"
                                    onChange="${this.onChangeSpeed}"/>
                  </div>
                </div>
              </div>
            </section>
          </div>
        `;
    }
}

export default App;
