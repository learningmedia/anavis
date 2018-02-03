#!/usr/bin/env bash

docker run --rm \
  --env-file <(env | grep -iE 'NODE_|ELECTRON_|YARN_|NPM_|TRAVIS|DROPBOX|GITHUB') \
  -v ${PWD}:/project \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/electron-builder:wine \
  /bin/bash -c "npm i -g yarn && yarn && ./node_modules/.bin/gulp build"
