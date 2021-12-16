#include <string>
#include "Adafruit_NeoPixel.h"

class Palette {
  private:
    String label;
    int nb_colors;
    int* colors;

  public:
    Palette(const std::initializer_list<int>& colors, String label) {
      this->label = label;
      this->nb_colors = colors.size();
      this->colors = new int[colors.size()];
      
      int i = 0;
      for (auto& d : colors) {
        this->colors[i] = d;
        i++;
      }
    }
    virtual ~Palette() {}

    int getPixel(float percent) { return this->colors[(int)(percent * nb_colors)]; }
    void setPixel(float percent, int color) { this->colors[(int)(percent * nb_colors)] = color; }
      
    String getLabel() { return label; }
};
