import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '@/src/context/AppContext';

export default function Models() {
  const { models } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-[700] tracking-[-1px]">AI Models</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage neural networks and model checkpoints.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Check Updates
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model, i) => (
          <div key={i} className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-secondary">
                  <Cpu className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="text-[14px] font-[700]">{model.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] text-muted-foreground">{model.version}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-secondary text-muted-foreground hover:bg-secondary font-normal">
                      {model.type}
                    </Badge>
                  </div>
                </div>
              </div>
              {model.status === 'Active' ? (
                <div className="flex items-center gap-1 text-[#10b981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[12px] font-[500]">Active</span>
                </div>
              ) : (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                  {model.status}
                </Badge>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <p className="text-[14px] text-muted-foreground mb-6">{model.description}</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-border">
                  {Object.entries(model.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-[500]">{key}</p>
                      <p className="text-[14px] font-[500] text-foreground mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
                
                {model.status !== 'Active' && (
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 gap-2">
                    <Download className="w-4 h-4" />
                    Download Update
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
