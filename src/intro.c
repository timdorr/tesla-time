#include <pebble.h>

#include "intro.h"

static Window *intro_window;
TextLayer *intro_text;

static void intro_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  intro_text = text_layer_create(GRect(0, bounds.size.h / 2 - 20, bounds.size.w, 34));
  text_layer_set_text(intro_text, "Loading...");
  text_layer_set_background_color(intro_text, GColorClear);
  text_layer_set_text_color(intro_text, GColorBlack);
  text_layer_set_font(intro_text, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  text_layer_set_text_alignment(intro_text, GTextAlignmentCenter);

  layer_add_child(window_layer, text_layer_get_layer(intro_text));
}

static void intro_window_unload(Window *window) {
  text_layer_destroy(intro_text);
}

void intro_window_push() {
  if(!intro_window) {
    intro_window = window_create();
    #ifdef PBL_COLOR
      window_set_background_color(intro_window, INTRO_BG_COLOR);
    #endif
    window_set_window_handlers(intro_window, (WindowHandlers) {
        .load = intro_window_load,
        .unload = intro_window_unload,
    });
  }
  window_stack_push(intro_window, true);
}

void intro_window_destroy() {
  window_stack_remove(intro_window, false);
  window_destroy(intro_window);
}
