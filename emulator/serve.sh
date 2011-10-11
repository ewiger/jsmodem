#!/bin/bash

#python -m SimpleHTTPServer
socat -d -d PTY,link=/dev/jsppp,raw,echo=0 TCP-LISTEN:2001 &
sleep 1
pppd /dev/jsppp debug noauth passive 10.0.5.1:10.0.5.2
sleep 1
env python websockify -D --web=./ 2080 127.0.0.1:2001

