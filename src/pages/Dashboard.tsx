import { Activity, HardDrive, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { NeuralNetworkLink } from '../components/NeuralNetworkLink';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/src/context/AppContext';

export default function Dashboard() {
  const { operations, metrics, models } = useAppContext();
  const [visCells, setVisCells] = useState<boolean[]>([]);
  const [avgCapacity, setAvgCapacity] = useState('4.4 bpp');
  const [detectionRate, setDetectionRate] = useState('< 0.1%');

  useEffect(() => {
    const cells = Array.from({ length: 100 }, () => Math.random() > 0.8);
    setVisCells(cells);

    const interval = setInterval(() => {
      setVisCells(prev => prev.map(v => Math.random() > 0.9 ? !v : v));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Fetch real capacity and detection rate from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/models')
      .then(res => {
        const capacity = res.headers.get('X-Avg-Capacity');
        const detection = res.headers.get('X-Detection-Rate');
        if (capacity) setAvgCapacity(capacity);
        if (detection) setDetectionRate(detection);
        return res.json();
      })
      .catch(err => console.error('Failed to fetch model metrics:', err));
  }, []);

  const stats = [
    { label: 'System Status', value: 'Optimal', icon: Activity, color: 'text-emerald-500' },
    { label: 'Active Models', value: `${models.filter(m => m.status === 'Active').length} / ${models.length}`, icon: Zap, color: 'text-amber-500' },
    { label: 'Avg. Capacity', value: avgCapacity, icon: HardDrive, color: 'text-blue-500' },
    { label: 'Detection Rate', value: detectionRate, icon: ShieldCheck, color: 'text-indigo-500' },
  ];

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full"
    >
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-[700] tracking-[-1px]">Stealth Control Center</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Analyzing active neural embeddings and latent space capacity.</p>
        </div>
        <div className="bg-[#f0fdf4] border border-[#dcfce7] text-[#166534] px-3 py-1 rounded-full text-[12px] font-[600]">
          SYSTEM ONLINE
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">{stat.label}</div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-[42px] font-[300] tracking-[-2px] mt-2">
              {stat.value.split(' ')[0]} <span className="text-[18px] text-muted-foreground font-[400]">{stat.value.split(' ').slice(1).join(' ')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 flex-1">
        {/* Column 1: Main Visuals and Data (2fr) */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col h-[320px]">
            <div className="flex justify-between items-center mb-5">
              <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Neural Network Link</div>
              <div className="text-[12px] text-accent font-mono">LATENT_SYNC_OK</div>
            </div>
            <div className="flex-1">
              <NeuralNetworkLink />
            </div>
            <div className="mt-4 flex gap-6">
              <div>
                <div className="text-[13px] text-muted-foreground">Active Nodes</div>
                <div className="font-mono text-[16px] font-[600]">{metrics.activeNodes}</div>
              </div>
              <div>
                <div className="text-[13px] text-muted-foreground">Connections</div>
                <div className="font-mono text-[16px] font-[600]">{metrics.connections}</div>
              </div>
              <div>
                <div className="text-[13px] text-muted-foreground">Sync Latency</div>
                <div className="font-mono text-[16px] font-[600]">{Math.round(metrics.latency)}ms</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Recent Operations</div>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {operations.slice(0, 5).map((op) => (
                <div key={op.id} className="flex justify-between items-baseline pb-3 border-b border-[#f5f5f5] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      op.type === 'Encode' ? 'bg-accent' : 
                      op.type === 'Decode' ? 'bg-purple-500' : 
                      'bg-emerald-500'
                    }`} />
                    <span className="text-[13px] font-[500]">{op.type}</span>
                    <span className="text-[13px] text-muted-foreground ml-2 truncate max-w-[200px]">{op.file}</span>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className={`font-mono text-[14px] font-[600] ${
                      op.status === 'Success' ? 'text-[#10b981]' :
                      op.status === 'Processing' ? 'text-amber-500' :
                      op.status === 'Failed' ? 'text-rose-500' :
                      'text-muted-foreground'
                    }`}>
                      {op.status}
                    </span>
                    <span className="text-[13px] text-muted-foreground w-16 text-right">{formatTimeAgo(op.time)}</span>
                  </div>
                </div>
              ))}
              {operations.length === 0 && (
                <div className="text-center text-muted-foreground text-[14px] py-4">No recent operations</div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Audio Spectral Analysis</div>
            </div>
            <div className="w-full h-[80px] flex items-center gap-[2px]">
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 10 }}
                  animate={{ height: [10, Math.random() * 70 + 10, 10] }}
                  transition={{ 
                    duration: 1.5 + Math.random(), 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex-1 bg-accent rounded-[1px]"
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">Psychoacoustic masking model identifying sub-threshold frequency bands for JND embedding.</p>
          </div>
        </div>

        {/* Column 2: Metrics and Status (1fr) */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Latent Space Map</div>
            </div>
            <div className="flex-1 bg-[#f9f9f9] rounded-lg p-3 grid grid-cols-10 gap-1">
              {visCells.map((active, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ 
                    backgroundColor: active ? '#2563eb' : '#e5e7eb',
                    opacity: active ? 0.6 : 1
                  }}
                  className="aspect-square rounded-[1px]"
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
              Real-time visualization of high-dimensional latent space activations within the GAN encoder.
            </p>
          </div>

          <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Neural Activity</div>
              <div className="text-[10px] font-mono text-emerald-500">STABLE</div>
            </div>
            <div className="flex-1 h-[80px] relative">
              <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                <motion.path
                  d="M 0 30 Q 25 10 50 40 T 100 20 T 150 50 T 200 30"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
                <motion.path
                  d="M 0 30 Q 25 50 50 20 T 100 40 T 150 10 T 200 30"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                />
              </svg>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground">Throughput</span>
              <span className="text-[13px] font-mono font-[600]">{Math.round(metrics.throughput)} req/s</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">System Resources</div>
            </div>
            <div className="flex flex-col gap-6 mt-2">
              <div>
                <div className="flex justify-between items-baseline pb-2">
                  <span className="text-[13px] text-muted-foreground">GPU Memory</span>
                  <span className="font-mono text-[14px] font-[600]">{(metrics.gpu / 100 * 24).toFixed(1)} / 24 GB</span>
                </div>
                <div className="w-full h-1.5 bg-[#f9f9f9] rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${metrics.gpu}%` }}
                    className="h-full bg-accent rounded-full transition-all duration-1000" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline pb-2">
                  <span className="text-[13px] text-muted-foreground">CPU Usage</span>
                  <span className="font-mono text-[14px] font-[600]">{Math.round(metrics.cpu)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#f9f9f9] rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${metrics.cpu}%` }}
                    className="h-full bg-accent rounded-full transition-all duration-1000" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
