## JSModem

Provides a virtual modem device for JSLinux platform. It is a result of studying
project conducted on PC emulator that was implemented in JS by Fabrice Bellard 
(see http://bellard.org/jslinux). 

### Installation

* Get a copy by cloning the repo from `git@github.com:ewiger/jsmodem.git`

* Run make all in jsmodem/emulator to download and patch JSLinux from
  http://bellard.org/jslinux

* Start serving JSLinux locally with `sudo ./serve.sh`

* Navigate to `http://localhost:2080/` This should boot the guest system.

* Login as root and run ./ppp_up to bring up the ppp interface. Check it with
  ifconfig and ping.

