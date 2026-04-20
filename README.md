# Thunderbolt 5 Sync Dashboard: Mission Control
**Status**: ACTIVE | **Last Update**: 2026-04-20 19:56:19

A professional-grade, high-density synchronization dashboard designed to saturate the 80Gbps-120Gbps throughput of Thunderbolt 5 / USB4 hardware bridges.

## 🚀 Advanced Features
- **High-Throughput Validation**: Real-time speed testing using `recharts` to monitor bridge stability and peak bandwidth (up to 120Gbps).
- **Master Node Discovery**: Automated subnet scanning with high-speed node detection (TB5/USB4 flags) and hardware platform identification.
- **Hardware-Level UI**: Information-dense "Specialist Tool" aesthetic with live diagnostic status, system logs, and bridge monitoring.
- **Remote File Explorer**: Integrated modal browser to choose directories across your local and remote machines via UNC bridge paths.
- **Infinite Sync Engine**: Leverages multi-threaded `robocopy` (/MT:32) to ensure hardware bottlenecks are minimized.
- **Cloud-To-Hardware CI/CD**: One-click "Deploy to GitHub" integration for seamless project migration between machines.

## 🛠️ Local Hardware Stack
To achieve the speeds displayed in this dashboard:
1.  **Hardware**: Two Mini PCs with Thunderbolt 5 ports connected via a certified TB5/USB4 cable.
2.  **Infrastructure**: Thunderbolt Networking Bridge enabled in Windows with static IPs (`192.168.10.1` and `192.168.10.2`).
3.  **Software**: This dashboard runs locally on Node.js v18+, utilizing native Windows system utilities.

## 📖 Project Documentation
- **[FEATURES.md](./FEATURES.md)**: Deep dive into the synchronization and discovery logic.
- **[LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)**: Hardware configuration and installation walk-through.
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**: Full-stack architecture and file map.
- **[PROMPTS_LOG.md](./PROMPTS_LOG.md)**: Complete development history with timestamped turns.

## Why this is different
Standard sync tools are built for the cloud (Mbps). This dashboard is built for the **Cable** (Gbps). By using a direct Thunderbolt 5 bridge and parallelized mirroring logic, we eliminate the latency and overhead of standard network file sharing.
