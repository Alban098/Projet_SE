#include "Adafruit_NeoPixel.h"

class Effect {
  protected:
    String label;
    int spd;   
    int num_pixels;
    Palette* palette;

   public:
    Effect(int num_pixels) {
      this->spd = 255;
      this->num_pixels = num_pixels;
    }
    virtual ~Effect() {}
        
    virtual void renderTo(Adafruit_NeoPixel& leds) {}
  
    String getLabel() { return label; }
    int getSpd() { return spd; }
    void setSpd(int spd) { this->spd = spd; }
    void setPalette(Palette* palette) { this->palette = palette; }
};
