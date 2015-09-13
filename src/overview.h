#pragma once

#define WINDOW_BG_COLOR GColorBlueMoon

extern char vehicle_name_buffer[32];
extern char charging_state_buffer[16];
extern char location_buffer[64];

void overview_window_push();
void overview_window_dirty();
void overview_window_destroy();

void set_rated_range_text(int rated_range, bool is_metric);
