
#
# This file is the default set of rules to compile a Pebble project.
#
# Feel free to customize this to your needs.
#

import os
import sh

top = '.'
out = 'build'

def options(ctx):
    ctx.load('pebble_sdk')

def configure(ctx):
    ctx.load('pebble_sdk')

def build(ctx):
    ctx.load('pebble_sdk')

    js_libs = [
      '../src/js/libs/base64.js',
      '../src/js/libs/js-message-queue.js',
      '../src/js/libs/reqwest.js'
    ]

    js_sources = [
      '../src/js/utils.js',
      '../src/js/google.js',
      '../src/js/tesla.js',
      '../src/js/main.js',
    ]
    built_js = 'js/pebble-js-app.js'

    build_worker = os.path.exists('worker_src')
    binaries = []

    for p in ctx.env.TARGET_PLATFORMS:
        ctx.set_env(ctx.all_envs[p])
        ctx.set_group(ctx.env.PLATFORM_NAME)
        app_elf='{}/pebble-app.elf'.format(ctx.env.BUILD_DIR)
        ctx.pbl_program(source=ctx.path.ant_glob('src/**/*.c'),
        target=app_elf)

        if build_worker:
            worker_elf='{}/pebble-worker.elf'.format(ctx.env.BUILD_DIR)
            binaries.append({'platform': p, 'app_elf': app_elf, 'worker_elf': worker_elf})
            ctx.pbl_worker(source=ctx.path.ant_glob('worker_src/**/*.c'),
            target=worker_elf)
        else:
            binaries.append({'platform': p, 'app_elf': app_elf})

    ctx(rule=concatenate_js, source=' '.join(js_libs + js_sources), target=built_js)

    ctx.set_group('bundle')
    ctx.pbl_bundle(binaries=binaries, js=built_js)

def concatenate_js(task):
  inputs = (input.abspath() for input in task.inputs)
  uglifyjs = sh.Command("node_modules/.bin/uglifyjs")
  uglifyjs(*inputs, o=task.outputs[0].abspath(), b=True, indent_level=2)
