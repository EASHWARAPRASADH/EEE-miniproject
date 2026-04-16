# AI Features Testing Flow

## Overview
This document provides the complete testing flow for all AI enhancements implemented in the Audio Steganography pipeline.

## AI Features Implemented

1. **Deep Learning Quality Metrics** (NIQE, BRISQUE)
2. **Neural Image Compression** (Autoencoder-based)
3. **ML-Based Adaptive Audio Embedding** (Psychoacoustic)
4. **AI Super-Resolution** (Residual network)

## Testing Flow

### Step 1: Start Backend Server
```bash
cd /Users/eash/Downloads/MiniProject---Audio-Steganography-main
source venv/bin/activate
python backend/app.py
```
**Backend runs on**: http://localhost:5001

### Step 2: Start Frontend Server (if not running)
```bash
cd /Users/eash/Downloads/MiniProject---Audio-Steganography-main/frontend
python -m http.server 8080
```
**Frontend runs on**: http://localhost:8080

### Step 3: Run Unit Tests
```bash
cd /Users/eash/Downloads/MiniProject---Audio-Steganography-main/backend
source ../venv/bin/activate
python tests.py
```
**Expected**: All 26 tests pass

### Step 4: Test AI Features via API

#### Test 4.1: Health Check
```bash
curl http://localhost:5001/api/health
```

#### Test 4.2: Image Encryption with Neural Compression
```bash
curl -X POST http://localhost:5001/api/encrypt \
  -F "image=@test_image.jpg" \
  -F "audio=@test_audio.wav" \
  -F "password=testpassword123" \
  -F "quality=70" \
  -F "use_neural=true" \
  -o stego_neural.wav
```

#### Test 4.3: Image Encryption with Adaptive Embedding
```bash
curl -X POST http://localhost:5001/api/encrypt \
  -F "image=@test_image.jpg" \
  -F "audio=@test_audio.wav" \
  -F "password=testpassword123" \
  -F "quality=70" \
  -F "use_adaptive=true" \
  -o stego_adaptive.wav
```

#### Test 4.4: Image Decryption with Super-Resolution
```bash
curl -X POST http://localhost:5001/api/decrypt \
  -F "audio=@stego_neural.wav" \
  -F "password=testpassword123" \
  -F "use_sr=true" \
  -o recovered_sr.png
```

#### Test 4.5: Text Encryption with Adaptive Embedding
```bash
curl -X POST http://localhost:5001/api/encrypt-text \
  -F "text=Secret message" \
  -F "audio=@test_audio.wav" \
  -F "password=testpassword123" \
  -F "use_adaptive=true" \
  -o stego_text.wav
```

### Step 5: Test via Frontend UI

1. Open http://localhost:8080 in browser
2. Navigate to "Image" tab
3. Upload test image and audio
4. Enter password
5. Set quality slider
6. Click "Encrypt" (traditional)
7. Check results and metrics
8. Repeat with AI features enabled (if UI supports it)

### Step 6: Verify AI Feature Headers

After encryption, check response headers:
- `X-AI-Neural-Available`: 1 (always available with fallback)
- `X-AI-Adaptive-Available`: 1
- `X-AI-SR-Available`: 1 if PyTorch installed, 0 otherwise

### Step 7: Test Feature Combinations

Test different combinations:
- Traditional only (baseline)
- Neural compression only
- Adaptive embedding only
- Super-resolution only (on decrypt)
- Neural + Adaptive
- Neural + Adaptive + Super-Resolution

### Step 8: Compare Results

Compare metrics across different methods:
- Compression ratios
- Image quality (PSNR, SSIM, NIQE, BRISQUE)
- Audio quality (SNR, PSNR, correlation)
- Processing time

## Expected Results

### Without PyTorch (AI dependencies not installed):
- All features fall back to traditional methods
- Backend runs without errors
- `X-AI-SR-Available: 0`
- Neural compression and super-resolution use traditional fallbacks
- Adaptive embedding still works (uses scipy/numpy only)

### With PyTorch (AI dependencies installed):
- Neural compression uses autoencoder
- Super-resolution uses residual network
- Adaptive embedding uses psychoacoustic analysis
- All AI features active
- Better compression ratios and quality

## Installation of AI Dependencies (Optional)

To enable full AI features:
```bash
cd /Users/eash/Downloads/MiniProject---Audio-Steganography-main
source venv/bin/activate
pip install torch==2.2.0 torchvision==0.17.0
pip install image-quality==1.2.7
pip install piq==0.8.0
```

## Troubleshooting

### Backend fails to start:
- Check if port 5001 is already in use
- Verify all dependencies installed
- Check error logs

### Import errors:
- AI dependencies are optional
- Backend will fall back to traditional methods
- Install PyTorch if you want full AI features

### Tests fail:
- Ensure backend is not running (conflicts)
- Check all dependencies installed
- Run tests from backend directory

## End of Testing Flow

After completing all tests, you should have:
- Verified backend and frontend are running
- Confirmed all unit tests pass
- Tested AI features via API
- Tested AI features via UI
- Compared results across different methods
- Verified fallback behavior without PyTorch
