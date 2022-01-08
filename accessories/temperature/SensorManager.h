#pragma once

#include "DHTesp.h" 
#include "Params.h"

class SensorManager {

  private:
    float humidity;
    float temperature;
    DHTesp dht;

  public:
    SensorManager() {}
    virtual ~SensorManager() {}
    
    void init();
    void updateSensor();

    float getHumidity() { return this->humidity; }
    float getTemperature() { return this->temperature; }
};
