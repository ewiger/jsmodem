/*
 * Copyright (c) 2011 Fabrice Bellard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
#include "libc.h"

#ifdef TEST
void putchar(int c);
#else

#define SERIAL_BASE 0x3f8
 
static void putchar1(int c)
{
    asm volatile("out %%al, %%dx" : : "a" (c), "d" (SERIAL_BASE));
}

void putchar(int c)
{
    if (c == '\n')
        putchar1('\r');
    putchar1(c);
}

void __attribute__((noreturn)) exit(int val)
{
    /* send reset command to the keyboard controller */
    asm volatile("out %%al, %%dx" : : "a" (0xfe), "d" (0x64));
    while (1);
}
#endif /* !TEST */

void put_string(const char *s)
{
    while (*s)
        putchar(*s++);
}

void put_int(unsigned int v)
{
    static const char hexchars[] = "0123456789abcdef";
    putchar(hexchars[(v >> 28) & 0xf]);
    putchar(hexchars[(v >> 24) & 0xf]);
    putchar(hexchars[(v >> 20) & 0xf]);
    putchar(hexchars[(v >> 16) & 0xf]);
    putchar(hexchars[(v >> 12) & 0xf]);
    putchar(hexchars[(v >> 8) & 0xf]);
    putchar(hexchars[(v >> 4) & 0xf]);
    putchar(hexchars[(v >> 0) & 0xf]);
}

void *memset(void *d1, int val, size_t len)
{
    uint8_t *d = d1;

    while (len--) {
        *d++ = val;
    }
    return d1;
}

void *memcpy(void *d1, const void *s1, size_t len)
{
    uint8_t *d = d1;
    const uint8_t *s = s1;

    while (len--) {
        *d++ = *s++;
    }
    return d1;
}

void *memmove(void *d1, const void *s1, size_t len)
{
    uint8_t *d = d1;
    const uint8_t *s = s1;

    if (d <= s) {
        while (len--) {
            *d++ = *s++;
        }
    } else {
        d += len;
        s += len;
        while (len--) {
            *--d = *--s;
        }
    }
    return d1;
}

size_t strlen(const char *s)
{
    const char *s1;
    for(s1 = s; *s1 != '\0'; s1++);
    return s1 - s;
}

char *strcpy(char *d, char *s)
{
    memcpy(d, s, strlen(s) + 1);
    return d;
}

static inline int mon_isdigit(int c)
{
    return c >= '0' && c <= '9';
}

#define OUTCHAR(c)	(buflen > 0? (--buflen, *buf++ = (c)): 0)

/* from BSD ppp sources */
int vsnprintf(char *buf, int buflen, const char *fmt, va_list args)
{
    int c, n;
    int width, prec, fillch;
    int base, len, neg, is_long;
    unsigned long val = 0;
    const char *f;
    char *str, *buf0;
    char num[32];
    static const char hexchars[] = "0123456789abcdef";

    buf0 = buf;
    --buflen;
    while (buflen > 0) {
	for (f = fmt; *f != '%' && *f != 0; ++f) 
            ;
	if (f > fmt) {
	    len = f - fmt;
	    if (len > buflen)
		len = buflen;
	    memcpy(buf, fmt, len);
	    buf += len;
	    buflen -= len;
	    fmt = f;
	}
	if (*fmt == 0)
	    break;
	c = *++fmt;
	width = prec = 0;
	fillch = ' ';
	if (c == '0') {
	    fillch = '0';
	    c = *++fmt;
	}
	if (c == '*') {
	    width = va_arg(args, int);
	    c = *++fmt;
	} else {
	    while (mon_isdigit(c)) {
		width = width * 10 + c - '0';
		c = *++fmt;
	    }
	}
	if (c == '.') {
	    c = *++fmt;
	    if (c == '*') {
		prec = va_arg(args, int);
		c = *++fmt;
	    } else {
		while (mon_isdigit(c)) {
		    prec = prec * 10 + c - '0';
		    c = *++fmt;
		}
	    }
	}
        /* modifiers */
        is_long = 0;
        switch(c) {
        case 'l':
            is_long = 1;
            c = *++fmt;
            break;
        default:
            break;
        }
        str = 0;
	base = 0;
	neg = 0;
	++fmt;
	switch (c) {
	case 'd':
            if (is_long)
                val = va_arg(args, long);
            else
                val = va_arg(args, int);
	    if ((long)val < 0) {
		neg = 1;
		val = -val;
            }
	    base = 10;
	    break;
	case 'o':
            if (is_long)
                val = va_arg(args, unsigned long);
            else
                val = va_arg(args, unsigned int);
	    base = 8;
	    break;
	case 'x':
	case 'X':
            if (is_long)
                val = va_arg(args, unsigned long);
            else
                val = va_arg(args, unsigned int);
	    base = 16;
	    break;
	case 'p':
	    val = (unsigned long) va_arg(args, void *);
	    base = 16;
	    neg = 2;
	    break;
	case 's':
	    str = va_arg(args, char *);
	    break;
	case 'c':
	    num[0] = va_arg(args, int);
	    num[1] = 0;
	    str = num;
	    break;
	default:
	    *buf++ = '%';
	    if (c != '%')
		--fmt;		/* so %z outputs %z etc. */
	    --buflen;
	    continue;
	}
	if (base != 0) {
	    str = num + sizeof(num);
	    *--str = 0;
	    while (str > num + neg) {
		*--str = hexchars[val % base];
		val = val / base;
		if (--prec <= 0 && val == 0)
		    break;
	    }
	    switch (neg) {
	    case 1:
		*--str = '-';
		break;
	    case 2:
		*--str = 'x';
		*--str = '0';
		break;
	    }
	    len = num + sizeof(num) - 1 - str;
	} else {
	    len = strlen(str);
	    if (prec > 0 && len > prec)
		len = prec;
	}
	if (width > 0) {
	    if (width > buflen)
		width = buflen;
	    if ((n = width - len) > 0) {
		buflen -= n;
		for (; n > 0; --n)
		    *buf++ = fillch;
	    }
	}
	if (len > buflen)
	    len = buflen;
	memcpy(buf, str, len);
	buf += len;
	buflen -= len;
    }
    *buf = 0;
    return buf - buf0;
}

void __attribute((format (printf, 1, 2))) printf(const char *fmt, ...)
{
    char buf[1024];
    va_list ap;
    va_start(ap, fmt);
    vsnprintf(buf, sizeof(buf), fmt, ap);
    put_string(buf);
    va_end(ap);
}

static uint8_t *malloc_ptr = NULL;
extern uint8_t _edata;

#define MALLOC_ALIGN 8

void *malloc(size_t size)
{
    void *ptr;

    if (!malloc_ptr) {
        malloc_ptr = &_edata;
        malloc_ptr = (void *)(((uintptr_t)malloc_ptr + MALLOC_ALIGN - 1) & ~(MALLOC_ALIGN - 1));
    }
    ptr = malloc_ptr;
    malloc_ptr = (void *)(((uintptr_t)malloc_ptr + size + MALLOC_ALIGN - 1) & ~(MALLOC_ALIGN - 1));
    return ptr;
}

void free(void *ptr)
{
}
