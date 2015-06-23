#include <pebble.h>

#include "commands_menu.h"

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
}

static void window_unload(Window *window) {
  simple_menu_layer_destroy(commands_menu_layer);
  window_destroy(window);
  commands_window = NULL;
}

void commands_window_push() {
  if(!commands_window) {
    commands_window = window_create();
    #ifdef PBL_COLOR
      window_set_background_color(commands_window, GColorSpringBud);
    #endif
    window_set_window_handlers(commands_window, (WindowHandlers) {
        .load = window_load,
        .unload = window_unload,
    });
  }
  window_stack_push(commands_window, true);
}
