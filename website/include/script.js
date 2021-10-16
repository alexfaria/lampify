$(document).ready(function () {
    //#region Bulma

    let dropdown = document.querySelector('.dropdown');
    dropdown.addEventListener('click', function (event) {
        event.stopPropagation();
        dropdown.classList.toggle('is-active');
    });

    $('.light-bulb-icon').on('click', function (event) {
        event.stopPropagation();
        const modal = document.querySelector('.modal');  // assuming you have only 1
        const html = document.querySelector('html');

        modal.classList.add('is-active');
        html.classList.add('is-clipped');

        modal.querySelector('.modal-background').addEventListener('click', function (e) {
            e.preventDefault();
            modal.classList.remove('is-active');
            html.classList.remove('is-clipped');
        });

        modal.querySelector('.modal-close').addEventListener('click', function (e) {
            modal.classList.remove('is-active');
            html.classList.remove('is-clipped');
        });
    });

    $('.dropdown-content').on('click', 'a', event => {
        clearActiveMode();
        event.target.classList.add('is-active');
        publish(lamps.topics.mode, event.target.innerHTML);
    });

    // https://wikiki.github.io/form/slider/

    $('.brightness-slider').on('change', (event) => {
        lamps.brightness = event.target.value;
        publish(lamps.topics.brightness, lamps.brightness);
    });

    $('.speed-slider').on('change', (event) => {
        lamps.speed = event.target.value;
        publish(lamps.topics.speed, lamps.speed);
    });

    //#endregion Bulma

    //#region Functions
    const clearActiveMode = () => {
        $('.dropdown-content').find('a').each((index, element) => {
            element.classList.remove('is-active');
        });
    };

    const setActiveMode = (mode) => {
        $('.dropdown-content').find('a').each((index, element) => {
            if (element.innerHTML === mode) {
                element.classList.add('is-active');
            }
        });
    };

    const closeModal = () => {
        $('.modal').removeClass('is-active');
        $('html').removeClass('is-clipped');
    };

    const publish = (topic, message) => {
        if (client.connected) {
            client.publish(topic, message, mqttMessageOptions);
        }
    };

    const updateUI = () => {
        $('.lamp').css('color', lamps.colour.hexString);
        $('.brightness-slider').val(lamps.brightness);
        $('.speed-slider').val(lamps.speed);
    };
    //#endregion Functions

    //#region MQTT Setup
    const lamps = {
        url: 'wss://example.com/wss',
        topic: 'lampify/#',
        topics: {
            hex: 'lampify/hex',
            mode: 'lampify/mode',
            speed: 'lampify/speed',
            brightness: 'lampify/brightness',
        },
        colour: '#fff',
        brightness: 65535,
        speed: 255,
        icon: {
            user1: 'right',
            user2: 'left',
        },
    };

    const mqttOptions = {
        keepalive: 10,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000
    };

    const mqttMessageOptions = {
        qos: 1,
        retain: true
    };

    let client = mqtt.connect(lamps.url, mqttOptions);

    client.on('end', () => console.log('end'));
    client.on('offline', () => console.log('offline'));
    client.on('close', () => console.log('close'));
    client.on('reconnect', () => console.log('reconnect'));
    client.on('error', e => console.error(e));
    client.on('connect', () => client.subscribe(lamps.topic));

    client.on('message', function (topic, message) {
        message = String(message);
        if (topic === lamps.topics.hex) {
            let hex = message.replace('0x', '#');
            lamps.colour = new iro.Color(hex);
        } else if (topic === lamps.topics.brightness) {
            lamps.brightness = message;
        } else if (topic === lamps.topics.speed) {
            lamps.speed = message;
        } else if (topic === lamps.topics.mode) {
            clearActiveMode();
            setActiveMode(message);
        } else if (topic.endsWith('/status') || topic.endsWith('/online')) {
            const name = topic.lastIndexOf('/status') !== -1
                ? topic.slice(topic.lastIndexOf('id/') + 'id/'.length, topic.lastIndexOf('/status'))
                : topic.slice(topic.lastIndexOf('id/') + 'id/'.length, topic.lastIndexOf('/online'));

            let lamp = $(`.icon-${lamps.icon[name]}`);

            if (message === 'online' || message === '1') {
                lamp.addClass('has-text-warning');
            } else if (message === 'offline' || message === '0') {
                lamp.removeClass('has-text-warning');
            }
        }
        updateUI();
    });
    //#endregion MQTT Setup

    //#region Colour Picker
    // https://iro.js.org/guide.html
    const colourPicker = new iro.ColorPicker('#picker');

    colourPicker.on('input:change', (colour, changes) => {
        lamps.colour = colour
        updateUI();
    });

    colourPicker.on('input:end', (colour, changes) => {
        lamps.colour = colour
        publish(lamps.topics.hex, lamps.colour.hexString.slice(1));
        closeModal();
    });
    //#endregion Colour Picker
});
