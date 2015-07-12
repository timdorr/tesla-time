#pragma once

#define WINDOW_BG_COLOR GColorBlueMoon

extern TextLayer *vehicle_name_text;
extern TextLayer *rated_miles_text;
extern TextLayer *charging_state_text;
extern TextLayer *location_text;

void overview_window_push();
void overview_window_destroy();

void set_rated_miles_text(char* rated_miles);
