---
title: "OpenBMC: 网卡 rename 分享"
date: 2023-05-05 23:40:40
tags: [OpenBMC]
---

# 背景

在最近的一次 OpenBMC upstram 之后, 我们有两个机器, 其中一个机器发生了 网卡 rename 的问题, 相同的版本在另外一个机器上并没有产生相关的 rename(eth0->end0), 问题比较奇怪, 记录一下, 具体 log 如下:

<!-- more -->

```bash
[   32.650700] ftgmac100 1e670000.ftgmac eth1: Set link name to end1
[   32.651817] ftgmac100 1e670000.ftgmac end1: renamed from eth1
[   32.688971] ftgmac100 1e690000.ftgmac eth0: Set link name to end0
[   32.689531] ftgmac100 1e690000.ftgmac end0: renamed from eth0
```

# Debug

参考此 Issue: [Issue-systemd/25444](https://github.com/systemd/systemd/issues/25444)

> That's intended. Please disable the persistent interface renaming if you do not like it.

我们得知, 这是和 systemd 的 `persistent interface renaming` feature 有关.

- 确认我们 upstram 的 systemd 版本变化

```bash
v251->v252
```

- 检索相关文档的 change list
  [Change List](https://www.freedesktop.org/software/systemd/man/systemd.net-naming-scheme.html)

```bash
v252
   Added naming scheme for platform devices with devicetree aliases.
```

这个版本增加了 `devicetree aliases` 的支持.
对比了我们的两个平台, 确实是一个在 device tree 里面添加了 相关的 alias , 另外一个没有.

```
aliases {
	ethernet0 = &mac1;
	ethernet1 = &mac0;
}
```

# How to fix the network name

参考: [PredictableNetworkInterfaceNames](https://www.freedesktop.org/wiki/Software/systemd/PredictableNetworkInterfaceNames/)

```
I don't like this, how do I disable this?
You basically have three options:

You disable the assignment of fixed names, so that the unpredictable kernel names are used again. For this, simply mask udev's .link file for the default policy: ln -s /dev/null /etc/systemd/network/99-default.link
You create your own manual naming scheme, for example by naming your interfaces "internet0", "dmz0" or "lan0". For that create your own .link files in /etc/systemd/network/, that choose an explicit name or a better naming scheme for one, some, or all of your interfaces. See systemd.link(5) for more information.
You pass the net.ifnames=0 on the kernel command line
```

我选择的是 添加 net.ifnames=0 在 kernel command line (bootargs).
