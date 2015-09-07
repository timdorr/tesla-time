#include <pebble.h>

#include "utils.h"
#include "appkeys.h"
#include "loading.h"
#include "overview.h"
#include "commands_menu.h"

bool loading;

static AppSync app_sync;
static uint8_t* app_sync_buffer;
static int loading_status;

static void sync_changed_handler(const uint32_t key, const Tuple *new_tuple, const Tuple *old_tuple, void *context) {
  // APP_LOG(APP_LOG_LEVEL_DEBUG, "App Sync Key Received: %lu", key);

  static char rated_miles_buffer[4];

  switch(key) {
    case KEY_LOADING_STATUS:
      loading_status = (int)new_tuple->value->int32;
      if (loading_status == 1) {
        snprintf(loading_status_buffer, sizeof(loading_status_buffer), "Login via settings!");
      } else if (loading_status == 2) {
        snprintf(loading_status_buffer, sizeof(loading_status_buffer), "Contacting Tesla...");
      } else if (loading_status == 3) {
        snprintf(loading_status_buffer, sizeof(loading_status_buffer), "Retrieving vehicle...");
      } else if (loading_status >= 4) {
        snprintf(
          loading_status_buffer,
          sizeof(loading_status_buffer),
          "Getting status (%s%s%s)...",
          (loading_status & 8)  == 0 ? "V" : "",
          (loading_status & 16) == 0 ? "C" : "",
          (loading_status & 32) == 0 ? "D" : ""
        );
      }

      loading_window_dirty();
    break;
    case KEY_VEHICLE_NAME:
      snprintf(vehicle_name_buffer, sizeof(vehicle_name_buffer), "%s", upcase((char*)new_tuple->value->cstring));
    break;
    case KEY_RATED_MILES:
      snprintf(rated_miles_buffer, sizeof(rated_miles_buffer), "%d", (int)new_tuple->value->int32);
      set_rated_miles_text(rated_miles_buffer);
    break;
    case KEY_CHARGING_STATE:
      snprintf(charging_state_buffer, sizeof(charging_state_buffer), "%s", (char*)new_tuple->value->cstring);
    break;
    case KEY_LOCATION:
      snprintf(location_buffer, sizeof(location_buffer), "%s", (char*)new_tuple->value->cstring);
    break;
  }

  if (loading && loading_status == 60) {
    loading = false;
    loading_window_destroy();
    overview_window_push();
  }

  overview_window_dirty();
}

static void sync_error_handler(DictionaryResult dict_error, AppMessageResult app_message_error, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Sync Error - Dictionary: %d AppMessage: %d", dict_error, app_message_error);
}

static void init() {
  loading = true;
  loading_window_push();

  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());

  snprintf(loading_status_buffer, sizeof(loading_status_buffer), " ");
  snprintf(vehicle_name_buffer,   sizeof(vehicle_name_buffer),   "%-32s", "Model S");
  snprintf(charging_state_buffer, sizeof(charging_state_buffer), "%-16s", "Unknown");
  snprintf(location_buffer,       sizeof(location_buffer),       "%-64s", "Unknown");

  Tuplet initial_values[] = {
    TupletInteger(KEY_LOADING_STATUS, 0),
    TupletStaticCString(KEY_VEHICLE_NAME, vehicle_name_buffer),
    TupletInteger(KEY_RATED_MILES, 0),
    TupletStaticCString(KEY_CHARGING_STATE, charging_state_buffer),
    TupletStaticCString(KEY_LOCATION, location_buffer)
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
  if (loading) {
    loading_window_destroy();
  } else {
    overview_window_destroy();
  }

  app_sync_deinit(&app_sync);
  free(app_sync_buffer);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
