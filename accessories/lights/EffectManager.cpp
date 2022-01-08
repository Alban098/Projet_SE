#include "EffectManager.h"

void EffectManager::init() {
  FastLED.addLeds<WS2812B, Params::LED_PIN, GRB>(leds, Params::NUM_PIXELS).setCorrection(TypicalLEDStrip);
  FastLED.setBrightness(brightness);
  for (int i = 0; i < getNbEffects(); i++)
    effects[i]->linkManager(this);
}

void EffectManager::frame() {
  effects[effect]->renderTo(leds, frametime);
  FastLED.show();
  if (millis() - lastFrame < (unsigned long)frametime)
    delay(frametime - (millis() - lastFrame));
  lastFrame = millis();
}

int EffectManager::getPaletteId() { 
  return this->palette;
}

Palette* EffectManager::getPalette() {
  return palettes[palette];
}

void EffectManager::selectPalette(int palette) { 
  this->palette = min(Params::NB_PALETTES, max(palette, 0));
}

int EffectManager::getEffectId() { 
  return this->effect;
}

Effect* EffectManager::getEffect() {
  return effects[effect];
}

void EffectManager::selectEffect(int effect) { 
  this->effect = min(Params::NB_EFFECTS, max(effect, 0));
}

int EffectManager::getMasterBrightness() {
  return this->brightness;
}

void EffectManager::setMasterBrightness(int brightness) {
  this->brightness = min(255, max(brightness, 0));
  FastLED.setBrightness(brightness);
}

int EffectManager::getSolidColor() {
  return this->solidColor;
}

void EffectManager::setSolidColor(int color) {
  this->solidColor = min(0xFFFFFF, max(color, 0));
  palettes[0]->setColor(color);
}

int EffectManager::getEffectSpeed() {
  return this->effectSpeed;
}

void EffectManager::setEffectSpeed(int spd) {
  this->effectSpeed = min(255, max(spd, 0));;
}

int EffectManager::getEffectIntensity() {
  return this->effectIntensity;
}

void EffectManager::setEffectIntensity(int intensity) {
  this->effectIntensity = min(255, max(intensity, 0));;
}

int EffectManager::getNbPalettes() {
  return Params::NB_PALETTES;
}

int EffectManager::getNbEffects() {
  return Params::NB_EFFECTS;
}

Palette* EffectManager::getPalette(String name) {
  for (int i = 0; i < getNbPalettes(); i++) {
    if (strcmp(palettes[i]->getLabel().c_str(), name.c_str()) == 0)
      return palettes[i]; 
  }
  return palettes[0];
}

Palette* EffectManager::getPalette(int id) {
  return palettes[id]; 
}

Effect* EffectManager::getEffect(int id) {  
  return effects[id]; 
}
