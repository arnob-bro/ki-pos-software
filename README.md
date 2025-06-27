# 💼 KI POS System (Electron + React)

A lightweight, offline-first **Point of Sale (POS)** system built with **Electron**, **React**, and **SQLite**. Designed to run on low-spec hardware (as low as dual-core CPU, 1GB RAM).

---

## 🛠️ Tech Stack

| Layer       | Technology       |
|-------------|------------------|
| UI          | React + Vite     |
| Desktop App | Electron         |
| Database    | better-sqlite3   |
| Backend     | Node.js (IPC)    |
| Package Manager | npm          |

---

## ✅ System Requirements

- **Node.js**: `v18.18.2` (use [NVM](https://github.com/coreybutler/nvm-windows) to manage)
- **npm**: Comes with Node
- **RAM**: 1 GB minimum
- **OS**: Windows/Linux (64-bit recommended)
- **Git** (for cloning repo)

---

## 📦 Dependencies

### Root

- `concurrently` – Run backend and frontend together
- `nodemon` – Auto-reload backend

### Backend

- `electron@28.3.3` – Desktop shell
- `electron-rebuild` – Native module rebuilding
- `better-sqlite3` – High performance SQLite3 binding

### Renderer (Frontend)

- `react`, `react-dom` – UI library
- `vite` – Build tool
- `@vitejs/plugin-react` – Vite plugin for React

---

## ⚙️ Setup Instructions

> 🔁 This assumes you are starting with a clean cloned repo, and have Node.js `v18.18.2` installed via NVM.

### 1. Clone the Repository

```bash
git clone https://github.com/arnob_bro/ki-pos-software.git
cd YOUR_REPO
```
### 2. Install Dependencies

```bash
nvm install 18.18.2
nvm use
npm install
npm --prefix backend install
npm --prefix renderer install
```

### 3. Rebuild Backend Module

```bash
cd backend
npx electron-rebuild --module-dir . --electron-version 28.3.3
```

### 4. Run The App

```bash
npm run dev
```



