--- a/jslinux.js	2012-01-11 22:26:46.000000000 +0100
+++ b/jslinux.js	2012-04-30 00:18:28.278721921 +0200
@@ -73,12 +73,20 @@
     /* IDE drive. The raw disk image is split into files of
      * 'block_size' KB. 
      */
-    params.hda = { url: "hda%d.bin", block_size: 64, nb_blocks: 912 };
-    
+    //params.hda = { url: "hda%d.bin", block_size: 64, nb_blocks: 912 };
+
     pc = new PCEmulator(params);
 
     init_state.params = params;
 
+    /* Add JSModem for networking:
+     *  - register ttyS2 as COM2 with io port 2f8 and irq 3;
+     *  - connect websocket to server at localhost:2080 (will be 
+     *    redirected on the server-side).
+     */
+    var modem = new JSModem(pc);
+    modem.connect('localhost', 2080);
+    
     pc.load_binary("vmlinux-2.6.20.bin", 0x00100000, start2);
 }
 
@@ -87,7 +95,9 @@
     if (ret < 0)
         return;
     init_state.start_addr = 0x10000;
-    pc.load_binary("linuxstart.bin", init_state.start_addr, start3);
+    init_state.initrd_size = 0;
+    //pc.load_binary("linuxstart.bin", init_state.start_addr, start3);
+    pc.load_binary("linuxstart.bin", init_state.start_addr, start3_);
 }
 
 function start3(ret)
@@ -101,6 +111,13 @@
     pc.ide0.drives[0].bs.preload(block_list, start4);
 }
 
+function start3_(ret)
+{
+    if (ret < 0)
+        return;
+    pc.load_binary("root.bin", 0x00400000, start4);
+}
+
 function start4(ret)
 {
     var cmdline_addr;
@@ -108,13 +125,19 @@
     if (ret < 0)
         return;
 
+    /* Assume booting from /dev/ram0 - result of previous load_binary("root.bin") call equals to the 
+     * size of the ram image.
+     */
+    init_state.initrd_size = ret;
+
     /* set the Linux kernel command line */
     cmdline_addr = 0xf800;
-    pc.cpu.write_string(cmdline_addr, "console=ttyS0 root=/dev/hda ro init=/sbin/init notsc=1 hdb=none");
+    //pc.cpu.write_string(cmdline_addr, "console=ttyS0 root=/dev/hda ro init=/sbin/init notsc=1 hdb=none");
+    pc.cpu.write_string(cmdline_addr, "console=ttyS0 root=/dev/ram0 rw init=/sbin/init notsc=1");
 
     pc.cpu.eip = init_state.start_addr;
     pc.cpu.regs[0] = init_state.params.mem_size; /* eax */
-    pc.cpu.regs[3] = 0; /* ebx = initrd_size (no longer used) */
+    pc.cpu.regs[3] = init_state.initrd_size; /* ebx = initrd_size (optional ram disk - old jslinux booting) */
     pc.cpu.regs[1] = cmdline_addr; /* ecx */
 
     boot_start_time = (+new Date());
