#include "effects.h"

void Rainbow::renderTo(Adafruit_NeoPixel& leds) {
  currentHue = (int)(currentHue + 100 * spd/255.0) % 65536;
  for (int i = 0; i < num_pixels; i++) {
    leds.setPixelColor(i, Adafruit_NeoPixel::ColorHSV(currentHue + i * (255*255 / num_pixels), 255, 255));
  }
  leds.show();
}

void Solid::renderTo(Adafruit_NeoPixel& leds) {
  for (int i = 0; i < num_pixels; i++) {
      leds.setPixelColor(i, palette->getPixel((float)i/num_pixels));
  }
  leds.show();
}

void Strobe::renderTo(Adafruit_NeoPixel& leds) {
  strobe_cnt = strobe_cnt + 100 * spd/255.0;
  for (int i = 0; i < num_pixels; i++) {
    if (strobe_on)
      leds.setPixelColor(i, palette->getPixel((float)i/num_pixels));
    else
      leds.setPixelColor(i, 0);
  }
  leds.show();
  if (strobe_cnt > 1000) {
    strobe_cnt = 0;
    strobe_on = !strobe_on;
  }
}
