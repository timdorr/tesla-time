#include <pebble.h>

#include "appkeys.h"
#include "commands_menu.h"

static Window *commands_window;
static SimpleMenuLayer *commands_menu_layer;

static SimpleMenuSection commands_menu_sections[3];

/* Vehicle Controls
 *
 * - Remote Start
 * - Lock Doors
 * - Unlock Doors
 * - Flash Lights
 * - Honk Horn
 */
static SimpleMenuItem commands_menu_vehicle_items[5];

/* HVAC
 *
 * - Start HVAC
 * - Stop HVAC
 */
static SimpleMenuItem commands_menu_hvac_items[2];

/* Charging
 *
 * - Start Charging
 * - Stop Charging
 * - Open Charge Port
 */
static SimpleMenuItem commands_menu_charging_items[3];

static void send_command(const char* command) {
  DictionaryIterator *dict;
  app_message_outbox_begin(&dict);
  dict_write_cstring(dict, KEY_COMMAND, command);
  app_message_outbox_send();
}

static void commands_menu_vehicle_callback(int index, void *ctx) {
  send_command(commands_menu_vehicle_items[index].title);
}

static void commands_menu_hvac_callback(int index, void *ctx) {
  send_command(commands_menu_hvac_items[index].title);
}

static void commands_menu_charging_callback(int index, void *ctx) {
  send_command(commands_menu_charging_items[index].title);
}

static void populate_commands_menu() {
  int num_items = 0;

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Remote Start",
    .callback = commands_menu_vehicle_callback
  };

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Unlock Doors",
    .callback = commands_menu_vehicle_callback
  };

  commands_menu_vehicle_items[num_items++] = (SimpleMenuItem){
    .title = "Lock Doors",
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

  num_items = 0;
  commands_menu_hvac_items[num_items++] = (SimpleMenuItem){
    .title = "Start AC/Heat",
    .callback = commands_menu_hvac_callback
  };

  commands_menu_hvac_items[num_items++] = (SimpleMenuItem){
    .title = "Stop AC/Heat",
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

  commands_menu_sections[0] = (SimpleMenuSection){
    .title = "Vehicle Controls",
    .num_items = ARRAY_LENGTH(commands_menu_vehicle_items),
    .items = commands_menu_vehicle_items,
  };

  commands_menu_sections[1] = (SimpleMenuSection){
    .title = "Climate",
    .num_items = ARRAY_LENGTH(commands_menu_hvac_items),
    .items = commands_menu_hvac_items,
  };

  commands_menu_sections[2] = (SimpleMenuSection){
    .title = "Charging",
    .num_items = ARRAY_LENGTH(commands_menu_charging_items),
    .items = commands_menu_charging_items,
  };
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  populate_commands_menu();

  commands_menu_layer = simple_menu_layer_create(bounds, window, commands_menu_sections, ARRAY_LENGTH(commands_menu_sections), NULL);
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
