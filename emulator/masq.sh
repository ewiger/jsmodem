#!/bin/bash

# Connection to an outer world.
EXTINT=wlan0
EXTIP=$(ifconfig ${EXTINT} | grep 'inet addr' | sed -e 's/addr\://' | gawk '{print $2}')

# Masquerade traffic.
iptables -F; iptables -t nat -F; iptables -t mangle -F
#iptables -t nat -A POSTROUTING -o $EXTINT -j MASQUERADE
iptables -t nat -A POSTROUTING -o $EXTINT -j SNAT --to $EXTIP
echo 1 > /proc/sys/net/ipv4/ip_forward

# Make it secure.
#iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
#iptables -A INPUT -m state --state NEW ! -i $EXTINT -j ACCEPT
#iptables -P INPUT DROP 
#iptables -A FORWARD -i $EXTINT -o $EXTINT -j REJECT
