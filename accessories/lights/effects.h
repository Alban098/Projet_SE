#include <string>
#include "palette.h"
#include "effect.h"

class Rainbow : public Effect {
   private:
    int currentHue = 0;

   public:
    Rainbow(int num_pixels) : Effect(num_pixels) { this->label = "Rainbow"; }
    ~Rainbow() {}

    void renderTo(Adafruit_NeoPixel& leds) override;
};

class Solid : public Effect {
   public:
    Solid(int num_pixels) : Effect(num_pixels) { this->label = "Solid"; }
    ~Solid() {}
    
   
    void renderTo(Adafruit_NeoPixel& leds) override;
};

class Strobe : public Effect {
  private:
    int strobe_cnt = 0;
    bool strobe_on = false;

  public:
    Strobe(int num_pixels) : Effect(num_pixels) { this->label = "Strobe"; }
    ~Strobe() {}
  
    void renderTo(Adafruit_NeoPixel& leds) override;
};
