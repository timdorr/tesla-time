#include <pebble.h>

#include "utils.h"
#include "appkeys.h"
#include "overview.h"
#include "commands_menu.h"

static AppSync app_sync;
static uint8_t* app_sync_buffer;

static void sync_changed_handler(const uint32_t key, const Tuple *new_tuple, const Tuple *old_tuple, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Sync Key Received: %lu", key);

  static char vehicle_name_buffer[32];

  switch(key) {
    case KEY_VEHICLE_NAME:
      snprintf(vehicle_name_buffer, sizeof(vehicle_name_buffer), "%s", upcase((char*)new_tuple->value->cstring));
      text_layer_set_text(vehicle_name_text, vehicle_name_buffer);
    break;
  }
}

static void sync_error_handler(DictionaryResult dict_error, AppMessageResult app_message_error, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Sync Error: %d", dict_error);
}

static void init() {
  overview_window_push();

  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());

  Tuplet initial_values[] = {
    TupletCString(KEY_VEHICLE_NAME, "CONTACTING TESLA...")
  };

  uint16_t app_sync_buffer_size = dict_calc_buffer_size_from_tuplets(initial_values, ARRAY_LENGTH(initial_values));
  app_sync_buffer = malloc(app_sync_buffer_size);

  app_sync_init(
    &app_sync,
    app_sync_buffer, app_sync_buffer_size,
    initial_values, ARRAY_LENGTH(initial_values),
    sync_changed_handler, sync_error_handler,
    NULL
  );
}

static void deinit() {
  overview_window_destroy();

  app_sync_deinit(&app_sync);
  free(app_sync_buffer);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
