#pragma once

class Params {
    public:
        static const int NUM_PIXELS     = 15;
        static const int LED_PIN        = 15;
        static const int NB_EFFECTS     = 3;
        static const int NB_PALETTES    = 3;
        static const int FPS            = 60;
        static const int BRIGHTNESS     = 128;

        static const char* PARAM_PAL;
        static const char* PARAM_EFFECT;
        static const char* PARAM_COLOR;              
        static const char* PARAM_SPEED;     
        static const char* PARAM_INTENSITY;         
        static const char* PARAM_BRIGHTNESS;

        static const char* PARAM_STATUS;
        static const char* PARAM_EFFECT_LIST;
        static const char* PARAM_PALETTE_LIST;
};
