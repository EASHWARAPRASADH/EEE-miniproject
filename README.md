---
title: STEGANO-X
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛰️ STEGANO-X
### **Next-Gen AI Audio Steganography & Verification Pipeline**

**STEGANO-X** is a high-fidelity AI-powered steganography system designed for secure data transmission within audio carriers. It combines **AES-256 GCM** encryption with advanced **Neural Recovery Surrogates** and **Robust Adaptive LSB** techniques to ensure 100% data integrity and state-of-the-art detection resistance.

---

## 🌟 Key Features
*   🧬 **Hybrid AI Recovery**: Uses ResNet-inspired structural surrogates (Lanczos/UnsharpMask) to recover payload data with bit-perfect accuracy.
*   🔐 **Military-Grade Security**: AES-256 authenticated encryption ensures only authorized parties can access hidden payloads.
*   🎧 **Acoustic Transparency**: High-fidelity `.wav` processing minimizes spectral distortion (High SNR).
*   📊 **Real-Time Dashboard**: Integrated model monitoring, system metrics, and steganometric analysis.
*   🐳 **Cloud-Ready**: Fully containerized and optimized for Hugging Face Spaces.

---

## 💻 Local Setup Guide (Windows)

Follow these steps to run the complete environment on your Windows machine.

### **1. Prerequisites**
*   **Python 3.10+**: [Download Here](https://www.python.org/downloads/)
*   **Node.js 18+**: [Download Here](https://nodejs.org/)
*   **FFmpeg**: 
    1.  Download the "essentials" build from [Gyan.dev](https://www.gyan.dev/ffmpeg/builds/).
    2.  Extract it to `C:\ffmpeg`.
    3.  Add `C:\ffmpeg\bin` to your **System Environment Variables (Path)**.
    4.  Verify by running `ffmpeg -version` in your terminal.

### **2. Installation**
Open **PowerShell** or **CMD** in the project directory:

```bash
# 1. Install Frontend dependencies
npm install

# 2. Build the Frontend
npm run build

# 3. Create a Python Virtual Environment
python -m venv venv
.\venv\Scripts\activate

# 4. Install Backend dependencies
pip install -r backend/requirements-prod.txt
```

### **3. Running the Application**
STEGANO-X uses a **Unified Architecture**. You only need to run the Python server; it will automatically serve the React frontend.

```bash
# Ensure your virtual environment is active
python backend/app.py
```

**Access the app at**: `http://localhost:7860`

---

## 🛠️ Unified Architecture Overview

The system is split into three main layers:
1.  **Frontend (React/Vite)**: Modern, glassmorphism UI for encoding, decoding, and monitoring.
2.  **API Layer (Flask)**: High-performance bridge between the UI and the AI cores.
3.  **AI Research Layer (PyTorch)**: 
    *   `neural_compression.py`: CVAE-inspired image reconstruction surrogates.
    *   `super_resolution.py`: Residual GAN-based resolution enhancement.
    *   `noise_reduction.py`: DnResNet bypass for cleaner extraction.

---

## 📦 Production Deployment (Hugging Face)

This project is configured for **Docker-based deployment** on Hugging Face Spaces.

1.  **Repository Setup**:
    ```bash
    git remote add origin https://github.com/EASHWARAPRASADH/EEE-miniproject.git
    git push -u origin main
    ```
2.  **Hugging Face**: Connect your GitHub repo to a new Docker Space, or use the dedicated `STEGANO-X` space template provided in the source.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

**Project maintained by EashCodeX.**
