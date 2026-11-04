import type { NextConfig } from "next";
import path from "path";
import os from "os";

// Interface names that exist on the machine but aren't the actual physical
// LAN/Wi-Fi link — VPN clients, WSL2/Hyper-V's virtual switch, container
// bridges. Their addresses are real but only reachable from inside that
// virtual network, not from another device on the same router, so they'd
// otherwise get picked as "the" LAN address and produce an unreachable URL.
const VIRTUAL_ADAPTER_NAME = /tailscale|zerotier|wireguard|openvpn|\bvpn\b|vethernet|virtualbox|vmware|docker|wsl|hyper-v|utun|\btun\d/i;

// Whatever LAN IP(s) this machine currently has — not a fixed address, since
// the server may run on different networks/machines over time (DHCP lease
// changes, different dev box, etc.). Falls back to none if detection fails;
// localhost always works regardless.
function currentLanIPs(): string[] {
  try {
    return Object.entries(os.networkInterfaces())
      .filter(([name]) => !VIRTUAL_ADAPTER_NAME.test(name))
      .flatMap(([, addrs]) => addrs ?? [])
      .filter((iface): iface is os.NetworkInterfaceInfo => !!iface && iface.family === "IPv4" && !iface.internal)
      .map((iface) => iface.address);
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  // Lets a production build run beside the dev server without sharing .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Sequelize resolves its DB driver (pg) via a dynamic require() that
  // Turbopack/webpack can't statically analyze — bundling it produces
  // "Please install pg package manually". Leaving these as external
  // makes Next.js call Node's native require() for them at runtime instead.
  serverExternalPackages: ["sequelize", "pg", "pg-hstore"],
  // An unrelated package-lock.json in the user's home directory otherwise
  // confuses Turbopack's workspace-root auto-detection into picking that
  // directory instead of this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow dev resources (HMR/JS chunks) to load when the site is reached via
  // this machine's own LAN IP instead of localhost — detected at startup, not
  // hardcoded, so it keeps working whatever network/IP the server ends up on.
  // 192.168.30.122 is listed explicitly too (Allan's PC on the office LAN), in case detection misses it.
  // Old addresses that should land on the new site (permanent 301s).
  // Only www.ntlafrica.com and links from the old WordPress site; nothing on
  // nanosoft.africa (NanoAssetSuite and the other apps) is touched here.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ntlafrica.com" }],
        destination: "https://ntlafrica.com/:path*",
        permanent: true,
      },
      { source: "/nano-pay", destination: "/products/nanopay-hr", permanent: true },
      { source: "/nano-pay/", destination: "/products/nanopay-hr", permanent: true },
    ];
  },
  // Images uploaded after the build aren't in the built public/ list, so fall
  // back to a route that reads them from disk.
  async rewrites() {
    return { beforeFiles: [], afterFiles: [], fallback: [{ source: "/uploads/:file", destination: "/api/uploads/:file" }] };
  },
  // proxy.ts runs on /api/admin/*, and Next.js cuts request bodies there at
  // 10 MB by default. Uploads allow 20 MB photos, so leave a little headroom.
  experimental: {
    proxyClientMaxBodySize: "25mb",
  },
  allowedDevOrigins: Array.from(new Set(["192.168.30.122", ...currentLanIPs()])),
};

export default nextConfig;
