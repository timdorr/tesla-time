#include <pebble.h>

#include "overview.h"
#include "commands_menu.h"

static Window *overview_window;
TextLayer *vehicle_name_text;

static const int16_t MARGIN = 10;

static void overview_select_click_handler(ClickRecognizerRef recognizer, void *context) {
  commands_window_push();
}

static void overview_click_config_provider(void* context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, overview_select_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  vehicle_name_text = text_layer_create(GRect(MARGIN, 5, bounds.size.w - 2 * MARGIN, 20));
  text_layer_set_text(vehicle_name_text, "Waiting...");
  text_layer_set_font(vehicle_name_text, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_overflow_mode(vehicle_name_text, GTextOverflowModeFill);
  text_layer_set_background_color(vehicle_name_text, GColorClear);

  layer_add_child(window_layer, text_layer_get_layer(vehicle_name_text));
}

static void window_unload(Window *window) {
}

void overview_window_push() {
  if(!overview_window) {
    overview_window = window_create();
    #ifdef PBL_COLOR
      window_set_background_color(overview_window, GColorPictonBlue);
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
