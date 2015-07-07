#include <pebble.h>

#include "commands_menu.h"

static Window *commands_window;
static SimpleMenuLayer *commands_menu_layer;

#define COMMANDS_MENU_SECTIONS 3
static SimpleMenuSection commands_menu_sections[COMMANDS_MENU_SECTIONS];

/* Vehicle Controls
 *
 * - Remote Start
 * - Lock Doors
 * - Unlock Doors
 * - Flash Lights
 * - Honk Horn
 * - Move Roof
 */
#define COMMANDS_MENU_VEHICLE_ITEMS 6
static SimpleMenuItem commands_menu_vehicle_items[COMMANDS_MENU_VEHICLE_ITEMS];

/* HVAC
 *
 * - Start HVAC
 * - Stop HVAC
 * - Set Temperature
 */
#define COMMANDS_MENU_HVAC_ITEMS 3
static SimpleMenuItem commands_menu_hvac_items[COMMANDS_MENU_HVAC_ITEMS];

/* Charging
 *
 * - Start/Stop Charging
 * - Open Charge Port
 * - Set Charge Limit
 */
#define COMMANDS_MENU_CHARGING_ITEMS 4
static SimpleMenuItem commands_menu_charging_items[COMMANDS_MENU_CHARGING_ITEMS];

static void commands_menu_select_callback(int section, int index, void *ctx) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Menu Item %d", index);
}

static void commands_menu_vehicle_callback(int index, void *ctx) {
  commands_menu_select_callback(0, index, ctx);
}

static void commands_menu_hvac_callback(int index, void *ctx) {
  commands_menu_select_callback(1, index, ctx);
}

static void commands_menu_charging_callback(int index, void *ctx) {
  commands_menu_select_callback(2, index, ctx);
}

static void populate_commands_menu() {
  int num_items = 0;

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Remote Start",
    .callback = commands_menu_vehicle_callback
  };

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Lock Doors",
    .callback = commands_menu_vehicle_callback
  };

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Unlock Doors",
    .callback = commands_menu_vehicle_callback
  };

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Flash Lights",
    .callback = commands_menu_vehicle_callback
  };

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Honk Horn",
    .callback = commands_menu_vehicle_callback
  };

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Move Roof",
    .callback = commands_menu_vehicle_callback
  };

  num_items = 0;
  commands_menu_hvac_items[num_items++] = (SimpleMenuItem){
    .title = "Start HVAC",
    .callback = commands_menu_hvac_callback
  };

  commands_menu_hvac_items[num_items++] = (SimpleMenuItem){
    .title = "Stop HVAC",
    .callback = commands_menu_hvac_callback
  };

  commands_menu_hvac_items[num_items++] = (SimpleMenuItem){
    .title = "Set Temperature",
    .callback = commands_menu_hvac_callback
  };

  num_items = 0;
  commands_menu_charging_items[num_items++] = (SimpleMenuItem){
    .title = "Open Charge Port",
    .callback = commands_menu_charging_callback
  };

  commands_menu_charging_items[num_items++] = (SimpleMenuItem){
    .title = "Stop Charging",
    .callback = commands_menu_charging_callback
  };

  commands_menu_charging_items[num_items++] = (SimpleMenuItem){
    .title = "Start Charging",
    .callback = commands_menu_charging_callback
  };

  commands_menu_charging_items[num_items++] = (SimpleMenuItem){
    .title = "Set Charge Limit",
    .callback = commands_menu_charging_callback
  };

  commands_menu_sections[0] = (SimpleMenuSection){
    .title = "Vehicle Controls",
    .num_items = COMMANDS_MENU_VEHICLE_ITEMS,
    .items = commands_menu_vehicle_items,
  };

  commands_menu_sections[1] = (SimpleMenuSection){
    .title = "Climate",
    .num_items = COMMANDS_MENU_HVAC_ITEMS,
    .items = commands_menu_hvac_items,
  };

  commands_menu_sections[2] = (SimpleMenuSection){
    .title = "Charging",
    .num_items = COMMANDS_MENU_CHARGING_ITEMS,
    .items = commands_menu_charging_items,
  };
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  populate_commands_menu();

  commands_menu_layer = simple_menu_layer_create(bounds, window, commands_menu_sections, COMMANDS_MENU_SECTIONS, NULL);
  layer_add_child(window_layer, simple_menu_layer_get_layer(commands_menu_layer));
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
