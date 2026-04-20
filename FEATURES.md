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

### 3. Mission Control Dashboard
- **Real-time Status**: Continuous connection monitoring with visual and text feedback.
- **Console Logging**: A dedicated system console displays detailed event history and command outputs.
- **Hardware Insights**: Displays potential bandwidth and optimization engine status.

### 4. GitHub Integration
- **Direct Deployment**: A "Deploy to GitHub" button allows pushing the current project state to a remote repository directly from the UI.
- **Unlimited & Free**: No licensing fees, no file size limits, and no "per-PC" restrictions.
