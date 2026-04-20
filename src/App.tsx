import { useState, useEffect } from 'react';
import { 
  Zap, 
  Settings, 
  RefreshCw, 
  Monitor, 
  Folder, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Terminal,
  Activity,
  ArrowRightLeft,
  Github,
  CloudUpload,
  ArrowDownCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Config {
  localDir: string;
  remoteDir: string;
  remoteIp: string;
}

interface Status {
  connected: boolean;
  ip: string;
  os: string;
}

interface NetworkInterface {
  name: string;
  address: string;
  netmask: string;
}

interface ScannedNode {
  ip: string;
  type: string;
  isThunderbolt: boolean;
}

export default function App() {
  const [config, setConfig] = useState<Config>({ localDir: '', remoteDir: '', remoteIp: '' });
  const [status, setStatus] = useState<Status | null>(null);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [scannedNodes, setScannedNodes] = useState<ScannedNode[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [syncResult, setSyncResult] = useState<{ status: string; message: string; details?: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Fetch initial config and status
  useEffect(() => {
    fetchConfig();
    fetchInterfaces();
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const pushToGithub = async () => {
    if (isPushing) return;
    setIsPushing(true);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] Push to GitHub initiated...`, ...prev]);
    try {
      const res = await fetch('/api/github/push', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'Success') {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] GitHub Push SUCCESS.`, ...prev]);
        alert("Code successfully pushed to GitHub repository!");
      } else {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] GitHub Push ERROR: ${data.message}`, ...prev]);
        alert("Push failed: " + data.message);
      }
    } catch (err) {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] GitHub Push FAILED: Network error`, ...prev]);
    } finally {
      setIsPushing(false);
    }
  };

  const pullFromGithub = async () => {
    if (isPulling) return;
    
    setIsPulling(true);
    setShowPullConfirm(false);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] Fetching latest code from GitHub...`, ...prev]);
    try {
      const res = await fetch('/api/github/pull', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'Success') {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] GitHub Pull SUCCESS. Project is now up-to-date. Refreshing...`, ...prev]);
        // Give the logs a moment to be seen before potentially restarting
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] GitHub Pull ERROR: ${data.message}`, ...prev]);
      }
    } catch (err) {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] GitHub Pull FAILED: Network error`, ...prev]);
    } finally {
      setIsPulling(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error('Failed to fetch config');
    }
  };

  const fetchInterfaces = async () => {
    try {
      const res = await fetch('/api/interfaces');
      const data = await res.json();
      setInterfaces(data);
    } catch (err) {
      console.error('Failed to fetch interfaces');
    }
  };

  const scanNetwork = async (subnet?: string) => {
    if (!subnet) {
      // Use first available subnet if not specified
      if (interfaces.length === 0) {
         setLogs(prev => [`[${new Date().toLocaleTimeString()}] Cannot scan: No network interfaces detected.`, ...prev]);
         return;
      }
      subnet = interfaces[0].address.split('.').slice(0, 3).join('.');
    }
    
    setIsScanning(true);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] Initiating network scan on subnet ${subnet}.x...`, ...prev]);
    try {
      const res = await fetch(`/api/scan?subnet=${subnet}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Server Error" }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setScannedNodes(data.nodes);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Discovery complete. Identified ${data.nodes.length} active nodes.`, ...prev]);
    } catch (err: any) {
      console.error('Failed to scan network:', err);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Network Scan Error: ${err.message}`, ...prev]);
    } finally {
      setIsScanning(false);
    }
  };

  const checkStatus = async () => {
    try {
      const controller = new AbortController();
      // Increased timeout to accommodate server reboot cycles
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch('/api/status', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      // Gracefully handle server restarts after syncs
      const isNetworkError = err.name === 'AbortError' || err.message.includes('fetch');
      
      if (!isNetworkError) {
        console.error('Status check failed:', err.message);
      }
      
      setStatus({ 
        connected: false, 
        error: isNetworkError 
          ? "Connecting to backend... (Server is rebooting after code sync)" 
          : "Connection lost. Please check backend host." 
      });
    }
  };

  const updateConfig = async (newConfig: Partial<Config>) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, ...newConfig }),
      });
      const data = await res.json();
      setConfig(data.config);
    } catch (err) {
      console.error('Failed to update config');
    }
  };

  const runSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncResult(null);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] Initializing synchronization...`, ...prev]);

    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${data.status}: ${data.message}`, ...prev]);
    } catch (err) {
      setSyncResult({ status: 'Error', message: 'Network error or server unavailable.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Header / Nav */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#F27D26] p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white text-bold" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TB5 SYNC <span className="text-[#F27D26]">CORE</span></h1>
            <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Thunderbolt 5 High-Speed Bridge</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {showPullConfirm && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={pullFromGithub}
                  className="bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                >
                  Confirm Overwrite
                </motion.button>
              )}
            </AnimatePresence>

            <button 
              onClick={() => showPullConfirm ? setShowPullConfirm(false) : setShowPullConfirm(true)}
              disabled={isPulling}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider
                ${isPulling 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 cursor-wait' 
                  : showPullConfirm
                    ? 'bg-white/10 border-white/20 text-white cursor-pointer'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-[#71717A] hover:text-white cursor-pointer active:scale-95'}`}
              title="Overwrite local code with latest from GitHub"
            >
              {isPulling ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : showPullConfirm ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <ArrowDownCircle className="w-3 h-3" />
              )}
              {isPulling ? 'Syncing...' : showPullConfirm ? 'Cancel' : 'Sync from GitHub'}
            </button>
          </div>

          <button 
            onClick={pushToGithub}
            disabled={isPushing}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider
              ${isPushing 
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 cursor-wait' 
                : 'bg-white/5 border-white/10 hover:border-white/20 text-[#A1A1AA] hover:text-white cursor-pointer active:scale-95'}`}
          >
            {isPushing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Github className="w-3.5 h-3.5" />
            )}
            {isPushing ? 'Pushing...' : 'Deploy to GitHub'}
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <Activity className={`w-3 h-3 ${status?.connected ? 'text-green-500' : 'text-red-500'} animate-pulse`} />
            <span className="text-xs font-mono uppercase tracking-tighter">
              {status?.connected ? `online: ${status.ip}` : 'offline'}
            </span>
          </div>
          <button className="text-[#71717A] hover:text-white transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Config */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">

          {/* Network Discovery Card */}
          <section className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono text-[#71717A] uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Network Discovery
              </h2>
              <button 
                onClick={() => scanNetwork()}
                disabled={isScanning}
                className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest font-mono transition-colors disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-4">
              {/* Local Interfaces */}
              <div className="bg-[#09090B] border border-white/5 rounded-xl p-3">
                <p className="text-[9px] font-mono text-[#71717A] uppercase mb-2">Local Interfaces Detected</p>
                <div className="space-y-1">
                  {interfaces.map((iface, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#A1A1AA]">{iface.name}</span>
                      <span className="text-white">{iface.address}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scanned Nodes */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                {scannedNodes.length === 0 ? (
                  <p className="text-[11px] text-[#3F3F46] italic py-2">No remote nodes discovered yet. Run a scan to see nearby PCs.</p>
                ) : (
                  scannedNodes.map((node, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const newIp = node.ip;
                        const newRemoteDir = config.remoteDir.replace(/\d+\.\d+\.\d+\.\d+/, newIp);
                        updateConfig({ remoteIp: newIp, remoteDir: newRemoteDir });
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left
                        ${config.remoteIp === node.ip 
                          ? 'bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]' 
                          : 'bg-white/5 border-white/5 hover:border-white/20 text-[#A1A1AA]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${node.isThunderbolt ? 'bg-[#F27D26]/20' : 'bg-white/10'}`}>
                          {node.isThunderbolt ? <Zap className="w-3 h-3 text-[#F27D26]" /> : <Monitor className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold font-mono">{node.ip}</p>
                          <p className="text-[9px] uppercase tracking-tighter opacity-60">
                            {node.isThunderbolt ? 'Thunderbolt Bridge' : 'Standard Ethernet'}
                          </p>
                        </div>
                      </div>
                      {config.remoteIp === node.ip && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
          
          {/* Sync Trigger Card */}
          <section className="bg-[#18181B] border border-white/10 rounded-2xl p-6 overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-sm font-mono text-[#71717A] uppercase mb-6 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Operations
              </h2>
              
              <button 
                onClick={runSync}
                disabled={isSyncing || !status?.connected}
                className={`w-full group py-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4
                  ${isSyncing 
                    ? 'border-[#F27D26] bg-[#F27D26]/10 text-[#F27D26]' 
                    : !status?.connected
                      ? 'border-white/5 bg-white/5 text-[#3F3F46] cursor-not-allowed'
                      : 'border-[#F27D26] hover:bg-[#F27D26] text-[#F27D26] hover:text-white cursor-pointer active:scale-[0.98]'
                  }`}
              >
                <RefreshCw className={`w-12 h-12 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} strokeWidth={1} />
                <span className="text-lg font-bold uppercase tracking-widest leading-none">
                  {isSyncing ? 'Synchronizing...' : 'Initialize Sync'}
                </span>
                <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">
                  {isSyncing ? 'Using 32 Parallel Threads' : 'Trigger High-Speed Mirror'}
                </span>
              </button>

              {syncResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl border flex items-start gap-3
                    ${syncResult.status === 'Success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                >
                  {syncResult.status === 'Success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <div>
                    <p className="font-bold uppercase text-xs">{syncResult.status}</p>
                    <p className="text-sm opacity-90">{syncResult.message}</p>
                  </div>
                </motion.div>
              )}
            </div>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <RefreshCw className="w-40 h-40" />
            </div>
          </section>

          {/* Configuration Card */}
          <section className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-mono text-[#71717A] uppercase mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Node Configuration
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-2">
                  <Monitor className="w-3 h-3" /> Local Path (Source)
                </label>
                <div className="relative group">
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] group-focus-within:text-[#F27D26] transition-colors" />
                  <input 
                    type="text"
                    value={config.localDir}
                    onChange={(e) => setConfig({ ...config, localDir: e.target.value })}
                    onBlur={(e) => updateConfig({ localDir: e.target.value })}
                    placeholder="C:\Users\Name\Documents"
                    className="w-full bg-[#09090B] border border-white/5 focus:border-[#F27D26] rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-2">
                  <ArrowRightLeft className="w-3 h-3" /> Remote Path (Destination)
                </label>
                <div className="relative group">
                  <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] group-focus-within:text-[#F27D26] transition-colors" />
                  <input 
                    type="text"
                    value={config.remoteDir}
                    onChange={(e) => setConfig({ ...config, remoteDir: e.target.value })}
                    onBlur={(e) => updateConfig({ remoteDir: e.target.value })}
                    placeholder="\\192.168.10.2\Shared"
                    className="w-full bg-[#09090B] border border-white/5 focus:border-[#F27D26] rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Target Bridge IP
                </label>
                <input 
                  type="text"
                  value={config.remoteIp}
                  onChange={(e) => setConfig({ ...config, remoteIp: e.target.value })}
                  onBlur={(e) => updateConfig({ remoteIp: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/5 focus:border-[#F27D26] rounded-lg py-2.5 px-4 text-sm font-mono outline-none transition-all"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Center/Right Column: Logs & Hardware Stats */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          
          {/* Hardware Meta Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#71717A] uppercase">Active Protocol</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold">Thunderbolt 5</span>
                <Zap className="w-5 h-5 text-[#F27D26]" />
              </div>
            </div>
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#71717A] uppercase">Potential Bandwidth</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold">80.0 Gb/s</span>
                <span className="text-[10px] font-mono text-green-500 uppercase tracking-tighter self-end mb-1">Theoretical Max</span>
              </div>
            </div>
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#71717A] uppercase">Optimization Engine</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold">Robocopy MT</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-[#F27D26] rounded-full"></div>
                  <div className="w-1 h-5 bg-[#F27D26] rounded-full"></div>
                  <div className="w-1 h-2 bg-[#F27D26] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <section className="bg-[#09090B] border border-white/10 rounded-2xl flex flex-col h-[400px]">
            <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <h2 className="text-xs font-mono text-[#71717A] uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4" /> System Console
              </h2>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] font-mono text-[#3F3F46] hover:text-white transition-colors"
                id="clear-logs"
              >
                Clear History
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
              {logs.length === 0 ? (
                <p className="text-[#3F3F46] italic">Consolidated bridge logs will appear here...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`flex gap-3 ${i === 0 ? 'text-[#F27D26]' : 'text-[#A1A1AA]'}`}>
                    <span className="shrink-0 opacity-50">[{logs.length - i}]</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
            {isSyncing && (
                <div className="h-1 bg-white/5 relative">
                  <motion.div 
                    className="absolute inset-0 bg-[#F27D26]"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                </div>
              )}
          </section>

          {/* Information / Setup Tips */}
          <section className="bg-[#F27D26]/5 border border-[#F27D26]/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-[#F27D26] flex items-center gap-2 mb-4">
              <Info className="w-5 h-5" /> Precision Setup Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#A1A1AA]">
              <div>
                <h3 className="text-white font-semibold mb-2">1. Hardware Handshake</h3>
                <p className="leading-relaxed">Connect your Thunderbolt 5 cable between both Mini PCs. Ensure the bridge IP is set correctly in Windows Network Connections (e.g., 192.168.10.2).</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">2. Permission Protocol</h3>
                <p className="leading-relaxed">Right-click your destination folder on PC 2 and select 'Give Access To' &rarr; 'Everyone' (or specific user) to allow high-speed SMB writes.</p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="mt-12 border-t border-white/10 p-6 text-center">
        <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em]">
          Engineered for Unlimited Thunderbolt 5 Synchronisation
        </p>
      </footer>
    </div>
  );
}
