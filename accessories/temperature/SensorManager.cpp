#include "SensorManager.h"

void SensorManager::init() {
    dht.setup(Params::TEMP_PIN, DHTesp::DHT22);
}

void SensorManager::updateSensor() {
  TempAndHumidity readValues = dht.getTempAndHumidity();

  if (dht.getStatus() != 0) {
    temperature = -300;
    humidity = -300;
  } else {
    temperature = readValues.temperature;
    humidity = readValues.humidity;
  }
}
