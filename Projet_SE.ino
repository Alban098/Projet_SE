#include <WiFi.h>
#include <stdlib.h>
#include <string>
#include "ESPAsyncWebServer.h"
#include "Adafruit_NeoPixel.h"
#include "effects.h"
#include "AsyncJson.h"
#include "ArduinoJson.h"

#define NUM_PIXELS      15
#define LED_PIN         15
 
#define PARAM_PAL          "pal"
#define PARAM_EFFECT       "effect"
#define PARAM_ON           "on"
#define PARAM_OFF          "off"
#define PARAM_RED          "r"
#define PARAM_GREEN        "g"
#define PARAM_BLUE         "b"
#define PARAM_COLOR        "color"
#define PARAM_SPEED        "speed"
#define PARAM_BRIGHTNESS   "a"

#define PARAM_STATUS       "status"
#define PARAM_EFFECT_LIST  "effects"
#define PARAM_PALETTE_LIST "palettes"

const char* ssid     = "";
const char* password = "";

Adafruit_NeoPixel leds = Adafruit_NeoPixel(NUM_PIXELS, LED_PIN, NEO_GRB + NEO_KHZ800);
AsyncWebServer server(80);

int brightness = 128;
int effect = 0;
int palette = 0;
int currentColor = 0xFF0000;

Effect* effects[] = {
  new Solid(NUM_PIXELS),
  new Rainbow(NUM_PIXELS),
  new Strobe(NUM_PIXELS)
};

Palette* palettes[] = {
  new Palette({currentColor}, "User Color"),
  new Palette({0x0000FF, 0xFFFFFF, 0xFF0000}, "French"),
  new Palette({0x0000FF, 0xFF00FF, 0x0000FF, 0x00FFFF}, "Cool")
};

int getNbPalettes() {
  return sizeof(palettes)/sizeof(palettes[0]);
}

int getNbEffects() {
  return sizeof(effects)/sizeof(effects[0]);
}

int getPaletteId(String name) {
  for (int i = 0; i < getNbPalettes(); i++) {
    if (strcmp(palettes[i]->getLabel().c_str(), name.c_str()) == 0)
      return i; 
  }
  return 0;
}

int getEffectId(String name) {
  for (int i = 0; i < getNbEffects(); i++) {
    if (strcmp(effects[i]->getLabel().c_str(), name.c_str()) == 0)
      return i; 
  }
  return 0;
}

AsyncResponseStream* generateStatusJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","status");
  DynamicJsonDocument doc(2048);
  doc["palette"] = palette;
  doc["palette_name"] = palettes[palette]->getLabel();
  doc["effect"] = effect;
  doc["effect_name"] = effects[effect]->getLabel();
  doc["user_color"] = palettes[getPaletteId("User Color")]->getPixel(0);
  doc["effect_speed"] = effects[effect]->getSpd();
  doc["brightness"] = brightness;
  String output = "";
  serializeJson(doc, output);
  response->print(output);
  return response;
}

AsyncResponseStream* generateEffectsJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","status");
  DynamicJsonDocument doc(2048);
  for (int i = 0; i < getNbEffects(); i++) {
    doc[effects[i]->getLabel()] = i;
  }
  String output = "";
  serializeJson(doc, output);
  response->print(output);
  return response;
}

AsyncResponseStream* generatePalettesJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","status");
  DynamicJsonDocument doc(2048);
  for (int i = 0; i < getNbPalettes(); i++) {
    doc[palettes[i]->getLabel()] = i;
  }
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
    } else if (strcmp(p->name().c_str(), PARAM_EFFECT_LIST) == 0) {
      request->send(generateEffectsJson(request));
    } else if (strcmp(p->name().c_str(), PARAM_PALETTE_LIST) == 0) {
      request->send(generatePalettesJson(request));
    }
  }
}

void handlePost(AsyncWebServerRequest *request) {
  int paramsNr = request->params();
  for(int i=0; i<paramsNr; i++){
    AsyncWebParameter* p = request->getParam(i);
    if (strcmp(p->name().c_str(), PARAM_PAL) == 0) {
      palette = atoi(p->value().c_str()) % getNbPalettes();
      effects[effect]->setPalette(palettes[palette]);
    } else if (strcmp(p->name().c_str(), PARAM_EFFECT) == 0) {
      effect = atoi(p->value().c_str()) % getNbEffects();
    } else if (strcmp(p->name().c_str(), PARAM_ON) == 0) {
      leds.setBrightness(brightness);
    } else if (strcmp(p->name().c_str(), PARAM_OFF) == 0) {
      leds.setBrightness(0);
    } else if (strcmp(p->name().c_str(), PARAM_BRIGHTNESS) == 0) {
      brightness = atoi(p->value().c_str()) % 256;
      leds.setBrightness(brightness);
    } else if (strcmp(p->name().c_str(), PARAM_RED) == 0) {
      currentColor = (currentColor & 0x00FFFF) | (atoi(p->value().c_str()) << 16);
      palettes[getPaletteId("User Color")]->setPixel(0, currentColor);
    } else if (strcmp(p->name().c_str(), PARAM_GREEN) == 0) {
      currentColor = (currentColor & 0xFF00FF) | (atoi(p->value().c_str()) << 8);
      palettes[getPaletteId("User Color")]->setPixel(0, currentColor);
    } else if (strcmp(p->name().c_str(), PARAM_BLUE) == 0) {
      currentColor = (currentColor & 0xFFFF00) | atoi(p->value().c_str());
      palettes[getPaletteId("User Color")]->setPixel(0, currentColor);
    } else if (strcmp(p->name().c_str(), PARAM_COLOR) == 0) {
      currentColor = atoi(p->value().c_str());
      palettes[getPaletteId("User Color")]->setPixel(0, currentColor);
    } else if (strcmp(p->name().c_str(), PARAM_SPEED) == 0) {
      for (int i = 0; i < getNbEffects(); i++) {
        effects[i]->setSpd(atoi(p->value().c_str()));
      }
    }
  }
  request->send(generateStatusJson(request));
}

void setup() {
  Serial.begin(115200);

  effects[0]->setPalette(palettes[getPaletteId("User Color")]);

  leds.setBrightness(brightness);
  leds.begin();

  // Connect to Wi-Fi network with SSID and password
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  server.on("/api", HTTP_POST, handlePost);
  server.on("/api", HTTP_GET, handleGet);
  server.begin();
}

void loop(){
  effects[effect]->renderTo(leds);
}
