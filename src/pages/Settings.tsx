import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion } from 'motion/react';

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="mb-8">
        <h1 className="text-[28px] font-[700] tracking-[-1px]">Settings</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Configure system preferences and API connections.</p>
      </header>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">API Configuration</div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Inference Endpoint URL</Label>
            <Input id="endpoint" defaultValue="http://localhost:8000/api/v1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apikey">API Key</Label>
            <Input id="apikey" type="password" defaultValue="sk-........................" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Security Defaults</div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[14px] font-[500]">AES-256-GCM Encryption</Label>
                <p className="text-[12px] text-muted-foreground">Always encrypt payload before embedding</p>
              </div>
              <div className="h-5 w-9 rounded-full bg-foreground relative cursor-pointer">
                <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-background" />
              </div>
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[14px] font-[500]">Error Correction (Reed-Solomon)</Label>
                <p className="text-[12px] text-muted-foreground">Add redundancy for robustness against attacks</p>
              </div>
              <div className="h-5 w-9 rounded-full bg-foreground relative cursor-pointer">
                <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-background" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="bg-foreground text-background hover:bg-foreground/90 px-8">
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
}
