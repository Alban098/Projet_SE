#pragma once

#include <stdint.h>

class Params {
    public:
        static const uint8_t TEMP_PIN           = 15;
        static const uint8_t MAX_WIFI_ATTEMPTS  = 25;

        static const char* PARAM_HUMIDITY;         
        static const char* PARAM_TEMPERATURE;

        static const char* PARAM_STATUS;
};
