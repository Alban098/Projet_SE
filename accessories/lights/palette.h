#pragma once

#include <string>

class Palette {
  private:
    String label;
    CRGBPalette16 palette;

  public:
    Palette(String label, const CRGB &c00) {
      this->label = label;
      this->palette = CRGBPalette16(c00); 
    }
    Palette(String label, const CRGB &c00, const CRGB &c01) {
      this->label = label;
      this->palette = CRGBPalette16(c00, c01); 
    }
    Palette(String label, const CRGB &c00, const CRGB &c01, const CRGB &c02) {
      this->label = label;
      this->palette = CRGBPalette16(c00, c01, c02); 
    }
    Palette(String label, const CRGB &c00, const CRGB &c01, const CRGB &c02, const CRGB &c03) {
      this->label = label;
      this->palette = CRGBPalette16(c00, c01, c02, c03); 
    }
    Palette(String label, const CRGB &c00, const CRGB &c01, const CRGB &c02, const CRGB &c03, const CRGB &c04, const CRGB &c05, const CRGB &c06, const CRGB &c07, const CRGB &c08, const CRGB &c09, const CRGB &c10, const CRGB &c11, const CRGB &c12, const CRGB &c13, const CRGB &c14, const CRGB &c15) {
      this->label = label;
      this->palette = CRGBPalette16(c00, c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11, c12, c13, c14, c15); 
    }
    virtual ~Palette() {}

    void setColor(int color) {
      this->palette = CRGBPalette16(CRGB(color));
    }

    CRGBPalette16 getPalette() {
      return this->palette;
    }
      
    String getLabel() { return label; }
};
