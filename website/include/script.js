$(document).ready(function () {

    // $.fn.bootstrapSwitch.defaults.size = 'normal';
    // $("[name='on-off-switch']").bootstrapSwitch();

	// reload the page every minute
	setTimeout(function(){
	   window.location.reload(1);
	}, 60000);

    const location = {
        topic: "<TOPIC>",
        status: "status/#",
        hostname: "ws://<SERVER>",
        port: <PORT>
    }
    const lamps = {
        one: false,
        two: false,
        one_name: '<NAME>',
        two_name: '<NAME>'
    }

    client = mqtt.connect(location.hostname + ':' + location.port);

    $('#colorPicker').on("change", function () {
        setColour($(this).val());
    });

    $('#submit').on('click', function () {
        hex = $('#colorPicker').val();
        console.log("#submit - " + hex)
        sendColour(hex);
    });

    $('#random').on('click', function () {
        colour = '#' + Math.floor(Math.random() * 16777215).toString(16);
        setColour(colour);
        sendColour(colour);
    });

    $('#rainbow').on('click', function () {
        rainbow();
    });

    $('.glyphicon-lamp').on('touchstart click', function () {
        $('#colorPicker').click();
    });

    // called when the client connects
    client.on('connect', function () {
        // Once a connection has been made, make a subscription and send a message.
        console.log("onConnect");
        client.subscribe(location.topic);
        client.subscribe(location.status);
        askColour(client);
        askStatus(client);
    });

    client.on('close', function () {
        console.log('connection closed');
    });

    client.on('offline', function () {
        console.log('connection offline');
    });

    function askStatus() {
        message = "status";
        client.publish(location.topic, message);
    }

    function askColour() {
        message = "colour?";
        client.publish(location.topic, message);
    }

    function setColour(colour) {
        var lamp = $(".glyphicon-lamp");
        lamp.css('color', colour);
        $('#colorPicker').val(colour);
    }

    function sendColour(colour) {
        message = hexToRgb(colour);
        client.publish(location.topic, message);
        console.log("sendColour - " + colour);
        console.log("sendColour - Sent Message: " + message);
    }

    function rainbow() {
        message = "rainbow";
        client.publish(location.topic, message);
        console.log("Sent Message: " + message);
    }

    function updateStatus() {

        $('#one_name').html(lamps.one_name + '\'s lamp is ' + '<font id="one">offline</font>');
        $('#one').attr('color', lamps.one ? 'green' : 'red');
        $('#one').text(lamps.one ? 'online' : 'offline');

        $('#two_name').html(lamps.two_name + '\'s lamp is ' + '<font id="two">offline</font>');
        $('#two').attr('color', lamps.two ? 'green' : 'red');
        $('#two').text(lamps.two ? 'online' : 'offline');

        // const two      = $('#two');
        // const two_name = $('#two_name');
        // two_name.text(lamps.two_name + '\'s Lamp is ');
        // two.attr('class', lamps.two ? 'label label-success' : 'label label-danger');
        // two.text(lamps.two ? 'online' : 'offline');
    }


    client.on('message', function (topic, message) {
        console.log("Message arrived: " + message);
        message = String(message);
        if (message.startsWith("RGB")) {
            aux = message.slice(4);
            rgb = aux.split(',');
            colour = "rgb(" + rgb.join(',') + ")";
            hex = rgbToHex(colour);
            setColour(hex);

        } else if (topic.startsWith("status")) {
            askColour();
            if (topic.indexOf(lamps.one_name) > -1) {
				if (message.startsWith('1'))
					lamps.one = true;
				else
					lamps.one = false;
            } else if (topic.indexOf(lamps.two_name) > -1) {
				if (message.startsWith('1'))
					lamps.two = true;
				else
					lamps.two = false;
            }
            updateStatus();
        }
    });

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    function hexToRgb(hex) {
        if (/^#([a-f0-9]{3}){1,2}$/.test(hex)) {
            if (hex.length == 4) {
                hex = '#' + [hex[1], hex[1], hex[2], hex[2], hex[3], hex[3]].join('');
            }
            var c = '0x' + hex.substring(1);
            return 'RGB ' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
        }
    }

    function rgbToHex(orig) {
        var rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : orig;
    }
});
