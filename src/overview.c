#include <pebble.h>

#include "overview.h"
#include "commands_menu.h"

static Window *overview_window;

TextLayer *vehicle_name_text;
char vehicle_name_buffer[32];

Layer *horizontal_rule_layer;

TextLayer *range_text;
TextLayer *rated_range_text;
TextLayer *rated_range_unit_text;

TextLayer *charger_text;
TextLayer *charging_state_text;
char charging_state_buffer[16];

TextLayer *location_title_text;
TextLayer *location_text;
char location_buffer[64];

const int16_t MARGIN = 10;
#ifdef PBL_PLATFORM_BASALT
  const int16_t RANGE_HEIGHT = 4;
#else
  const int16_t RANGE_HEIGHT = 0;
#endif

static void overview_select_click_handler(ClickRecognizerRef recognizer, void *context) {
  commands_window_push();
}

static void overview_click_config_provider(void* context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, overview_select_click_handler);
}

void set_rated_range_text(float rated_range, bool is_metric) {
  if (!overview_window) { return; }

  static char rated_range_buffer[4];

  if (is_metric) {
    snprintf(rated_range_buffer, sizeof(rated_range_buffer), "%d", (int)(rated_range * 1.609344));
    text_layer_set_text(rated_range_unit_text, "km");
  } else {
    snprintf(rated_range_buffer, sizeof(rated_range_buffer), "%d", (int)rated_range);
  }

  text_layer_set_text(rated_range_text, rated_range_buffer);

  GSize rm_size = text_layer_get_content_size(rated_range_text);
  Layer *rated_range_unit_text_layer = text_layer_get_layer(rated_range_unit_text);
  layer_set_frame(rated_range_unit_text_layer, GRect(rm_size.w + 11, 44 + RANGE_HEIGHT, 50, 30));
}

static void draw_horizontal_rule_layer(Layer *layer, GContext *ctx) {
  const GRect bounds = layer_get_bounds(layer);

  #ifdef PBL_PLATFORM_BASALT
    graphics_context_set_stroke_color(ctx, GColorWhite);
  #else
    graphics_context_set_stroke_color(ctx, GColorBlack);
  #endif
  graphics_draw_line(ctx, GPoint(0, 0), GPoint(bounds.size.w, 0));
}

static GRect init_text_layer(Layer *parent_layer, TextLayer **text_layer, int16_t y, int16_t h, char *font) {
  GRect bounds = layer_get_bounds(parent_layer);
  const GRect frame = GRect(MARGIN, y, bounds.size.w - 2 * MARGIN, h);

  *text_layer = text_layer_create(frame);
  text_layer_set_background_color(*text_layer, GColorClear);
  #ifdef PBL_PLATFORM_BASALT
    text_layer_set_text_color(*text_layer, GColorWhite);
  #endif
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

  text_layer_set_text(vehicle_name_text, vehicle_name_buffer);

  init_text_layer(window_layer, &range_text, 32, 16, FONT_KEY_GOTHIC_14);
  #ifdef PBL_PLATFORM_BASALT
    init_text_layer(window_layer, &rated_range_text, 40, 40, FONT_KEY_LECO_32_BOLD_NUMBERS);
  #else
    init_text_layer(window_layer, &rated_range_text, 40, 40, FONT_KEY_GOTHIC_28_BOLD);
  #endif
  init_text_layer(window_layer, &rated_range_unit_text, 44 + RANGE_HEIGHT, 28, FONT_KEY_GOTHIC_24_BOLD);

  text_layer_set_text(range_text, "RANGE");
  text_layer_set_text(rated_range_unit_text, "mi");

  init_text_layer(window_layer, &charger_text, 70 + RANGE_HEIGHT, 16, FONT_KEY_GOTHIC_14);
  init_text_layer(window_layer, &charging_state_text, 78 + RANGE_HEIGHT, 28, FONT_KEY_GOTHIC_24_BOLD);

  text_layer_set_text(charging_state_text, charging_state_buffer);
  text_layer_set_text(charger_text, "CHARGER");


  init_text_layer(window_layer, &location_title_text, 104 + RANGE_HEIGHT, 16, FONT_KEY_GOTHIC_14);
  init_text_layer(window_layer, &location_text, 118 + RANGE_HEIGHT, 30, FONT_KEY_GOTHIC_14_BOLD);

  text_layer_set_text(location_text, location_buffer);
  text_layer_set_text(location_title_text, "LOCATION");
  text_layer_set_overflow_mode(location_text, GTextOverflowModeTrailingEllipsis);

  // Horizontal Rule

  int hr_y = 28;
  horizontal_rule_layer = layer_create(GRect(MARGIN, hr_y, bounds.size.w - 2 * MARGIN, hr_y));
  layer_set_update_proc(horizontal_rule_layer, draw_horizontal_rule_layer);
  layer_add_child(window_layer, horizontal_rule_layer);
}

static void window_unload(Window *window) {
  text_layer_destroy(vehicle_name_text);
  layer_destroy(horizontal_rule_layer);
}

void overview_window_push() {
  if (!overview_window) {
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

void overview_window_dirty() {
  if (overview_window) {
    layer_mark_dirty(window_get_root_layer(overview_window));
  }
}

void overview_window_destroy() {
  window_destroy(overview_window);
}
