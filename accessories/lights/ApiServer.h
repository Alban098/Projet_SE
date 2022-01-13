#pragma once

#include "EffectManager.h"
#include "ESPAsyncWebServer.h"
#include "AsyncJson.h"
#include "ArduinoJson.h"
#include "EEPROMUtils.h"
#include "HTMLPages.h"

class ApiServer {
  private:
    AsyncWebServer server = AsyncWebServer(80);
    
    EffectManager* effectManager;
    AsyncResponseStream* generateStatusJson(AsyncWebServerRequest *request);
    AsyncResponseStream* generateEffectsJson(AsyncWebServerRequest *request);
    AsyncResponseStream* generatePalettesJson(AsyncWebServerRequest *request);
    void handleGet(AsyncWebServerRequest *request);
    void handlePost(AsyncWebServerRequest *request);
    void handleSetup(AsyncWebServerRequest *request);

    void(* resetFunc) (void) = 0;

  public:
    ApiServer(EffectManager* manager);
    void start();
};
