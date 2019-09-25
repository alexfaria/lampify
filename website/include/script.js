$(document).ready(function () {

	const lamps = {
		colour: '#fff',
		url: "wss://<server>:<port>",
	}

	let client = mqtt.connect(lamps.url);

	client.on('connect', function () {
		console.log("onConnect");
		$("#lamps").empty();
		client.subscribe("lampify/#");
	});

	client.on('error', function (error) {
		console.log('error');
		console.error(error);
	});

	client.on('end', () => console.log('end'));
	client.on('offline', () => console.log('offline'));
	client.on('close', () => console.log('close'));
	client.on('reconnect', () => console.log('reconnect'));

	client.on('message', function (topic, message) {
		console.log("DEBUG: " + topic + "\t" + message);
		message = String(message);

		if (topic == "lampify/hex") {
			let hex = message.replace('0x', '');
			lamps.colour = '#' + hex;
			updatePreviewColour();
		}
		else if (topic.endsWith("/status")) {
			const name = topic.slice(topic.lastIndexOf("id/") + 3, topic.lastIndexOf("/status"));
			const lamp = document.createElement("p");
			lamp.id = name;

			if (message == "online") {
				lamp.innerHTML = '<font style="color: green">' + name + '</font>';
			} else if (message == "offline") {
				lamp.innerHTML = '<font style="color: red">' + name + '</font>';
			}

			$("#" + name).remove();
			$("#lamps").append(lamp);
		}
	});

	// create canvas and context objects
	const canvas = document.getElementById('colourpickerCanvas');
	const ctx = canvas.getContext('2d');

	// drawing active image
	const image = new Image();
	image.onload = function () {
		ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
	};

	image.src = 'include/wheel.png';

	$('#colourpickerCanvas').mousemove(function (e) { // mouse move handler

		// get coordinates of current position
		const canvasOffset = $(canvas).offset();
		const canvasX = Math.floor(e.pageX - canvasOffset.left);
		const canvasY = Math.floor(e.pageY - canvasOffset.top);

		// get current pixel
		const imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
		const pixel = imageData.data;

		// update preview color
		const dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
		const hexVal = '#' + ('0000' + dColor.toString(16)).substr(-6);

		lamps.colour = hexVal;
		updatePreviewColour();
	});

	$('.glyphicon-lamp').click(() => $('#colourpicker').modal('toggle'));

	$('#colourpickerCanvas').click(() => {
		$('#colourpicker').modal('toggle');
		console.log("#submit - " + lamps.colour)
		sendColour();
	});

	$('#random').on('click', function () {
		lamps.colour = '#' + Math.floor(Math.random() * 16777215).toString(16);
		updatePreviewColour();
		sendColour();
	});

	$('#rainbow').on('click', function () {
		client.publish("lampify/mode", "rainbow", { qos: 1, retain: true });
	});

	$(".dropdown-menu").on("click", "li", function (event) {
		client.publish("lampify/mode", event.target.innerHTML, { qos: 1, retain: true });
	})

	function updatePreviewColour() {
		$(".glyphicon-lamp").css('color', lamps.colour);
		$('#colorPicker').val(lamps.colour);
	}

	function sendColour() {
		client.publish("lampify/hex", lamps.colour.slice(1), { qos: 1, retain: true });
	}
});
