#include "ApiServer.h"

#define SSID_ADDR       64
#define PASSWORD_ADDR   96
#define IP_ADDR         160
#define GATE_ADDR       164
#define MASK_ADDR       168


ApiServer::ApiServer(SensorManager* manager) {
  this->sensorManager = manager;
}

void ApiServer::start() {
  EEPROMUtils::init();
  
  uint8_t i[4] = {0, 0, 0, 0};
  uint8_t g[4] = {0, 0, 0, 0};
  uint8_t m[4] = {0, 0, 0, 0};
  EEPROMUtils::readIP(IP_ADDR, i);
  delay(50);
  EEPROMUtils::readIP(GATE_ADDR, g);
  delay(50);
  EEPROMUtils::readIP(MASK_ADDR, m);
  delay(50);
  IPAddress local_IP = IPAddress(i[0], i[1], i[2], i[3]);
  IPAddress gateway = IPAddress(g[0], g[1], g[2], g[3]);
  IPAddress mask = IPAddress(m[0], m[1], m[2], m[3]);

  if (!WiFi.config(local_IP, gateway, mask, IPAddress(8, 8, 8, 8), IPAddress(8, 8, 4, 4)))
    Serial.println("Static Addressing Failed to configure");
  
  char netw[64];
  EEPROMUtils::readString(SSID_ADDR, netw);
  delay(50);
  char pass[64];
  EEPROMUtils::readString(PASSWORD_ADDR, pass);
  Serial.println(netw);
  Serial.println(pass);
  Serial.println(local_IP);
  Serial.println(gateway);
  Serial.println(mask);

  WiFi.begin(netw, pass);
  uint8_t connection_attempts = 0;
  while (WiFi.status() != WL_CONNECTED && connection_attempts < Params::MAX_WIFI_ATTEMPTS) {
    delay(500);
    Serial.print(".");
    connection_attempts++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    Serial.println("Unable to connect to Wifi, please use Integrated Access Point ('InfinityCube', '123456789')");
    WiFi.softAP("tmp_sensor", "123456789");
    Serial.print("Access Point IP : ");
    Serial.println(WiFi.softAPIP());  
  } else {
    Serial.println("");
    Serial.print("IP : ");
    Serial.println(WiFi.localIP());
  }

  std::function<void(AsyncWebServerRequest *request)> getHandler = std::bind(&ApiServer::handleGet, this, std::placeholders::_1);
  std::function<void(AsyncWebServerRequest *request)> setupHandler = std::bind(&ApiServer::handleSetup, this, std::placeholders::_1);
   
  server.on("/api", HTTP_GET, getHandler);
  server.on("/setup", HTTP_GET, setupHandler);
  
  server.begin();
}

AsyncResponseStream* ApiServer::generateStatusJson(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  response->addHeader("type","status");
  DynamicJsonDocument doc(2048);
  doc[Params::PARAM_TEMPERATURE] = sensorManager-> getTemperature();
  doc[Params::PARAM_HUMIDITY] = sensorManager->getHumidity();
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
      return;
    }
  }
  request->send(generateStatusJson(request));
}

void ApiServer::handleSetup(AsyncWebServerRequest *request) {
  uint8_t paramsNr = request->params();
  if (paramsNr > 0) {
    for(uint8_t i=0; i<paramsNr; i++){
      AsyncWebParameter* p = request->getParam(i);
      if (strcmp(p->name().c_str(), "ssid") == 0) {
        EEPROMUtils::writeString(SSID_ADDR, p->value().c_str());
      } else if (strcmp(p->name().c_str(), "password") == 0) {
        EEPROMUtils::writeString(PASSWORD_ADDR, p->value().c_str());
      } else if (strcmp(p->name().c_str(), "ip_0") == 0) {
        EEPROMUtils::writeInt(IP_ADDR, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "ip_1") == 0) {
        EEPROMUtils::writeInt(IP_ADDR + 1, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "ip_2") == 0) {
        EEPROMUtils::writeInt(IP_ADDR + 2, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "ip_3") == 0) {
        EEPROMUtils::writeInt(IP_ADDR + 3, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "gateway_0") == 0) {
        EEPROMUtils::writeInt(GATE_ADDR, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "gateway_1") == 0) {
        EEPROMUtils::writeInt(GATE_ADDR + 1, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "gateway_2") == 0) {
        EEPROMUtils::writeInt(GATE_ADDR + 2, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "gateway_3") == 0) {
        EEPROMUtils::writeInt(GATE_ADDR + 3, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "mask_0") == 0) {
        EEPROMUtils::writeInt(MASK_ADDR, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "mask_1") == 0) {
        EEPROMUtils::writeInt(MASK_ADDR + 1, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "mask_2") == 0) {
        EEPROMUtils::writeInt(MASK_ADDR + 2, atoi(p->value().c_str()));
      } else if (strcmp(p->name().c_str(), "mask_3") == 0) {
        EEPROMUtils::writeInt(MASK_ADDR + 3, atoi(p->value().c_str()));
      }
    }
    EEPROMUtils::commit();
    AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", HTMLPages::WIFI_CONFIRMATION);
    request->send(response);
    resetFunc();
  } else {
    char buf[2048];
    sprintf(buf, HTMLPages::WIFI_FORM, net_ssid, net_pass, net_ip[0], net_ip[1], net_ip[2], net_ip[3], net_gateway[0], net_gateway[1], net_gateway[2], net_gateway[3], net_mask[0], net_mask[1], net_mask[2], net_mask[3]); 
    AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", buf);
    request->send(response);
  }
}
