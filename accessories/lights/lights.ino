#define FASTLED_INTERNAL

#include <stdlib.h>
#include <string>
#include "EffectManager.h"
#include "ESPAsyncWebServer.h"
#include "AsyncJson.h"
#include "ArduinoJson.h"
#include "Params.h"
#include "Effects.h"
#include "ApiServer.h"
#include <FastLED.h>

#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB

Effect* EffectManager::effects[Params::NB_EFFECTS] = {
    new Solid(Params::NUM_PIXELS),
    new Rainbow(Params::NUM_PIXELS),
    new Strobe(Params::NUM_PIXELS)
};
        
Palette* EffectManager::palettes[Params::NB_PALETTES] = {
    new Palette("User Color", CRGB::Black),
    new Palette("French", CRGB::Red, CRGB::White, CRGB::Blue),
    new Palette("Cool", CRGB::Blue, CRGB::Magenta, CRGB::Blue, CRGB::Cyan)
};

EffectManager effectManager = EffectManager(Params::FPS, Params::BRIGHTNESS, 0xFF0000);
ApiServer server = ApiServer(&effectManager);

void setup() {
  Serial.begin(115200);
  effectManager.init(); 
  server.start();
}

void loop(){
  effectManager.frame();
}
