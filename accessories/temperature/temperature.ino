#include <WiFi.h>
#include <stdlib.h>
#include <string>
#include "ESPAsyncWebServer.h"
#include "DHTesp.h"
#include "AsyncJson.h"
#include "ArduinoJson.h"

#define TEMP_PIN         26
 
#define PARAM_TEMPERATURE  "temperature"
#define PARAM_HUMIDITY     "humidity"

#define PARAM_STATUS       "status"

const char* ssid     = "SSID";
const char* password = "PASSWORD";

DHTesp dht;
AsyncWebServer server(80);

float temperature = 0;
float humidity = 0;

AsyncResponseStream* generateStatusJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","status");
  DynamicJsonDocument doc(2048);
  doc[PARAM_TEMPERATURE] = temperature;
  doc[PARAM_HUMIDITY] = humidity;
  String output = "";
  serializeJson(doc, output);
  response->print(output);
  return response;
}

void handleGet(AsyncWebServerRequest *request) {
  int paramsNr = request->params();
  for(int i=0; i<paramsNr; i++){
    AsyncWebParameter* p = request->getParam(i);
    if (strcmp(p->name().c_str(), PARAM_STATUS) == 0) {
      request->send(generateStatusJson(request));
      break;
    }
  }
}

String updateReadValues() {
  TempAndHumidity readValues = dht.getTempAndHumidity();

  if (dht.getStatus() != 0) {
    temperature = -300;
    humidity = -300;
  } else {
    temperature = readValues.temperature;
    humidity = readValues.humidity;
  }
}

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi network with SSID and password
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  dht.setup(TEMP_PIN, DHTesp::DHT22);
  server.on("/api", HTTP_GET, handleGet);
  server.begin();
}

void loop() {
  updateReadValues();
}
