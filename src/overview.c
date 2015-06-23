#include <pebble.h>

#include "overview.h"
#include "commands_menu.h"

static void overview_select_click_handler(ClickRecognizerRef recognizer, void *context) {
  commands_window_push();
}

static void overview_click_config_provider(void* context) {
    window_single_click_subscribe(BUTTON_ID_SELECT, overview_select_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
}

static void window_unload(Window *window) {
}

void overview_window_push() {
  if(!overview_window) {
    overview_window = window_create();
    #ifdef PBL_COLOR
      window_set_background_color(overview_window, GColorVividCerulean);
    #endif
    window_set_click_config_provider(overview_window, overview_click_config_provider);
    window_set_window_handlers(overview_window, (WindowHandlers) {
        .load = window_load,
        .unload = window_unload,
    });
  }
  window_stack_push(overview_window, true);
}

void overview_window_destroy() {
  window_destroy(overview_window);
}
