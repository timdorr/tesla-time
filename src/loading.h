#pragma once

#define LOADING_BG_COLOR GColorLightGray

extern char loading_status_buffer[32];

void loading_window_push();
void loading_window_dirty();
void loading_window_destroy();
