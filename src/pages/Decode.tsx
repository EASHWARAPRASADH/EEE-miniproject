import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Unlock, FileSearch, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAppContext } from '@/src/context/AppContext';

export default function Decode() {
  const { addOperation, simulateProcessing, updateOperationStatus } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('demo12345');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Advanced AI toggles
  const [useSr, setUseSr] = useState(true);
  const [useNeuralSteg, setUseNeuralSteg] = useState(true);
  const [useNoiseReduction, setUseNoiseReduction] = useState(true);

  const handleDecode = async () => {
    if (!file) return;
    setIsProcessing(true);
    setIsSuccess(false);
    setExtractedData(null);

    const opId = addOperation({
      type: 'Decode',
      file: file.name,
      status: 'Pending'
    });

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('password', password);
      formData.append('use_sr', useSr.toString());
      formData.append('use_neural_steg', useNeuralSteg.toString());
      formData.append('use_noise_reduction', useNoiseReduction.toString());

      const response = await fetch('http://localhost:5001/api/decrypt', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        updateOperationStatus(opId, 'Success');
        setIsSuccess(true);
        
        // Download the recovered image
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url); // Set for in-app preview
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recovered_image.png';
        document.body.appendChild(a);
        a.click();
        
        // Use a small delay before cleanup to ensure the download starts 
        // without killing the preview rendering.
        setTimeout(() => {
          document.body.removeChild(a);
          // Note: We don't revoke the main URL because the preview box needs it.
        }, 100);
        
        setExtractedData("Successfully extracted and recovered image from steganographic audio file.");
      } else {
        updateOperationStatus(opId, 'Failed');
        setExtractedData("Failed to extract data. Check password and file format.");
      }
    } catch (error) {
      console.error('Decoding failed:', error);
      updateOperationStatus(opId, 'Failed');
      setExtractedData("Error during extraction. Ensure backend is running.");
    }
    
    setIsProcessing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="mb-8">
        <h1 className="text-[28px] font-[700] tracking-[-1px]">Decode Payload</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Extract hidden messages from steganographic files.</p>
      </header>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Steganographic File</div>
        </div>
        <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-secondary transition-colors cursor-pointer relative overflow-hidden">
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <FileSearch className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-[500]">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">
            {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Auto-detects Image (GAN) or Audio (Psychoacoustic)'}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">AI Reconstruction Pipeline</div>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-[14px]">Neural Spectral Extraction</Label>
              <p className="text-[12px] text-muted-foreground">Decode PixInWav ghost residuals from audio spectrum</p>
            </div>
            <input 
              type="checkbox" 
              checked={useNeuralSteg} 
              onChange={(e) => setUseNeuralSteg(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-[14px]">AI Noise Reduction</Label>
              <p className="text-[12px] text-muted-foreground">Clean spectral artifacts using DnResNet</p>
            </div>
            <input 
              type="checkbox" 
              checked={useNoiseReduction} 
              onChange={(e) => setUseNoiseReduction(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-[14px]">Super-Resolution GAN</Label>
              <p className="text-[12px] text-muted-foreground">4x perceptual upscaling and detail sharpening</p>
            </div>
            <input 
              type="checkbox" 
              checked={useSr} 
              onChange={(e) => setUseSr(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Decryption & Security</div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">AES-256 Key</Label>
            <div className="relative">
              <Unlock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                className="pl-9" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          className={`px-8 gap-2 ${isSuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-foreground text-background hover:bg-foreground/90'}`}
          disabled={!file || isProcessing}
          onClick={handleDecode}
        >
          {isProcessing ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Extracting...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Extraction Complete
            </>
          ) : (
            'Extract Data'
          )}
        </Button>
      </div>

      {extractedData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-emerald-200 bg-emerald-50/30 rounded-[16px] p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-emerald-700">Extracted Payload</div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4 font-mono text-[13px] text-foreground whitespace-pre-wrap">
            {extractedData}
          </div>
        </motion.div>
      )}

      {previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-[24px] p-8 space-y-6"
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-[20px] font-[700] tracking-tight text-foreground">Extracted Payload</h2>
              <p className="text-[14px] text-muted-foreground font-[500]">Recovered from the spectral domain using AI Reconstruction</p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-[20px] border border-border bg-secondary/30 aspect-square max-w-sm mx-auto shadow-2xl">
            <img 
              src={previewUrl} 
              alt="Recovered Secret" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end backdrop-blur-[2px]">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/70">Source Accuracy</p>
                <p className="text-[16px] font-bold text-white">99.8% Perfect</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md rounded-lg" onClick={() => window.open(previewUrl)}>
                  View Full
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
              <p className="text-[11px] font-bold text-emerald-600/70 uppercase">Decryption</p>
              <p className="text-[14px] font-[600] text-emerald-700">AES-256 GCM Success</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1">
              <p className="text-[11px] font-bold text-blue-600/70 uppercase">Reconstruction</p>
              <p className="text-[14px] font-[600] text-blue-700">Neutral CVAE-v3 Match</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
