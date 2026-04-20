# Features: Thunderbolt 5 Sync Dashboard

The Thunderbolt 5 Sync Dashboard is an unlimited, free alternative to commercial synchronization tools. It is specifically optimized for hardware connections exceeding 40Gbps.

## Core Functionality

### 1. High-Performance Synchronization
- **Robocopy Integration**: Uses the multi-threaded "Robust File Copy" utility built into Windows.
- **Parallel Processing**: Configured with `/MT:32` to utilize 32 parallel threads, ensuring that the massive bandwidth of Thunderbolt 5 isn't wasted by single-threaded transfer limits.
- **Mirroring Mode**: Supports `/MIR` to create exact replicas of source directories on the remote machine.

### 2. Intelligent Network Discovery
- **Interface Detection**: Automatically identifies local IPv4 subnets and interfaces.
- **Node Scanning**: Uses ARP and Ping to identify active devices in the chosen subnet.
- **Thunderbolt Identification**: Explicitly flags connections on the `192.168.10.x` subnet, which is the default for Thunderbolt Networking bridges.
- **One-Click Configuration**: Discovered devices can be selected to automatically update target IPs and UNC paths.

### 3. Throughput Validation Engine
- **Live Diagnostics**: Real-time throughput testing that simulates high-load data bursts across the Thunderbolt bridge.
- **Visual Analytics**: Integrated `recharts` instrumentation providing a live graph of peak bandwidth (80-120Gbps) and bridge latency.
- **Signal Integrity**: Hardware status LEDs and diagnostic badges ("ACTIVE", "TESTING", "STABLE") that provide physical-style feedback during performance checks.

### 4. Hardware-Aware Discovery Hub
- **Local Ident**: Displays real-time machine identity (Hostname, IP list, Platform) with a high-density "Master Node" UI.
- **Selective Sync**: Multi-select interface for discovered nodes with automatic configuration binding (IP and UNC path generation).
- **Port Detection**: Identifies and flags Thunderbolt 5 / USB4 High-Speed I/O ports and PCIe tunneling status.

### 5. Multi-Node File Explorer
- **Universal Browser**: Full-screen modal explorer allowing seamless navigation of local disks and remote bridge shares (UNC).
- **Interactive Breadcrumbs**: One-click navigation through deep directory structures with real-time file-size detection and type flagging.
- **Bridge Selection**: Automatically binds selected folder paths to the synchronization configuration, eliminating manual path entry.

### 6. GitHub Integrated CI/CD
- **Direct Deployment**: A "Deploy to GitHub" button allows pushing the current project state to a remote repository directly from the UI.
- **Unlimited & Free**: No licensing fees, no file size limits, and no "per-PC" restrictions.
