# Thunderbolt 5 Sync Dashboard

A high-performance local dashboard for synchronizing files between two PCs at Thunderbolt speeds (40-80Gbps).

## Features
- **High-Speed Sync**: Leverages Windows `robocopy` with 32 parallel threads for maximum hardware utilization.
- **Real-time Monitoring**: Checks connection status over the Thunderbolt Bridge constantly.
- **Interactive UI**: Clean, professional dashboard for managing paths and triggering transfers.
- **Zero Configuration**: Simply connect your TB5 cable and set your IPs.

## Local Setup Instructions

### 1. Hardware Connection
- Connect your Thunderbolt 5 cable to both Mini PCs.
- Ensure **Thunderbolt Networking / Bridge** is enabled in `Control Panel > Network Connections`.
- Set static IPs for the bridge (e.g., PC 1: `192.168.10.1`, PC 2: `192.168.10.2`).

### 2. Folder Sharing (PC 2)
- On the remote PC, right-click the folder you want to sync to.
- Select `Give access to` > `Everyone` (or a specific user).
- Ensure the path is reachable via `\\192.168.10.2\YourFolder`.

### 3. Running this Dashboard
To run this dashboard on your local machine:

1. **Install Node.js** (v18+ recommended).
2. **Clone this repository** (or download the files).
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the server**:
   ```bash
   npm run dev
   ```
5. **Open in Browser**: Navigate to `http://localhost:3000`.

## Why this is faster
Standard file transfers often use a single thread. This dashboard uses `robocopy` with the `/MT:32` flag, which allows Windows to move multiple files in parallel across the massive 80Gbps pipe provided by Thunderbolt 5.
