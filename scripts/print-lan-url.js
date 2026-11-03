#!/usr/bin/env node

/**
 * Prints the URL other devices on the same network can actually use to
 * reach this dev server. Next.js's own "Network:" banner just takes the
 * first non-internal interface it finds — on a machine with Tailscale, WSL2,
 * or a similar virtual adapter installed, that's often NOT the real Wi-Fi/
 * Ethernet link, so it prints an address nothing outside that virtual
 * network can actually connect to. This picks the real one instead.
 */
const os = require("os");

const VIRTUAL_ADAPTER_NAME = /tailscale|zerotier|wireguard|openvpn|\bvpn\b|vethernet|virtualbox|vmware|docker|wsl|hyper-v|utun|\btun\d/i;

function realLanIPs() {
  return Object.entries(os.networkInterfaces())
    .filter(([name]) => !VIRTUAL_ADAPTER_NAME.test(name))
    .flatMap(([name, addrs]) => (addrs ?? []).map((a) => ({ name, ...a })))
    .filter((a) => a.family === "IPv4" && !a.internal);
}

const port = process.env.PORT || 3000;
const ips = realLanIPs();

if (ips.length) {
  console.log(`\x1b[36m📡 Reachable from other devices on this network at:\x1b[0m`);
  ips.forEach((a) => console.log(`   \x1b[1mhttp://${a.address}:${port}\x1b[0m  (${a.name})`));
} else {
  console.log("📡 No LAN-reachable network interface detected — only localhost will work.");
}
