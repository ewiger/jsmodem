LD=ld -m elf_i386
CC=gcc -m32
CFLAGS= -O2 -Wall -fno-builtin -fno-stack-protector #-march=i386 
HOST_CFLAGS=-O2 -Wall
# modify to set the kernel path
KERNEL_PATH=../linux

all: linuxstart.bin

linuxstart.out: linuxstart_head.o linuxstart.o libc.o
	$(LD) -o $@ -N -Ttext 0x00010000 $^

linuxstart.bin: linuxstart.out
	objcopy -O binary $< $@

%.o: %.c
	$(CC) $(CFLAGS)  -c -o $@ $<

%.o: %.S
	$(CC) -m32 -D__ASSEMBLY__ -c -o $@ $<

# target to generate kernel
kernel:
#	make -C $(KERNEL_PATH) -j4
	objcopy -O binary $(KERNEL_PATH)/vmlinux vmlinux26.bin

clean:
	rm -f linuxstart.bin linuxstart.out *.o *~ 

