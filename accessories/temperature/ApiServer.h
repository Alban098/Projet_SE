#pragma once

#include "SensorManager.h"
#include "ESPAsyncWebServer.h"
#include "AsyncJson.h"
#include "ArduinoJson.h"
#include "EEPROMUtils.h"
#include "HTMLPages.h"

class ApiServer {
  private:
    AsyncWebServer server = AsyncWebServer(80);
    
    SensorManager* sensorManager;
    AsyncResponseStream* generateStatusJson(AsyncWebServerRequest *request);
    void handleGet(AsyncWebServerRequest *request);
    void handleSetup(AsyncWebServerRequest *request);

    static void readEEPROM(int addr, String* dest);
    static void writeEEPROM(int addr, const char* value);

    void(* resetFunc) (void) = 0;

  public:
    ApiServer(SensorManager* manager);
    void start();
};
