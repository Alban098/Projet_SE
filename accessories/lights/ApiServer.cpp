#include "ApiServer.h"

#define SSID_ADDR       64
#define PASSWORD_ADDR   128
#define EEPROM_SIZE     192

ApiServer::ApiServer(EffectManager* manager) {
  this->effectManager = manager;
}

void ApiServer::start() {
  if (!EEPROM.begin(EEPROM_SIZE)) {
      Serial.println("failed to init EEPROM");
      delay(1000000);
  }

  String ssid = "";
  readEEPROM(SSID_ADDR, &ssid);
  String pass = "";
  readEEPROM(PASSWORD_ADDR, &pass);
  Serial.print("Read SSID : ");
  Serial.println(ssid);
  Serial.print("Read Pass : ");
  Serial.println(pass);

  WiFi.softAP("ESP32", "123456789");
  
  WiFi.begin(ssid.c_str(), pass.c_str());
  int connection_attemps = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    connection_attemps++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    Serial.println("Unable to connect to Wifi, please use integrated Access Point");
  } else {
    Serial.println("");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  }

  std::function<void(AsyncWebServerRequest *request)> postHandler = std::bind(&ApiServer::handlePost, this, std::placeholders::_1);
  std::function<void(AsyncWebServerRequest *request)> getHandler = std::bind(&ApiServer::handleGet, this, std::placeholders::_1);
  std::function<void(AsyncWebServerRequest *request)> setupHandler = std::bind(&ApiServer::handleSetup, this, std::placeholders::_1);
   
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());

  server.on("/api", HTTP_POST, postHandler);
  server.on("/api", HTTP_GET, getHandler);
  server.on("/setup", HTTP_GET, setupHandler);
  
  server.begin();
}

AsyncResponseStream* ApiServer::generateStatusJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","status");
  DynamicJsonDocument doc(2048);
  doc[Params::PARAM_EFFECT] = effectManager->getEffectId();
  doc[Params::PARAM_COLOR] = effectManager->getSolidColor();
  doc[Params::PARAM_SPEED] = effectManager->getEffectSpeed();
  doc[Params::PARAM_INTENSITY] = effectManager->getEffectIntensity();
  doc[Params::PARAM_BRIGHTNESS] = effectManager->getMasterBrightness();
  String output = "";
  serializeJson(doc, output);
  response->print(output);
  return response;
}

AsyncResponseStream* ApiServer::generateEffectsJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","effects");
  DynamicJsonDocument doc(2048);
  for (int i = 0; i < effectManager->getNbEffects(); i++) {
    doc[effectManager->getEffect(i)->getLabel()] = i;
  }
  String output = "";
  serializeJson(doc, output);
  response->print(output);
  return response;
}

AsyncResponseStream* ApiServer::generatePalettesJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","palettes");
  DynamicJsonDocument doc(2048);
  for (int i = 0; i < effectManager->getNbPalettes(); i++) {
    doc[effectManager->getPalette(i)->getLabel()] = i;
  }
  String output = "";
  serializeJson(doc, output);
  response->print(output);
  return response;
}

void ApiServer::handleGet(AsyncWebServerRequest *request) {
  int paramsNr = request->params();
  for(int i=0; i<paramsNr; i++){
    AsyncWebParameter* p = request->getParam(i);
    if (strcmp(p->name().c_str(), Params::PARAM_STATUS) == 0) {
      request->send(generateStatusJson(request));
      break;
    } else if (strcmp(p->name().c_str(), Params::PARAM_EFFECT_LIST) == 0) {
      request->send(generateEffectsJson(request));
      break;
    } else if (strcmp(p->name().c_str(), Params::PARAM_PALETTE_LIST) == 0) {
      request->send(generatePalettesJson(request));
      break;
    }
  }
}

void ApiServer::handlePost(AsyncWebServerRequest *request) {
  int paramsNr = request->params();
  for(int i=0; i<paramsNr; i++){
    AsyncWebParameter* p = request->getParam(i);
    if (strcmp(p->name().c_str(), Params::PARAM_PAL) == 0) {
      effectManager->selectPalette(atoi(p->value().c_str()) % effectManager->getNbPalettes());
    } else if (strcmp(p->name().c_str(), Params::PARAM_EFFECT) == 0) {
      effectManager->selectEffect(atoi(p->value().c_str()) % effectManager->getNbEffects());
    } else if (strcmp(p->name().c_str(), Params::PARAM_BRIGHTNESS) == 0) {
      effectManager->setMasterBrightness(atoi(p->value().c_str()) & 255);
    } else if (strcmp(p->name().c_str(), Params::PARAM_COLOR) == 0) {
      effectManager->setSolidColor(atoi(p->value().c_str()));
    } else if (strcmp(p->name().c_str(), Params::PARAM_SPEED) == 0) {
      effectManager->setEffectSpeed(atoi(p->value().c_str()));
    } else if (strcmp(p->name().c_str(), Params::PARAM_INTENSITY) == 0) {
      effectManager->setEffectIntensity(atoi(p->value().c_str()));
    }
  }
  request->send(generateStatusJson(request));
}

void ApiServer::handleSetup(AsyncWebServerRequest *request) {
  int paramsNr = request->params();
  if (paramsNr > 0) {
    for(int i=0; i<paramsNr; i++){
      AsyncWebParameter* p = request->getParam(i);
      if (strcmp(p->name().c_str(), "ssid") == 0) {
        writeEEPROM(SSID_ADDR, p->value().c_str());
      } else if (strcmp(p->name().c_str(), "password") == 0) {
        writeEEPROM(PASSWORD_ADDR, p->value().c_str());
      }
    }
    const char index_html[] PROGMEM = "<!DOCTYPE html><html><body><h1>Change Wifi Settings</h1><br><p>Wifi settings updated successfully, the module will now restart and try to connect to the new network !</body></html>";
    AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", index_html);
    request->send(response);
    resetFunc();
  } else {
    const char index_html[] PROGMEM = "<!DOCTYPE html><html><body><h1>Change Wifi Settings</h1><form><label>Network SSID : <input name=\"ssid\" autocomplete=\"name\"></label><br><br><label>Password : <input name=\"password\" autocomplete=\"name\"></label><br><br><button>Save</button></form></body></html>";
    AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", index_html);
    request->send(response);
  }
}

void ApiServer::readEEPROM(int addr, String* dest) {
  int valuePresent = EEPROM.read(addr);
  if (valuePresent != 0) {
    int s = 0;
    for (int i = 0; i < 64; i++) {
        byte readValue = EEPROM.read(addr + i);
        if (readValue == 0 || char(readValue) == '\0')
            break;
        *dest += char(readValue);
        s++;
    }
  }
}

void ApiServer::writeEEPROM(int addr, const char* value) {
  for (int i = 0; i < strlen(value); i++) {
      EEPROM.write(addr + i, value[i]);
  }
  EEPROM.write(addr + strlen(value), '\0');
  EEPROM.commit();
}
