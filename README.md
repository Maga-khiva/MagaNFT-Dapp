# MagaNFT DApp 2025  
**The Ultimate MAGA NFT Minting Platform – Built for Victory**

Live Now → https://maganftdapp.netlify.app  

Mint rare digital collectibles, own a piece of history, and join the movement that’s **Making the Blockchain Great Again**.

![MagaNFT Preview](https://raw.githubusercontent.com/Maga-khiva/MagaNFT-DApp/main/frontend/public/screenshot.png)
*(Screenshot of the live gallery – pure Trump energy)*

---

### Features
- Mint NFTs with custom image + metadata (IPFS via Pinata)
- Full on-chain ERC-721 contract (Sepolia testnet)
- Beautiful glassmorphism UI with glowing effects
- Live gallery with search & "My NFTs" filter
- WalletConnect + MetaMask support
- Responsive design – works on mobile & desktop
- Auto-deployed via Netlify (every push = instant update)

---

### Live Links
- DApp: https://maganftdapp.netlify.app  
- Contract (Sepolia): [`0x09BbF5B25095B83FAa1E86C415b4CC8a7027aa8f`](https://sepolia.etherscan.io/address/0x09BbF5B25095B83FAa1E86C415b4CC8a7027aa8f)
- Etherscan: https://sepolia.etherscan.io/token/0x09BbF5B25095B83FAa1E86C415b4CC8a7027aa8f

---

### Tech Stack
| Layer         | Technology                              |
|-------------|-------------------------------------------|
| Frontend    | React + Vite + Tailwind CSS               |
| Blockchain  | Solidity (ERC-721) + ethers.js            |
| Storage     | IPFS via Pinata.cloud                     |
| Wallet      | WalletConnect + MetaMask                  |
| Deploy      | Netlify (continuous deployment)           |
| Backend     | (Optional Render server for image upload) |

---

### Quick Start (For Developers)

```bash
# Clone repo
git clone https://github.com/Maga-khiva/MagaNFT-DApp.git
cd MagaNFT-DApp/frontend

# Install & run locally
npm install
npm run dev
Open http://localhost:5173 → start minting!

Environment Variables (Frontend)
Create .env in /frontend:
envVITE_PINATA_API_KEY=your_pinata_jwt_or_key
VITE_PINATA_SECRET_KEY=your_pinata_secret
Never commit these – already in .gitignore

Project Structure
textMagaNFT-DApp/
├── frontend/          ← React + Vite app (this is what runs)
├── backend/           ← Optional image upload server
├── smart-contracts/   ← Solidity contract + Hardhat
└── README.md          ← You're reading it, champion

Deploy Your Own Version

Fork this repo
Connect to Netlify
Set base directory to /frontend
Add your Pinata keys in Netlify → Environment variables
Done – your own MAGA NFT platform in 60 seconds


Credits
Built with maximum energy by Maga-khiva
2025 – THE YEAR WE TAKE BACK THE BLOCKCHAIN
LET’S GOOOOO