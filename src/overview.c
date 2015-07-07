#include <pebble.h>

#include "overview.h"
#include "commands_menu.h"

static Window *overview_window;
Layer *loading_overlay_layer;
TextLayer *loading_text;
TextLayer *vehicle_name_text;
Layer *horizontal_rule_layer;
TextLayer *rated_miles_text;
TextLayer *rated_miles_unit_text;

bool loading;
const int16_t MARGIN = 10;

static void overview_select_click_handler(ClickRecognizerRef recognizer, void *context) {
  commands_window_push();
}

static void overview_click_config_provider(void* context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, overview_select_click_handler);
}

void set_rated_miles_text(char* rated_miles) {
  text_layer_set_text(rated_miles_text, rated_miles);

  GSize rm_size = text_layer_get_content_size(rated_miles_text);
  Layer *rated_miles_unit_text_layer = text_layer_get_layer(rated_miles_unit_text);
  layer_set_frame(rated_miles_unit_text_layer, GRect(rm_size.w + 11, 38, 50, 30));
}

static void draw_horizontal_rule_layer(Layer *layer, GContext *ctx) {
  const GRect bounds = layer_get_bounds(layer);

  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_draw_line(ctx, GPoint(0, 0), GPoint(bounds.size.w, 0));
}

static void draw_loading_overlay_layer(Layer *layer, GContext *ctx) {
  const GRect bounds = layer_get_bounds(layer);

  graphics_context_set_fill_color(ctx, WINDOW_BG_COLOR);
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);
}

static GRect init_text_layer(Layer *parent_layer, TextLayer **text_layer, int16_t y, int16_t h, char *font) {
  GRect bounds = layer_get_bounds(parent_layer);
  const GRect frame = GRect(MARGIN, y, bounds.size.w - 2 * MARGIN, h);

  *text_layer = text_layer_create(frame);
  text_layer_set_background_color(*text_layer, GColorClear);
  text_layer_set_text_color(*text_layer, GColorWhite);
  text_layer_set_font(*text_layer, fonts_get_system_font(font));
  text_layer_set_overflow_mode(*text_layer, GTextOverflowModeFill);
  layer_add_child(parent_layer, text_layer_get_layer(*text_layer));

  return frame;
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  // Text Layers

  init_text_layer(window_layer, &vehicle_name_text, 5, 20, FONT_KEY_GOTHIC_18_BOLD);
  init_text_layer(window_layer, &rated_miles_text, 28, 40, FONT_KEY_LECO_38_BOLD_NUMBERS);
  init_text_layer(window_layer, &rated_miles_unit_text, 38, 30, FONT_KEY_GOTHIC_28_BOLD);
  text_layer_set_text(rated_miles_unit_text, "mi");

  // Horizontal Rule

  int hr_y = 28;
  horizontal_rule_layer = layer_create(GRect(MARGIN, hr_y, bounds.size.w - 2 * MARGIN, hr_y));
  layer_set_update_proc(horizontal_rule_layer, draw_horizontal_rule_layer);
  layer_add_child(window_layer, horizontal_rule_layer);

  // Loading Screen

  loading_overlay_layer = layer_create(bounds);
  layer_set_update_proc(loading_overlay_layer, draw_loading_overlay_layer);
  layer_add_child(window_layer, loading_overlay_layer);

  loading_text = text_layer_create(GRect(0, bounds.size.h / 2 - 20, bounds.size.w, 30));
  text_layer_set_text(loading_text, "Loading...");
  text_layer_set_background_color(loading_text, WINDOW_BG_COLOR);
  text_layer_set_text_color(loading_text, GColorWhite);
  text_layer_set_font(loading_text, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  text_layer_set_text_alignment(loading_text, GTextAlignmentCenter);

  layer_add_child(loading_overlay_layer, text_layer_get_layer(loading_text));
  loading = true;
}

static void window_unload(Window *window) {
  text_layer_destroy(vehicle_name_text);
  layer_destroy(horizontal_rule_layer);
}

void overview_window_push() {
  if(!overview_window) {
    overview_window = window_create();
    #ifdef PBL_COLOR
      window_set_background_color(overview_window, WINDOW_BG_COLOR);
    #endif
    window_set_click_config_provider(overview_window, overview_click_config_provider);
    window_set_window_handlers(overview_window, (WindowHandlers) {
        .load = window_load,
        .unload = window_unload,
    });
  }
  window_stack_push(overview_window, true);
}

void overview_window_loaded() {
  if (loading) {
    layer_remove_from_parent(loading_overlay_layer);
    text_layer_destroy(loading_text);
    layer_destroy(loading_overlay_layer);
    loading = false;
  }
}

void overview_window_destroy() {
  window_destroy(overview_window);
}
