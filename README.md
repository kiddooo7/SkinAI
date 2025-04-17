# 🌟 SkinAI: Automated Skin Cancer Detection

SkinAI is a deep learning-powered web application that classifies skin lesions into one of **seven diagnostic categories** using dermoscopic images. It leverages the **Xception architecture** and advanced image processing techniques to aid early and accurate skin cancer detection.

---

## 🧠 Model Highlights

- **Architecture**: Pre-trained Xception model fine-tuned on medical imaging data
- **Input**: 72×72×3 dermoscopic images
- **Output**: 7-class softmax probability vector
- **Classes**:
  - Actinic Keratoses (AKIEC)
  - Basal Cell Carcinoma (BCC)
  - Benign Keratosis-like Lesions (BKL)
  - Dermatofibroma (DF)
  - Melanoma (MEL)
  - Melanocytic Nevi (NV)
  - Vascular Lesions (VASC)

---

## 🗃️ Dataset

- **HAM10000** ("Human Against Machine with 10000 training images")
- Preprocessed using:
  - Resizing to 72×72
  - Normalization (pixel values scaled between 0 and 1)
  - Augmentation (rotation, flipping, zoom, brightness)
  - **SMOTE** to synthetically balance underrepresented classes

---

## 💻 Features

- 🔍 Upload dermoscopic images to detect skin cancer types
- 📊 Real-time predictions with softmax confidence scores
- 🌐 Interactive, modern frontend (TailwindCSS)
- 🧾 Downloadable result PDFs
- 📜 Prediction history and trust-level rating system

---

## 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SkinAI.git
   cd SkinAI
