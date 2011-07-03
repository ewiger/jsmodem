--- a/jslinux.js	2011-05-26 22:06:19.000000000 +0200
+++ b/jslinux.js	2011-06-26 16:32:58.644879002 +0200
@@ -69,6 +69,10 @@
     params.get_boot_time = get_boot_time;
 
     pc = new PCEmulator(params);
+    
+    // Add JSModem for networking.
+    var modem = new JSModem(pc);
+    modem.connect('localhost', 2080);
 
     pc.load_binary("vmlinux26.bin", 0x00100000);

