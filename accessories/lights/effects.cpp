#include "Effects.h"

void Rainbow::renderTo(CRGB* leds, int frameTime) {
  float speedFactor = effectManager->getEffectSpeed()/255.0;
  float increment = speedFactor * 1000 * frameTime/1000;
  currentHue = (currentHue + increment);
  if (currentHue > 255) currentHue -= 255;
  fill_rainbow(leds, num_pixels, (int)currentHue, effectManager->getEffectIntensity()/10);
}

void Solid::renderTo(CRGB* leds, int frameTime) {
  fill_palette(leds, num_pixels, 0, 255/num_pixels, effectManager->getPalette()->getPalette(), 255, LINEARBLEND);
}

void Strobe::renderTo(CRGB* leds, int frameTime) {
  
  if (strobe_on) {
      fill_palette(leds, num_pixels, 0, 255/num_pixels, effectManager->getPalette()->getPalette(), 255, LINEARBLEND);
  } else {
      fill_solid(leds, num_pixels, CRGB::Black);
  }
  strobe_on = !strobe_on;
}
