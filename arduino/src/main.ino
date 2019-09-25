#include <ESP8266WiFi.h>	  // ESP8266 Core WiFi Library (you most likely already have this in your sketch)
#include <DNSServer.h>		  // Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h> // Local WebServer used to serve the configuration portal
#include <WiFiManager.h>	  // https://github.com/tzapu/WiFiManager WiFi Configuration Magic
#include <PubSubClient.h>	 // https://github.com/knolleary/pubsubclient/

#include <ElegantOTA.h>

#include <Adafruit_NeoPixel.h>
#include <WS2812FX.h>

/**
 * In order to work with WEMOS D1 Mini (CapacitiveSensor)
 * https://github.com/PaulStoffregen/CapacitiveSensor/issues/15
 * #line 049: replace with 80000000
 * #line 148: replace with 80000000
 */
#include <CapacitiveSensor.h> // https://github.com/PaulStoffregen/CapacitiveSensor

// 00 -> D3 : LED_BUILTIN
// 02 -> D4
// 04 -> D2
// 12 -> D6
// 15 -> D8

#define NUM_LEDS 12
#define DATA_PIN 15				// pin D8
#define CAP_SENSE_SEND_PIN 4	// pin D2 RESISTOR
#define CAP_SENSE_SENSOR_PIN 12 // pin D6
#define CAP_SENSE_THRESHOLD 150

#define RETAIN 1

#define LAMP_NAME "<name>"
#define LAMP_PATH "lampify/id/" LAMP_NAME "/"

#define MQTT_SERVER "<server>"
#define MQTT_PORT 1883

#define FIRMWARE_VERSION "2.1"

int firstConnect = 1;
WiFiClient espClient;
PubSubClient client(espClient);
WiFiManager wifiManager;

CapacitiveSensor capSensor = CapacitiveSensor(CAP_SENSE_SEND_PIN, CAP_SENSE_SENSOR_PIN);
long capSenseValue;

unsigned int gColourHex;
unsigned long capSenseTimestamp = millis();
unsigned long reportTimestamp = millis();

// leds
Adafruit_NeoPixel strip(NUM_LEDS, DATA_PIN, NEO_GRB + NEO_KHZ800);
WS2812FX ws2812fx = WS2812FX(NUM_LEDS, DATA_PIN, NEO_GRB + NEO_KHZ800);

void reconnect();
void sendColour();
void configModeCallback(WiFiManager *myWiFiManager);
void callback(char *topic, byte *payload, unsigned int length);

// update server
ESP8266WebServer HttpServer(80);

const unsigned int totalModes = 61;

const char *FX_MODES_STR[] = {
	"static",
	"blink",
	"breath",
	"color_wipe",
	"color_wipe_inv",
	"color_wipe_rev",
	"color_wipe_rev_inv",
	"color_wipe_random",
	"random_color",
	"single_dynamic",
	"multi_dynamic",
	"rainbow",
	"rainbow_cycle",
	"scan",
	"dual_scan",
	"fade",
	"theater_chase",
	"theater_chase_rainbow",
	"running_lights",
	"twinkle",
	"twinkle_random",
	"twinkle_fade",
	"twinkle_fade_random",
	"sparkle",
	"flash_sparkle",
	"hyper_sparkle",
	"strobe",
	"strobe_rainbow",
	"multi_strobe",
	"blink_rainbow",
	"chase_white",
	"chase_color",
	"chase_random",
	"chase_rainbow",
	"chase_flash",
	"chase_flash_random",
	"chase_rainbow_white",
	"chase_blackout",
	"chase_blackout_rainbow",
	"color_sweep_random",
	"running_color",
	"running_red_blue",
	"running_random",
	"larson_scanner",
	"comet",
	"fireworks",
	"fireworks_random",
	"merry_christmas",
	"halloween",
	"fire_flicker",
	"fire_flicker_soft",
	"fire_flicker_intense",
	"circus_combustus",
	"bicolor_chase",
	"tricolor_chase",
	"icu",
	"custom",
	"custom_0",
	"custom_1",
	"custom_2",
	"custom_3",
};

const unsigned int FX_MODES[] = {
	FX_MODE_STATIC,
	FX_MODE_BLINK,
	FX_MODE_BREATH,
	FX_MODE_COLOR_WIPE,
	FX_MODE_COLOR_WIPE_INV,
	FX_MODE_COLOR_WIPE_REV,
	FX_MODE_COLOR_WIPE_REV_INV,
	FX_MODE_COLOR_WIPE_RANDOM,
	FX_MODE_RANDOM_COLOR,
	FX_MODE_SINGLE_DYNAMIC,
	FX_MODE_MULTI_DYNAMIC,
	FX_MODE_RAINBOW,
	FX_MODE_RAINBOW_CYCLE,
	FX_MODE_SCAN,
	FX_MODE_DUAL_SCAN,
	FX_MODE_FADE,
	FX_MODE_THEATER_CHASE,
	FX_MODE_THEATER_CHASE_RAINBOW,
	FX_MODE_RUNNING_LIGHTS,
	FX_MODE_TWINKLE,
	FX_MODE_TWINKLE_RANDOM,
	FX_MODE_TWINKLE_FADE,
	FX_MODE_TWINKLE_FADE_RANDOM,
	FX_MODE_SPARKLE,
	FX_MODE_FLASH_SPARKLE,
	FX_MODE_HYPER_SPARKLE,
	FX_MODE_STROBE,
	FX_MODE_STROBE_RAINBOW,
	FX_MODE_MULTI_STROBE,
	FX_MODE_BLINK_RAINBOW,
	FX_MODE_CHASE_WHITE,
	FX_MODE_CHASE_COLOR,
	FX_MODE_CHASE_RANDOM,
	FX_MODE_CHASE_RAINBOW,
	FX_MODE_CHASE_FLASH,
	FX_MODE_CHASE_FLASH_RANDOM,
	FX_MODE_CHASE_RAINBOW_WHITE,
	FX_MODE_CHASE_BLACKOUT,
	FX_MODE_CHASE_BLACKOUT_RAINBOW,
	FX_MODE_COLOR_SWEEP_RANDOM,
	FX_MODE_RUNNING_COLOR,
	FX_MODE_RUNNING_RED_BLUE,
	FX_MODE_RUNNING_RANDOM,
	FX_MODE_LARSON_SCANNER,
	FX_MODE_COMET,
	FX_MODE_FIREWORKS,
	FX_MODE_FIREWORKS_RANDOM,
	FX_MODE_MERRY_CHRISTMAS,
	FX_MODE_HALLOWEEN,
	FX_MODE_FIRE_FLICKER,
	FX_MODE_FIRE_FLICKER_SOFT,
	FX_MODE_FIRE_FLICKER_INTENSE,
	FX_MODE_CIRCUS_COMBUSTUS,
	FX_MODE_BICOLOR_CHASE,
	FX_MODE_TRICOLOR_CHASE,
	FX_MODE_ICU,
	FX_MODE_CUSTOM,
	FX_MODE_CUSTOM_0,
	FX_MODE_CUSTOM_1,
	FX_MODE_CUSTOM_2,
	FX_MODE_CUSTOM_3,
};

void setup()
{
	// leds
	strip.begin();
	strip.show();
	gColourHex = random(0x000000, 0xffffff);

	for (int i = 0; i < strip.numPixels(); i++)
	{
		strip.setPixelColor(i, 0xffffff);
		strip.show();
		delay(100);
	}

	Serial.begin(115200);
	Serial.println("Enter setup function");

	client.setServer(MQTT_SERVER, MQTT_PORT);
	client.setCallback(callback);

	wifiManager.setRemoveDuplicateAPs(false);
	wifiManager.setAPCallback(configModeCallback);
	wifiManager.autoConnect("Lamp Configuration");

	capSensor.set_CS_Timeout_Millis(5000);

	ElegantOTA.begin(&HttpServer);
	HttpServer.onNotFound(handleNotFound);
	HttpServer.begin();

	// fx
	ws2812fx.init();
	ws2812fx.setBrightness(255);
	ws2812fx.setSpeed(2000);
	ws2812fx.setColor(gColourHex);
	ws2812fx.setMode(FX_MODE_STATIC);
	ws2812fx.start();

	Serial.println("Leave setup function");
}

void loop()
{
	if (!client.connected())
	{
		reconnect();
	}
	client.loop();
	HttpServer.handleClient();
	ws2812fx.service();

	long now = millis();

	if (now - capSenseTimestamp > 1000)
	{
		capSenseTimestamp = now;
		capSenseValue = capSensor.capacitiveSensor(30);
		if ((capSenseValue - CAP_SENSE_THRESHOLD) > 0)
		{
			gColourHex = random(0x000000, 0xffffff);
			ws2812fx.setColor(gColourHex);
			sendColour();
		}
		Serial.println(capSenseValue);
	}

	if (now - reportTimestamp > 60 * 1000 * 30)
	{
		sendReport();
		reportTimestamp = now;
	}
}

void sendColour()
{
	char msg[15];
	sprintf(msg, "0x%X", gColourHex);
	client.publish("lampify/hex", msg, RETAIN);
	sprintf(msg, "%d", ws2812fx.getSpeed());
	client.publish("lampify/speed", msg, RETAIN);
	sprintf(msg, "%d", ws2812fx.getBrightness());
	client.publish("lampify/brightness", msg, RETAIN);
}

void sendReport()
{
	uint32_t free;
	uint16_t max;
	uint8_t frag;
	char msg[50];

	ESP.getHeapStats(&free, &max, &frag);

	sprintf(msg, "%ld", capSenseValue);
	client.publish(LAMP_PATH "capsensor", msg, RETAIN);
	sprintf(msg, "%5d", free);
	client.publish(LAMP_PATH "heap/free", msg, RETAIN);
	sprintf(msg, "%5d", max);
	client.publish(LAMP_PATH "heap/max", msg, RETAIN);
	sprintf(msg, "%3d%%", frag);
	client.publish(LAMP_PATH "heap/frag", msg, RETAIN);
	client.publish(LAMP_PATH "resetreason", ESP.getResetReason().c_str(), RETAIN);
}

void reconnect()
{
	while (!client.connected())
	{
		Serial.print("Attempting MQTT connection...");

		if (client.connect(LAMP_NAME, LAMP_PATH "status", 1, 1, "offline"))
		{
			Serial.println("connected");

			if (firstConnect)
			{
				sendColour();
				firstConnect = 0;
			}

			client.subscribe("lampify/hex");
			client.subscribe("lampify/speed");
			client.subscribe("lampify/mode");
			client.subscribe("lampify/brightness");
			client.subscribe(LAMP_PATH "command");

			/* send status information */
			client.publish(LAMP_PATH "wifi/hostname", WiFi.hostname().c_str(), RETAIN);
			client.publish(LAMP_PATH "ip/local", WiFi.localIP().toString().c_str(), RETAIN);
			client.publish(LAMP_PATH "status", "online", RETAIN);
			client.publish(LAMP_PATH "version", FIRMWARE_VERSION, RETAIN);
		}
		else
		{
			Serial.print("failed, rc=");
			Serial.print(client.state());
			Serial.println(" try again in 5 seconds");
			delay(5000);
		}
	}
}

void configModeCallback(WiFiManager *myWiFiManager)
{
	strip.begin();
	strip.show();

	for (int i = 0; i < strip.numPixels(); i++)
	{
		uint32_t color = strip.Color(255, 0, 0);
		if (i % 2 == 0)
		{
			color = strip.Color(0, 255, 0);
		}

		strip.setPixelColor(i, color);
		strip.show();
		delay(33);
	}

	Serial.println("Entered config mode");
	Serial.println(WiFi.softAPIP());
	Serial.println(myWiFiManager->getConfigPortalSSID());
}

void callback(char *topic, byte *payload, unsigned int length)
{
	payload[length] = '\0';
	String s = String((char *)payload);

	char ackTopic[100];
	sprintf(ackTopic, "%s/ack", topic);

	if (strcmp(topic, "lampify/hex") == 0)
	{
		gColourHex = strtol((char *)payload, NULL, 16);
		if (gColourHex == ws2812fx.getColor())
		{
			return;
		}
		ws2812fx.setColor(gColourHex);
	}
	else if (strcmp(topic, "lampify/speed") == 0)
	{
		int speed = atoi((char *)payload);
		if (speed == ws2812fx.getSpeed())
		{
			return;
		}
		ws2812fx.setSpeed(speed);
	}
	else if (strcmp(topic, "lampify/brightness") == 0)
	{
		int brightness = atoi((char *)payload);
		if (brightness == ws2812fx.getBrightness())
		{
			return;
		}
		ws2812fx.setBrightness(brightness > 255 ? 255 : brightness);
	}
	else if (strcmp(topic, "lampify/mode") == 0)
	{
		for (uint i = 0; i < totalModes; i++)
		{
			if (s.equalsIgnoreCase(FX_MODES_STR[i]))
			{
				ws2812fx.setMode(FX_MODES[i]);
			}
		}
	}
	else if (strcmp(topic, LAMP_PATH "command") == 0)
	{
		if (s.equalsIgnoreCase("reset"))
		{
			client.publish(ackTopic, LAMP_NAME);
			wifiManager.resetSettings();
			ESP.reset();
		}
		else if (s.equalsIgnoreCase("reboot"))
		{
			client.publish(ackTopic, LAMP_NAME);
			ESP.reset();
		}
		else if (s.equalsIgnoreCase("report"))
		{
			sendColour();
			sendReport();
		}
	}

	client.publish(ackTopic, LAMP_NAME);
}

void handleNotFound()
{
	HttpServer.send(404, "text/html", "<html><body>404: not found. <a href=\"/update\">update</a></body></html>");
}
