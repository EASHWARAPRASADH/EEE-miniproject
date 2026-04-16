import io
import numpy as np
from PIL import Image
import soundfile as sf
import torch
from neural_compression import compress_image_neural, decompress_image_neural
from neural_steganography import neural_hide_image_in_audio, neural_extract_image_from_audio
from noise_reduction import apply_ai_noise_reduction

def test_neural_pipeline():
    print("--- Testing AI Pipeline ---")
    
    # 1. Create dummy audio (1 second sine wave)
    sr = 44100
    t = np.linspace(0, 1, sr)
    audio = np.sin(2 * np.pi * 440 * t)
    audio_buf = io.BytesIO()
    sf.write(audio_buf, audio, sr, format='WAV')
    audio_bytes = audio_buf.getvalue()
    print(f"Dummy audio created: {len(audio_bytes)} bytes")
    
    # 2. Create dummy image (256x256)
    img = Image.new('RGB', (256, 256), color = (73, 109, 137))
    img_buf = io.BytesIO()
    img.save(img_buf, format='PNG')
    image_bytes = img_buf.getvalue()
    print(f"Dummy image created: {len(image_bytes)} bytes")
    
    # 3. Test Compression
    print("Testing Neural Compression...")
    compressed, stats = compress_image_neural(image_bytes, quality=70)
    print(f"Compressed size: {len(compressed)} bytes (Ratio: {stats['total_ratio']}x)")
    
    decompressed = decompress_image_neural(compressed)
    print(f"Decompressed size: {len(decompressed)} bytes")
    
    # 4. Test Neural Steganography
    print("Testing Neural Steganography (PixInWav-lite)...")
    # Note: PixInWav hides images directly. For this test, we use the original image.
    stego_audio = neural_hide_image_in_audio(audio_bytes, image_bytes)
    print(f"Stego audio created: {len(stego_audio)} bytes")
    
    # 5. Test Extraction
    print("Testing Neural Extraction...")
    extracted_compressed = neural_extract_image_from_audio(stego_audio)
    # Note: In a real DNS, the extracted bytes would be the exact same if trained well.
    # Here we are testing the model forwarding.
    print(f"Extracted payload size: {len(extracted_compressed)} bytes")
    
    # 6. Test Noise Reduction
    print("Testing AI Noise Reduction...")
    denoised = apply_ai_noise_reduction(decompressed)
    print(f"Denoised image size: {len(denoised)} bytes")
    
    print("--- AI Pipeline Test Complete ---")

if __name__ == "__main__":
    if torch.cuda.is_available():
        print("Using GPU")
    elif torch.backends.mps.is_available():
        print("Using Apple Silicon GPU (MPS)")
    else:
        print("Using CPU")
    test_neural_pipeline()
