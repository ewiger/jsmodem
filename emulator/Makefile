WGET=/usr/bin/wget
JSLINUX_URL=http://bellard.org/jslinux/
# Patch jslinux.js?
ifeq ($(shell if [ -e jslinux.js ] ; then echo 1 ; else echo 0 ; fi), 0)
    PATCH_JSLINUX=1
else 
    ifeq ($(shell if test "jslinux.js" -ot "jsmodem.js" ; then echo 1 ; else echo 0 ; fi), 1)
        PATCH_JSLINUX=1
    endif
endif


all: jslinux

jslinux: cpux86.js cpux86-ta.js jslinux.js term.js utils.js
ifeq (${PATCH_JSLINUX},1)
	patch -p1 < ./patch_jslinux.js
endif

cpux86.js:
	${WGET} ${JSLINUX_URL}cpux86.js

cpux86-ta.js:
	${WGET} ${JSLINUX_URL}cpux86-ta.js

jslinux.js:
	${WGET} ${JSLINUX_URL}jslinux.js

term.js:
	${WGET} ${JSLINUX_URL}term.js

utils.js:
	${WGET} ${JSLINUX_URL}utils.js


clean:
	rm -f cpux86.js cpux86-ta.js jslinux.js term.js utils.js

