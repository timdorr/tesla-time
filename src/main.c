#include <pebble.h>

#include "overview.h"
#include "commands_menu.h"

static void init() {
  overview_window_push();
}

static void deinit() {
  overview_window_destroy();
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
