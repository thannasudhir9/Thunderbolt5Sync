# Local Setup Guide: Thunderbolt 5 Sync Dashboard

Follow these steps to run the Thunderbolt 5 Sync Dashboard on your own computers.

## Prerequisites

1.  **Node.js**: Install Node.js (version 18 or higher) from [nodejs.org](https://nodejs.org/).
2.  **Git**: Ensure Git is installed and available in your terminal path.
3.  **Hardware**: Two PCs connected via a Thunderbolt 5 or USB4 cable.

## Installation Steps

1.  **Download / Clone the Code**:
    If you've pushed the code to GitHub, clone it:
    ```bash
    git clone https://github.com/thannasudhir9/Thunderbolt5Sync.git
    cd Thunderbolt5Sync
    ```
    Alternatively, download and extract the ZIP file of the project.

2.  **Install Dependencies**:
    Open a terminal (Command Prompt, PowerShell, or Bash) in the project folder and run:
    ```bash
    npm install
    ```

3.  **Start the Application**:
    Run the following command to start both the Express backend and the React frontend:
    ```bash
    npm run dev
    ```

4.  **Access the Dashboard**:
    Open your web browser and navigate to:
    `http://localhost:3000`

## Network Configuration (The Thunderbolt Bridge)

For the dashboard to function, your PCs must recognize the Thunderbolt direct connection as a network.

1.  **Connect the Cable**: Plug the TB5 cable into both PCs.
2.  **Assign Static IPs**:
    *   **PC 1**: Set the Thunderbolt Networking adapter IP to `192.168.10.1` (Subnet: `255.255.255.0`).
    *   **PC 2**: Set the Thunderbolt Networking adapter IP to `192.168.10.2` (Subnet: `255.255.255.0`).
3.  **Enable Folder Sharing**:
    *   On the recipient PC (Remote PC), right-click the folder you want to sync to.
    *   Go to **Properties > Sharing > Share**.
    *   Add "Everyone" (or your specific user) and set permissions to "Read/Write".

## Troubleshooting

-   **Ping Fails**: Ensure your Firewall isn't blocking ICMP (Ping) requests on the Thunderbolt network interface.
-   **Robocopy Errors**: Ensure you have administrative rights if you are trying to sync system folders, and that the remote UNC path (e.g., `\\192.168.10.2\Shared`) is accessible in File Explorer.
-   **Vite Errors**: If you see `vite: not found`, ensure you ran `npm install` successfully.
