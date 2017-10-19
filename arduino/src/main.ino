#include <ESP8266WiFi.h>          // ESP8266 Core WiFi Library (you most likely already have this in your sketch)
#include <DNSServer.h>            // Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>     // Local WebServer used to serve the configuration portal
#include <WiFiManager.h>          // https://github.com/tzapu/WiFiManager WiFi Configuration Magic
#include <PubSubClient.h>         // https://github.com/knolleary/pubsubclient/
#include <FastLED.h>              // https://github.com/FastLED/FastLED  https://github.com/FastLED/FastLED/wiki/Pixel-reference

/**
 * In order to work with WEMOS D1 Mini (CapacitiveSensor)
 * https://github.com/PaulStoffregen/CapacitiveSensor/issues/15
 * #line 049: replace with 80000000
 * #line 148: replace with 80000000
 */
#include <CapacitiveSensor.h>  	// https://github.com/PaulStoffregen/CapacitiveSensor

// 00 -> D3 : LED_BUILTIN
// 02 -> D4
// 04 -> D2
// 12 -> D6
// 15 -> D8

#define NUM_LEDS 12
#define DATA_PIN 15          	// pin D8
#define CAP_SENSE_SEND_PIN 4   	// pin D2 RESISTOR
#define CAP_SENSE_SENSOR_PIN 12 // pin D6
#define CAP_SENSE_THRESHOLD 150

CRGBArray<NUM_LEDS> leds;
WiFiClient          espClient;
PubSubClient        client(espClient);
WiFiManager         wifiManager;
int CapSenseMin     = 0;
long lastMsg        = 0;

const char *main_topic 	= "<TOPIC>";
const char *lamp_name 	= "<THIS_LAMPS_NAME>";
const char *mqtt_server = "<SERVER_ADDRESS>";
const int 	mqtt_port 	= 1883;

CapacitiveSensor capSensor = CapacitiveSensor(CAP_SENSE_SEND_PIN, CAP_SENSE_SENSOR_PIN);
CRGB gColour = CRGB(random(255), random(255), random(255));
long start = millis();

void reconnect();
void askColour();
void sendStatus(int status);
void sendColour(CRGB colour);
void rainbow(uint8_t duration=33);
void fadeToColour(CRGB next, uint8_t duration=33);
void configModeCallback(WiFiManager *myWiFiManager);
void callback(char* topic, byte* payload, unsigned int length);

void setup(){
	Serial.begin(115200);
	Serial.println("Enter setup function");

	FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
	for (size_t i = 0; i < NUM_LEDS; i++) {
		leds[i] = CRGB::LawnGreen;
		FastLED.delay(250);
	}

	client.setServer(mqtt_server, mqtt_port);
	client.setCallback(callback);

	wifiManager.setRemoveDuplicateAPs(false);
	wifiManager.setAPCallback(configModeCallback);
	wifiManager.autoConnect("Lamp Configuration");

	capSensor.set_CS_Timeout_Millis(5000);
	CapSenseMin = capSensor.capacitiveSensor(30);

	fadeToColour(gColour, 33);
	sendStatus(1);
	askColour();

	Serial.println("Leave setup function");
}

void loop(){
	if (!client.connected()) {
		reconnect();
	}
	client.loop();

  	long now = millis();

	if (now - start > 1000) {
		start = millis();
		long capSenseValue =  capSensor.capacitiveSensor(30);
		if((capSenseValue - CAP_SENSE_THRESHOLD) > 0){
			gColour = CRGB(random(255), random(255), random(255));
			sendColour(gColour);
			fadeToColour(gColour);
		}
		Serial.println(capSenseValue);
	}
}

void sendColour(CRGB colour){
	char msg[50];
	sprintf(msg, "RGB %d, %d, %d", gColour.r, gColour.g, gColour.b);
	client.publish(main_topic, msg);
	Serial.print("Message sent: ");
	Serial.println(msg);
}

void askColour(){
	char msg[] = "colour?";
	client.publish(main_topic, msg);
	Serial.print("Message sent: ");
	Serial.println(msg);
}

void sendStatus(int status){
	char str[12];
	char topic[12];
	sprintf(str, "%d", status);
	sprintf(topic, "status/%s", lamp_name);
	client.publish(topic, str);

	Serial.print("Sent status: ");
	Serial.println(status);
}

void callback(char* topic, byte* payload, unsigned int length) {
	lastMsg = millis();
	payload[length] = '\0';
	String s = String((char*)payload);
	if (s.equalsIgnoreCase("reset")) {
		wifiManager.resetSettings();
		ESP.reset();
	} else if (s.startsWith("status")) {
		sendStatus(1);
	} else if (s.startsWith("rainbow")){
		rainbow();
		fadeToColour(gColour);
	}
	else if (s.startsWith("colour?")){
		sendColour(gColour);
	}

	else if (s.startsWith("RGB")) {
		char aux[15];
		char *pchar;
		int i = 0;
		int numbers[3];

		memcpy(aux, (char*)payload+4, strlen((char*)payload) -4);
		aux[strlen((char*) payload)-4] = 0;
		Serial.println(aux);

		pchar = strtok (aux," ,");
		while (pchar != NULL && i < 3) {
			numbers[i] = atoi(pchar);
			pchar = strtok (NULL, " ,.-");
			i++;
		}

		if(numbers[0] == gColour.r && numbers[1] == gColour.g && numbers[2] == gColour.b)
			return;

		gColour = CRGB(numbers[0], numbers[1], numbers[2]);
		fadeToColour(gColour, 33);
	}

}

void reconnect() {
	while (!client.connected()) {
		Serial.print("Attempting MQTT connection...");
		char name[50];
		sprintf(name, "%s's lamp", lamp_name);
		if (client.connect(name)) {
			Serial.println("connected");
			client.subscribe(main_topic);
			askColour();
			sendStatus(1);
		} else {
			Serial.print("failed, rc=");
			Serial.print(client.state());
			Serial.println(" try again in 5 seconds");
			delay(5000);
		}
	}
}

void fadeToColour(CRGB next, uint8_t duration) {

	for (size_t i = 0; i < NUM_LEDS; i++) {
		leds[i].fadeToBlackBy( 192 );
		FastLED.delay(duration);
	}
	for (size_t i = 0; i < NUM_LEDS; i++) {
		leds[i] = next;
	}
	FastLED.show();
}

void rainbow(uint8_t duration){

	for (size_t i = 0; i < NUM_LEDS; i++) {
		leds[i].fadeToBlackBy( 192 );
		FastLED.delay(duration);
	}

	for(uint8_t i = 0; i < 255; i++){
		for(int k = 0; k <= NUM_LEDS; k++){
			leds[k] = CHSV(i, 255, 255);
			FastLED.delay(10);
		}
	}
}

void configModeCallback(WiFiManager *myWiFiManager){
	for(int i = 0; i < NUM_LEDS; i++) {
		if(i % 2 == 0)
			leds[i] = CRGB::Red;
		else
			leds[i] = CRGB::Green;
		FastLED.delay(33);
	}
	Serial.println("Entered config mode");
	Serial.println(WiFi.softAPIP());
	Serial.println(myWiFiManager->getConfigPortalSSID());
}
