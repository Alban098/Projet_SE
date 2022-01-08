#pragma once

class EffectManager;

class Effect {
  protected:
    String label;
    int num_pixels;
    EffectManager* effectManager;

   public:
    Effect(int num_pixels) {
      this->num_pixels = num_pixels;
      this->effectManager = effectManager;
    }
    virtual ~Effect() {}
        
    virtual void renderTo(CRGB* leds, int frameTime) {}
  
    String getLabel() { return label; }
    void linkManager(EffectManager* manager) { this->effectManager = manager; }
};
