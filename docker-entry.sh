#!/usr/bin/env bash

logName=$(date '+%Y-%m-%d_%H-%M-%S');

export DEBUG=mnb*

node app.js >> /var/log/mnb/search-client-${HOSTNAME}-${logName}.log 2>&1
