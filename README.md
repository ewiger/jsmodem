## JSModem

Provides a virtual modem device for JSLinux platform. It is a result of
studying project conducted on PC emulator that was implemented in JS by Fabrice
Bellard (see http://bellard.org/jslinux). There is a screencast discussing this
project http://www.youtube.com/watch?v=MEsmgHrKQYM.

### Live demo

https://ewiger.github.io/jsmodem/ — boots Linux 2.6.20 entirely in your
browser (log in as `root`), served statically from GitHub Pages, no build
step or server stack involved.

The modem itself needs a websocket proxy to have something to dial into.
The page tries `ws://localhost:2080` by default, so if you run `serve.sh`
locally (see Installation below) the hosted demo can still get network via
your own machine. The endpoint can be overridden with `?modem=host:port`
in the page URL. Without a proxy the machine boots fine, just offline.

### Running locally

The emulator is plain static files — any web server will do (`file://`
won't work, browsers block the XHR that loads the kernel image):

    cd emulator && python3 -m http.server 8090

Then open http://localhost:8090/. For actual network connectivity run
`sudo ./serve.sh` instead and follow the Installation steps below.

### Licensing

* The software behind jslinux emulator is the intellectual property of Fabrice 
  Bellard (see jslinux.org for further details).
* The rest of the patch is licensed under MIT license (see copy of it in
  LICENSE).

### Installation

* Get a copy by cloning the repo from `git@github.com:ewiger/jsmodem.git`

* Run make all in jsmodem/emulator to download and patch JSLinux from
  http://bellard.org/jslinux (This step is still valid but left as a fallback.
  Right now the jslinux version is in sync with the version on the website 
  of Aug 20, 2011).

* Start serving JSLinux locally with `sudo ./serve.sh`

* Navigate to `http://localhost:2080/` This should boot the guest system.

* Login as root and run ./ppp_up to bring up the ppp interface. Check it with
  ifconfig and ping.

### Requirements

JSModem script is heavily based on JSLinux project, hence browser must be 
modern enough to support it. Another project *websockify* provides websockets 
abstraction with fallback to flash.

To serve on host system one will need

* python 2.6+

* bash

* sed

* gawk

* grep

* pppd

* socat

* iptables

### Tested

Internet connection was tested on 

* *host server*: linux 2.6.35 - ubuntu 10.10 Maverick, 
                 linux 2.6.38-11 - 11.04 Natty Narwhal
  *host client:* Chrome 12.0.742.112 (linux), FF 3.6.8 (linux),
                 Chrome 14.0.835.202 (linux)
 

### Feedback

For now, best way to give some feedback is to email eugeny dot yakimovitch at
gmail dot com with subject jsmodem.  Test reports are greatly appreciated.

wbr,
yy
