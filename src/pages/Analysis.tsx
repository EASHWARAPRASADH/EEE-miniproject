import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShieldAlert, ShieldCheck, UploadCloud, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAppContext } from '@/src/context/AppContext';

export default function Analysis() {
  const { addOperation, simulateProcessing } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<'clean' | 'suspicious' | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResult(null);

    const opId = addOperation({
      type: 'Analysis',
      file: file.name,
      status: 'Pending'
    });

    await simulateProcessing(opId, 4000);
    
    // Randomly determine result for demo purposes
    const isSuspicious = Math.random() > 0.5;
    setResult(isSuspicious ? 'suspicious' : 'clean');
    setIsAnalyzing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="mb-8">
        <h1 className="text-[28px] font-[700] tracking-[-1px]">Steganalysis</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Analyze media files for hidden payloads using SRNet Adversarial models.</p>
      </header>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Target Media</div>
        </div>
        
        <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-secondary transition-colors cursor-pointer relative overflow-hidden">
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-[500]">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">
            {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Supports PNG, JPG, WAV, FLAC'}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          className="bg-foreground text-background hover:bg-foreground/90 px-8 gap-2"
          disabled={!file || isAnalyzing}
          onClick={handleAnalyze}
        >
          {isAnalyzing ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-card border rounded-[16px] p-6 flex flex-col ${
            result === 'clean' ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${result === 'clean' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {result === 'clean' ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`text-[16px] font-[600] ${result === 'clean' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {result === 'clean' ? 'No Anomalies Detected' : 'Suspicious Artifacts Detected'}
              </h3>
              <p className="text-[14px] text-muted-foreground mt-1">
                {result === 'clean' 
                  ? 'The SRNet Adversarial model found no statistical evidence of LSB manipulation or GAN-based steganography in this file.' 
                  : 'The model detected statistical anomalies consistent with neural steganography. Confidence score: 94.2%.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
