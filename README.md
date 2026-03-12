# 📈 IIIFL: The Ultimate Trading Arena

Welcome to **IIIFL**, a high-octane, full-stack trading ecosystem designed for the modern investor. Whether you're tracking the next big IPO or managing a diverse portfolio, IIIFL provides the tools, speed, and security you need to dominate the markets.

Built with **Node.js**, **React (TypeScript)**, and **PostgreSQL**, this platform is as robust as a bank vault and as fast as a high-frequency trading desk.

---

## ✨ Features

- **🚀 Real-Time Analytics**: Powered by `yahoo-finance2` and `Lightweight Charts` for lightning-fast market insights.
- **🛡️ Fort Knox Security**: 
  - **2FA**: Two-factor authentication via `speakeasy` and `qrcode`.
  - **JWT**: Secure session management.
  - **Helmet**: Hardened HTTP headers for maximum protection.
- **📱 Mobile-First Dashboard**: A sleek, responsive dashboard built with **React** and **Tailwind CSS**, ready for Android via **Capacitor**.
- **💸 Seamless Payments**: Integrated with **Razorpay** for smooth fund management.
- **📊 Advanced Charting**: Beautiful, interactive data visualizations using `ApexCharts` and `Recharts`.
- **🐳 Dockerized**: One command to rule them all. Spin up the entire stack with Docker Compose.

---

## 🛠️ Tech Stack

### **Backend (The Engine Room)**
- **Runtime**: [Node.js](https://nodejs.org/) / [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Security**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [speakeasy](https://github.com/speakeasyjs/speakeasy)
- **Data**: [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)
- **Payments**: [Razorpay](https://razorpay.com/)

### **Frontend (The Command Center)**
- **Framework**: [React](https://reactjs.org/) (TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Mobile**: [Capacitor](https://capacitorjs.com/)
- **Charts**: [ApexCharts](https://apexcharts.com/), [Lightweight Charts](https://www.tradingview.com/lightweight-charts/)

---

## 🚀 Quick Start (Docker)

The fastest way to get IIIFL running is with Docker:

1. **Clone the Arena**:
   ```bash
   git clone https://github.com/Fellarity/iiifl-trading-arena.git
   cd iiifl-trading-arena/iiifl-website
   ```

2. **Launch the Stack**:
   ```bash
   docker-compose up -d
   ```

3. **Access the Arena**:
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:3000`

---

## 💻 Local Development

### **Backend Setup**
```bash
cd iiifl-website/backend
npm install
npm run dev
```

### **Dashboard Setup**
```bash
cd iiifl-website/dashboard
npm install
npm run dev
```

---

## 📂 Project Structure

- `iiifl-website/`: The core project directory.
  - `backend/`: Express API with all the trading logic.
  - `dashboard/`: React + TypeScript dashboard.
  - `iiifl-website/`: The main marketing landing page.
  - `docker-compose.yml`: Infrastructure configuration.

---

## 🤝 Contributing

Want to help make IIIFL even better? Fork the repo, add your features, and send a PR! 

**Happy Trading!** 🚀📈
