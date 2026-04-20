# Project Structure: Thunderbolt 5 Sync Dashboard

This project is a full-stack web application designed for high-speed file synchronization between two PCs connected via a Thunderbolt 5 / USB4 Bridge.

## Directory Layout

```text
/
├── server.ts            # Express server entry point (Backend)
│                        # Handles file system operations (Robocopy),
│                        # network discovery (ARP/Ping), and GitHub push integration.
│
├── App.tsx              # Main React Application (Frontend)
│                        # Built with React 19, Tailwind CSS 4, and Framer Motion.
│                        # Manages the UI state, discovery scanning, and sync triggers.
│
├── src/
│   ├── main.tsx         # Frontend entry point
│   └── index.css        # Global styles with Typography (Inter/JetBrains Mono)
│
├── sync-config.json     # Local store for user-configured paths and IPs
│
├── metadata.json        # Application metadata for the AI Studio environment
│
├── package.json         # Project dependencies and full-stack dev scripts
│
├── tsconfig.json        # TypeScript configuration
│
├── GITHUB_ACTIONS_README.md   # Template for CI/CD workflow
│                        # (Move to .github/workflows/ if you have workflow token scope)
│
└── tsconfig.json        # TypeScript configuration
```

## Technology Stack

- **Backend**: Node.js (Runtime), Express (Web Framework), tsx (Runner)
- **Frontend**: React (UI Module), Vite (Build Tool), Tailwind CSS 4 (Styling)
- **Visualization**: Recharts (Throughput Monitoring Graph)
- **Icons**: Lucide React
- **Animations**: motion (framer-motion)
- **Automation**: Robocopy (Native Windows High-Performance Utility)

## Core API Endpoints

- `/api/status`: ICMP Bridge monitoring.
- `/api/system`: Hardware platform and hostname detection.
- `/api/fs/ls`: Dynamic directory listing for browser modal.
- `/api/speedtest`: Thunderbolt 5 throughput simulation samples.
- `/api/sync`: Robocopy mirroring execution.
- `/api/github/*`: Push/Pull orchestration for remote backup.
