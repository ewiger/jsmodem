#!/bin/bash

kill $(ps ax | grep socat | head -n 1 | gawk '{print $1}')
kill $(ps ax | grep pppd | head -n 1 | gawk '{print $1}')
kill $(ps ax | grep websockify | head -n 1 | gawk '{print $1}')
