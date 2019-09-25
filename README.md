# Lampify

Lampify is a IoT side project I did to synchronize multiple colour LED lamps over the internet. The project files include
the arduino source code as well as the website.
It makes use of the [MQTT](http://mqtt.org/) protocol with the broker server installed on a Raspberry Pi.

![gif](https://i.imgur.com/TFtsq51.gif)

## Installation

### Requirements
* Arduino Compatible Board
* Some WS2812 Leds
* A 10K resistor

`$ git clone https://github.com/alexfaria/lampify`

### Configuration

Before uploading the code onto the board you will need to change some variables at the top of the source file.
 ```c
 #define LAMP_NAME "lamp1"
 #define MQTT_SERVER "example.com"
 ```

## Website

Just like the board, you will need to change some variables in the [javascript file](https://github.com/alexfaria/lampify/blob/master/website/include/script.js)
before deploying the website. In order for the website to work your MQTT broker will need to have websockets enabled. ([guide](https://tech.scargill.net/mosquitto-and-web-sockets/))

```javascript
const lamps = {
  url: "wss://example.com:8888",
}
```

```
$ git clone https://github.com/alexfaria/lampify
$ cd website
$ python3 -m http.server
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the terms of the [MIT](https://github.com/alexfaria/lampify/blob/master/LICENSE.md)  license.

