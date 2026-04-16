import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, Plus, Trash2, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Keys() {
  const [keys, setKeys] = useState([
    { id: '1', name: 'Primary Communication', created: '2023-10-24', fingerprint: 'a8f4...9b2c' },
    { id: '2', name: 'Backup Archive', created: '2023-11-02', fingerprint: 'c3e1...4d5f' },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-[700] tracking-[-1px]">Key Management</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage AES-256-GCM encryption keys for payloads.</p>
        </div>
        <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
          <Plus className="w-4 h-4" />
          Generate Key
        </Button>
      </header>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Active Keys</div>
        </div>
        
        <div className="space-y-4">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <Key className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="text-[14px] font-[600]">{key.name}</div>
                  <div className="text-[12px] text-muted-foreground font-mono mt-0.5">
                    Fingerprint: {key.fingerprint} • Created: {key.created}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Import Key</div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Alias</Label>
            <Input id="keyName" placeholder="e.g., External Partner Key" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyValue">Key Material (Base64)</Label>
            <Input id="keyValue" type="password" placeholder="Paste base64 encoded AES-256 key" />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline">Import</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
