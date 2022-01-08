#include <stdlib.h> 
#include <string> 
#include "DHTesp.h" 
#include "SensorManager.h"
#include "ApiServer.h"
#include "Params.h"

SensorManager sensorManager = SensorManager();
ApiServer server = ApiServer(&sensorManager);

void setup() {
  Serial.begin(115200);
  sensorManager.init(); 
  server.start();
}

void loop(){
  sensorManager.updateSensor();
}
