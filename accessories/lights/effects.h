#pragma once

#define FASTLED_INTERNAL

#include "EffectManager.h"
#include "Palette.h"
#include "Effect.h"
#include <FastLED.h>

class EffectManager;

class Rainbow : public Effect {
   private:
    float currentHue = 0.0;

   public:
    Rainbow(int num_pixels) : Effect(num_pixels) { this->label = "Rainbow"; }
    ~Rainbow() {}

    void renderTo(CRGB* leds, int frameTime) override;
};

class Solid : public Effect {
   public:
    Solid(int num_pixels) : Effect(num_pixels) { this->label = "Solid"; }
    ~Solid() {}
    
   
    void renderTo(CRGB* leds, int frameTime) override;
};

class Strobe : public Effect {
  private:
    bool strobe_on = false;

  public:
    Strobe(int num_pixels) : Effect(num_pixels) { this->label = "Strobe"; }
    ~Strobe() {}
  
    void renderTo(CRGB* leds, int frameTime) override;
};
