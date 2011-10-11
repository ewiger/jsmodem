## JSModem

Provides a virtual modem device for JSLinux platform. It is a result of
studying project conducted on PC emulator that was implemented in JS by Fabrice
Bellard (see http://bellard.org/jslinux). There is a screencast discussing this
project http://www.youtube.com/watch?v=MEsmgHrKQYM.

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
