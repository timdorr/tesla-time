#include <pebble.h>

#include "loading.h"

static Window *loading_window;
TextLayer *loading_text;

TextLayer *status_text;
char loading_status_buffer[32];

static void loading_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  loading_text = text_layer_create(GRect(0, bounds.size.h / 2 - 20, bounds.size.w, 34));
  text_layer_set_text(loading_text, "Loading...");
  text_layer_set_background_color(loading_text, GColorClear);
  text_layer_set_text_color(loading_text, GColorBlack);
  text_layer_set_font(loading_text, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  text_layer_set_text_alignment(loading_text, GTextAlignmentCenter);

  layer_add_child(window_layer, text_layer_get_layer(loading_text));

  status_text = text_layer_create(GRect(0, bounds.size.h / 2 + 20, bounds.size.w, 34));
  text_layer_set_background_color(status_text, GColorClear);
  text_layer_set_text_color(status_text, GColorBlack);
  text_layer_set_font(status_text, fonts_get_system_font(FONT_KEY_GOTHIC_14));
  text_layer_set_text_alignment(status_text, GTextAlignmentCenter);

  text_layer_set_text(status_text, loading_status_buffer);
  layer_add_child(window_layer, text_layer_get_layer(status_text));
}

static void loading_window_unload(Window *window) {
  text_layer_destroy(loading_text);
}

void loading_window_push() {
  if(!loading_window) {
    loading_window = window_create();
    #ifdef PBL_COLOR
      window_set_background_color(loading_window, LOADING_BG_COLOR);
    #endif
    window_set_window_handlers(loading_window, (WindowHandlers) {
        .load = loading_window_load,
        .unload = loading_window_unload,
    });
  }
  window_stack_push(loading_window, true);
}

void loading_window_dirty() {
  if (loading_window) {
    layer_mark_dirty(window_get_root_layer(loading_window));
  }
}

void loading_window_destroy() {
  window_stack_remove(loading_window, false);
  window_destroy(loading_window);
}
