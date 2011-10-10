--- a/jslinux.js	2010-10-09 00:00:00.000000000 +0200
+++ b/jslinux.js	2011-10-11 00:07:55.617425392 +0200
@@ -70,6 +70,9 @@
 
     pc = new PCEmulator(params);
 
+    // Add JSModem for networking.
+    var modem = new JSModem(pc);
+    modem.connect('localhost', 2080);
     pc.load_binary("vmlinux-2.6.20.bin", 0x00100000);
 
     initrd_size = pc.load_binary("root.bin", 0x00400000);
