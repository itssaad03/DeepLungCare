# DeepLungCare: Automated Disease Detection and Reporting System

DeepLungCare is an AI-powered web application designed to assist in the detection and diagnosis of lung diseases, including pneumonia, tuberculosis, and lung cancer, using chest X-ray images. The system leverages a hybrid deep learning model and provides automated medical report generation through a user-friendly full-stack web interface.

## 🧠 Features

* ✅ Hybrid AI model using **EfficientNet-B5** and **DenseNet-121**
* ✅ Detects **Pneumonia**, **Tuberculosis**, and **Lung Cancer** from chest X-rays
* ✅ Automatically generates detailed medical reports
* ✅ Full-stack application with React frontend and Flask backend
* ✅ MongoDB for secure data storage
* ✅ REST API for smooth integration

---

## 🏗️ Project Structure

```
FYP/
│
├── app.py                   # Flask entry point
├── Frontend/                # React.js frontend interface
├── Backend/                 # Node.js/Flask backend and API routes
│   ├── python/              # Python model scripts
│   ├── middleware/          # Middleware for auth, etc.
│   ├── model/               # Trained model files
│   ├── routes/              # Express API endpoints
│   └── uploads/             # Uploaded X-ray images
```

---

## 🚀 Tech Stack

**Frontend:**

* React.js + Vite
* Tailwind CSS
* Axios

**Backend:**

* Flask (for AI inference)
* Node.js + Express.js (for API handling)
* MongoDB (via Mongoose)

**AI/ML:**

* Python (TensorFlow, Keras, OpenCV, NumPy)
* Hybrid CNN model (EfficientNet-B5 + DenseNet-121)

---

## 🖼️ Sample Workflow

1. Upload a chest X-ray.
2. AI model detects disease (if any).
3. Results are displayed with prediction confidence.
4. Auto-generated report (PDF) is available for download.

---
📁 Model File
The trained hybrid deep learning model (EfficientNet-B5 + DenseNet-121) is available for download here:

place this file in backend/python

👉 https://drive.google.com/file/d/1hw7_KTkguz-IMkfXBuzATI2j-GAD5RfD/view?usp=sharing
---

## 📦 Installation

### Prerequisites

* Python 3.8+
* Node.js + npm
* MongoDB

### Backend Setup

```bash
cd FYP/Backend
npm install
pip install -r requirements.txt
node server.js
```

### Frontend Setup

```bash
cd FYP/Frontend
npm install
npm run dev
```

---

## 📄 Report Generation

A downloadable PDF medical report is automatically generated based on the AI prediction. You can find samples in `Frontend/Medical_Report.pdf`.

---

## 🔒 Security

* Input validation on both frontend and backend
* Secure file uploads
* MongoDB authentication

---

## 📈 Performance

The hybrid model achieves high accuracy and reduced false positives by combining the feature extraction capabilities of EfficientNet and DenseNet.

---

## 📚 Research & References

* EfficientNet: [Tan & Le, 2019](https://arxiv.org/abs/1905.11946)
* DenseNet: [Huang et al., 2017](https://arxiv.org/abs/1608.06993)
* Chest X-ray Dataset: NIH & Kaggle Sources

---

## 👨‍💻 Authors

* Saad Atif
* Bahria University, BSCS 2025

---




