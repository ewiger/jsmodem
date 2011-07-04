/*

Web Modem device emulation for JS/Linux.

Copyright (c) 2011 by Yauhen Yakimovich. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY YAUHEN YAKIMOVICH``AS IS'' AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
EVENT SHALL YAUHEN YAKIMOVICH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies,
either expressed or implied, of Yauhen Yakimovich.

*/

var include = function (filename) {
    document.write('<script type="text/javascript" src="' + filename + 
        '"><' + '/script>');
}
include('include/util.js');
include('include/base64.js');
include('include/websock.js');


function Uart(pc, port, set_irq_func, write_func) {
    // RBR, receiver buffer register
    this.rbr = 0;
    // THR, transmitter holding register
    // this.thr = 0;
    // IER, interrupt enable register
    this.ier = 0;
    // IIR, interrupt identification register
    this.iir = 0x01;
    //FCR, FIFO control register.
    this.fcr = 0;
    // LCR, line control register.
    this.lcr = 0;
    // MCR, modem control register.
    this.mcr;
    // LSR, line status register. 
    this.lsr = 0x40 | 0x20;
    // MSR, modem status register.
    this.msr = 0;
    // SCR, scratch register - will detect UART as 16550.
    this.scr = 0;
    // DLL, divisor latch LSB
    // DLM, divisor latch MSB
    this.divider = 0;

    this.set_irq_func = set_irq_func;
    this.write_func = write_func;
    this.receive_fifo = "";
    pc.register_ioport_write(port, 8, 1, this.ioport_write.bind(this));
    pc.register_ioport_read(port, 8, 1, this.ioport_read.bind(this));
}
Uart.prototype.update_irq = function () {
    if ((this.lsr & 0x01) && (this.ier & 0x01)) {
        this.iir = 0x04;
    } else if ((this.lsr & 0x20) && (this.ier & 0x02)) {
        this.iir = 0x02;
    } else {
        this.iir = 0x01;
    }
    // If no IRQ is pending, request one.
    if (this.iir != 0x01) {
        this.set_irq_func(1);
    } else {
        this.set_irq_func(0);
    }
};
Uart.prototype.ioport_write = function (ia, ja) {
    ia &= 7; // Compute offset by removing base addr of the port.
    switch (ia) {
    default:
    case 0:
        //Util.Debug(">> port write THR:" + ja);
        if (this.lcr & 0x80) { 
            // Errornous data in FIFO.
            this.divider = (this.divider & 0xff00) | ja;
        } else {
            this.lsr &= ~0x20;
            this.update_irq();
            this.write_func(String.fromCharCode(ja));
            this.lsr |= 0x20;
            this.lsr |= 0x40;
            this.update_irq();
        }
        break;
    case 1:
        //Util.Debug(">> port write IER:" + ja);
        if (this.lcr & 0x80) {
            // Errornous data in FIFO.
            this.divider = (this.divider & 0x00ff) | (ja << 8);
        } else {
            this.ier = ja;
            this.update_irq();
        }
        break;
    case 2:
        //Util.Debug(">> port write FCR:" + ja);
        ja &= 7;
        this.fcr &= ja;
        break;
    case 3:
        //Util.Debug(">> port write LCR:" + ja);
        this.lcr = ja;
        break;
    case 4:
        //Util.Debug(">> port write MCR:" + ja);
        this.mcr = ja;
        break;
    case 5:
        //Util.Debug(">> port write [Factory test]:" + ja);
        break;
    case 6:
        //Util.Debug(">> port write MSR:" + ja);
        this.msr = ja;
        break;
    case 7:
        //Util.Debug(">> port write SCR:" + ja);
        this.scr = ja;
        break;
    }
};
Uart.prototype.ioport_read = function (ia) {
    var hf;
    ia &= 7; // Compute offset by removing base addr of the port.
    switch (ia) {
    default:
    case 0:
        //Util.Debug(">> port read RBR:");
        if (this.lcr & 0x80) {
            hf = this.divider & 0xff;
        } else {
            hf = this.rbr;
            this.lsr &= ~ (0x01 | 0x10);
            this.update_irq();
            this.send_char_from_fifo();
        }
        break;
    case 1:
        //Util.Debug(">> port read IER:");
        if (this.lcr & 0x80) {
            hf = (this.divider >> 8) & 0xff;
        } else {
            hf = this.ier;
        }
        break;
    case 2:
        //Util.Debug(">> port read IIR:");
        hf = this.iir;
        break;
    case 3:
        //Util.Debug(">> port read LCR:");
        hf = this.lcr;
        break;
    case 4:
        //Util.Debug(">> port read MCR:");
        hf = this.mcr;
        break;
    case 5:
        //Util.Debug(">> port read LSR:");
        hf = this.lsr;
        break;
    case 6:
        //Util.Debug(">> port read MSR:");
        hf = this.msr;
        break;
    case 7:
        //Util.Debug(">> port read SCR:");
        hf = this.scr;
        break;
    }
    //Util.Debug(hf);
    return hf;
};
Uart.prototype.send_break = function () {
    this.rbr = 0;
    this.lsr |= 0x10 | 0x01;
    this.update_irq();
};
Uart.prototype.send_char = function (If) {
    this.rbr = If;
    this.lsr |= 0x01;
    this.update_irq();
};
Uart.prototype.send_char_from_fifo = function () {
    var Jf;
    Jf = this.receive_fifo;
    if (Jf != "" && !(this.lsr & 0x01)) {
        this.send_char(Jf.charCodeAt(0));
        this.receive_fifo = Jf.substr(1, Jf.length - 1);
    }
};
Uart.prototype.send_chars = function (qa) {
    this.receive_fifo += qa;
    this.send_char_from_fifo();
};


function JSModem(pc) {
    this.onconnect = null;
    this.ondisconnect = null;
    this.pc = pc;
    pc.modem = this;
    // Define modem on ttyS2 as COM2 with io port 2f8 and irq 3.
    this.serial = new Uart(pc, 0x2f8, pc.pic.set_irq.bind(pc.pic, 3), this.transmit.bind(this));
    // Initialize Websock object.
    this.ws = new Websock();
    this.ws.on('message', this.receive.bind(this));
    this.ws.on('open', function(e) {
        Util.Info(">> WebSockets.onopen");
        this.set_dcd(1);
        if (this.onconnect) {
            this.onconnect();
        }
        Util.Info("<< WebSockets.onopen");
    }.bind(this));
    this.ws.on('close', function(e) {
        Util.Info(">> WebSockets.onclose");
        this.disconnect();
        Util.Info("<< WebSockets.onclose");
    }.bind(this));
    this.ws.on('error', function(e) {
        Util.Info(">> WebSockets.onerror");
        this.disconnect();
        Util.Info("<< WebSockets.onerror");
    }.bind(this));
}
JSModem.prototype.connect = function(host, port, encrypt) {
    var host = host,
        port = port,
        scheme = "ws://", uri;

    Util.Debug(">> connect");
    if ((!host) || (!port)) {
        console.log("must set host and port");
        return;
    }

    if (this.ws) {
        this.ws.close();
    }

    if (encrypt) {
        scheme = "wss://";
    }
    uri = scheme + host + ":" + port;
    Util.Info("connecting to " + uri);

    this.ws.open(uri);

    Util.Debug("<< connect");
}
JSModem.prototype.disconnect = function() {
    Util.Debug(">> disconnect");
    if (this.ws) {
        this.ws.close();
    }
    this.set_dcd(1);
    if (this.ondisconnect) {
        this.ondisconnect();
    }
    Util.Debug("<< disconnect");
}

JSModem.prototype.transmit = function(ch) {
    //Util.Debug('>> transmit = ' + ch.charCodeAt(0));
    //this.ws.send(ch);
    this.ws.send_string(ch);
    //Util.Debug('<< transmit');
}
JSModem.prototype.receive = function(ch) {
    //Util.Debug('>> receive');
    var arr = this.ws.rQshiftBytes(this.ws.rQlen()), 
        str = "", chr, cmd, code, value;
    //Util.Debug("Received array '" + arr + "'");
    while (arr.length > 0) {
        chr = arr.shift();
        switch (chr) {
            default:   // everything else
                str += String.fromCharCode(chr);
        }
    }
    if (str) {
        this.serial.send_chars(str);
    }
    //Util.Debug('<< receive');
}
JSModem.prototype.set_dcd = function(state) {
    state &= 1;
    if (state) {
        this.serial.msr |= 0x80;
    } else {
        this.serial.msr &= ~(0x80);
    }
}

