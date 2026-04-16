import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { UploadCloud, FileAudio, Image as ImageIcon, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAppContext } from '@/src/context/AppContext';

export default function Encode() {
  const { addOperation, simulateProcessing, updateOperationStatus } = useAppContext();
  const [quality, setQuality] = useState([80]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Advanced AI toggles
  const [useNeural, setUseNeural] = useState(true);
  const [useNeuralSteg, setUseNeuralSteg] = useState(false);
  const [useAdaptive, setUseAdaptive] = useState(true);

  const handleEncode = async () => {
    if (!imageFile || !audioFile) return;
    setIsProcessing(true);
    setIsSuccess(false);

    const opId = addOperation({
      type: 'Encode',
      file: `${imageFile.name} + ${audioFile.name}`,
      status: 'Pending'
    });

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('audio', audioFile);
      formData.append('password', 'demo12345'); 
      formData.append('quality', quality[0].toString());
      formData.append('use_neural', useNeural.toString());
      formData.append('use_neural_steg', useNeuralSteg.toString());
      formData.append('use_adaptive', useAdaptive.toString());

      const response = await fetch('http://localhost:5001/api/encrypt', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        updateOperationStatus(opId, 'Success');
        setIsSuccess(true);
        
        // Download the stego file
        const blob = await response.blob();
        console.log(`[ENCODE] Received stego blob: ${blob.size} bytes`);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stego_audio.wav';
        document.body.appendChild(a);
        a.click();
        
        // Small delay before cleanup to ensure download starts reliably
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      } else {
        updateOperationStatus(opId, 'Failed');
      }
    } catch (error) {
      console.error('Encoding failed:', error);
      updateOperationStatus(opId, 'Failed');
    }
    
    setIsProcessing(false);
    
    // Reset success state after a few seconds
    if (isSuccess) {
      setTimeout(() => setIsSuccess(false), 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="mb-8">
        <h1 className="text-[28px] font-[700] tracking-[-1px]">Encode Payload</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Hide a secret image within an audio file using LSB steganography.</p>
      </header>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Secret Image</div>
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-secondary transition-colors cursor-pointer relative overflow-hidden">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) setImagePreview(window.URL.createObjectURL(file));
              }}
              accept="image/png, image/jpeg, image/webp"
            />
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-muted-foreground" />
            </div>
            {imagePreview ? (
              <div className="absolute inset-0 z-10">
                <img src={imagePreview} className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            ) : null}
            <div className="relative z-20">
              <p className="text-[14px] font-[500]">
                {imageFile ? imageFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">
                {imageFile ? `${(imageFile.size / 1024).toFixed(2)} KB` : 'PNG, JPG or WebP (Max 50MB)'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Cover Audio</div>
            <FileAudio className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-secondary transition-colors cursor-pointer relative overflow-hidden">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              accept="audio/wav, audio/mpeg, audio/flac"
            />
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-[14px] font-[500]">
              {audioFile ? audioFile.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              {audioFile ? `${(audioFile.size / 1024).toFixed(2)} KB` : 'WAV, MP3 or FLAC (Max 100MB)'}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">AI Pipeline Configuration</div>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-[14px]">Advanced Neural Compression</Label>
                <p className="text-[12px] text-muted-foreground">Use Residual CVAE v3.0-PRO for data reduction</p>
              </div>
              <input 
                type="checkbox" 
                checked={useNeural} 
                onChange={(e) => setUseNeural(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-[14px]">Neural Spectral Hider (PixInWav)</Label>
                <p className="text-[12px] text-muted-foreground">AI-driven spectral domain steganography</p>
              </div>
              <input 
                type="checkbox" 
                checked={useNeuralSteg} 
                onChange={(e) => setUseNeuralSteg(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50 opacity-60">
              <div className="space-y-0.5">
                <Label className="text-[14px]">Psychoacoustic Masking</Label>
                <p className="text-[12px] text-muted-foreground">Adaptive LSB positioning based on AI audio analysis</p>
              </div>
              <input 
                type="checkbox" 
                checked={useAdaptive} 
                onChange={(e) => setUseAdaptive(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[16px] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div className="text-[12px] uppercase tracking-[0.05em] font-[700] text-muted-foreground">Compression Quality</div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Quality Level</Label>
                <span className="text-[14px] text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-foreground"
              />
              <p className="text-[12px] text-muted-foreground">Higher quality = better AI reconstruction, larger payload</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-[16px] bg-amber-500/5 border border-amber-500/10 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[14px] font-[600] text-amber-900">Optimization Tip</h4>
            <p className="text-[12px] text-amber-800/70 leading-relaxed">
              When using lossy codecs like **Opus** or **MP3**, steganographic bits may be slightly distorted. For 100% reconstruction accuracy, we recommend using **WAV** format covers.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            className={`px-8 gap-2 ${isSuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-foreground text-background hover:bg-foreground/90'}`}
            disabled={!imageFile || !audioFile || isProcessing}
            onClick={handleEncode}
          >
            {isProcessing ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Success! Download Ready
              </>
            ) : (
              'Generate Stego-Audio'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
