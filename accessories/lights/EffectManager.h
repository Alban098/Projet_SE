#pragma once

#define FASTLED_INTERNAL

#include <FastLED.h>
#include "Effect.h"
#include "Palette.h"
#include "Params.h"

class EffectManager {
  public:
      static Effect* effects[Params::NB_EFFECTS];
      static Palette* palettes[Params::NB_EFFECTS];

  private:
    CRGB leds[Params::NUM_PIXELS];
    int brightness;
    int palette;
    int effect;
    int lastFrame;
    int frametime;
    int solidColor;
    int effectSpeed;
    int effectIntensity;
    
   public:
    EffectManager(int fps, int brightness, int solidColor) {
      this->palette = 0;
      this->effect = 0;
      this->lastFrame = millis();
      this->frametime = 1000/fps;
      this->brightness = brightness;
      this->solidColor = solidColor;
      this->effectSpeed = 128;
      this->effectIntensity = 128;
      palettes[0]->getPalette()[0] = solidColor;
    }
    
    virtual ~EffectManager() {}

    void init();
    void frame();
  
    int getPaletteId();
    Palette* getPalette();
    void selectPalette(int palette);
    int getEffectId();
    Effect* getEffect();
    void selectEffect(int effect);
    int getMasterBrightness();
    void setMasterBrightness(int brightness);
    int getSolidColor();
    void setSolidColor(int color);
    int getEffectSpeed();
    void setEffectSpeed(int spd);
    int getEffectIntensity();
    void setEffectIntensity(int intensity);
    int getNbPalettes();
    int getNbEffects();
    Palette* getPalette(String name);
    Palette* getPalette(int id);
    Effect* getEffect(String name);
    Effect* getEffect(int id);
};
