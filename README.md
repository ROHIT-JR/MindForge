MindForge: Decentralized Document Verification System
Fighting deepfakes and document fraud with a hybrid cloud-blockchain architecture. Verify credentials instantly. Tamper-proof. Privacy-first.

---

##  What Problem Does MindForge Solve?

Imagine a world where:
- **Students** can prove their degree is genuine without fear of forgery
- **Land owners** can verify property deeds instantly
- **Law enforcement** can authenticate CCTV footage in seconds
- **Attackers can't** forge documents (blockchain prevents it)
- **Users can** request deletion (GDPR-compliant, unlike pure blockchain)

Today's solutions fail because they're either:
-  **Too expensive** (storing files on blockchain = massive gas fees)
-  **Too centralized** (one hack = everything is compromised)
-  **Too slow** (manual verification takes days)
-  **Privacy nightmares** (personal data exposed on public blockchain)

**MindForge fixes all of this.**

---

##  The "Golden Mean" Idea
Instead of storing entire documents on the blockchain (expensive) or in a centralized database (insecure), MindForge does something clever:

```
Your Document
    ↓
[Encrypted & Stored in AWS S3] ← Fast, Scalable, Cheap
    ↓
[Only SHA-256 Hash Locked on Ethereum] ← Immutable, Trustless, Secure
    ↓
Verification: Hash matches? = Document is authentic 
            Hash doesn't match? = Document is fake 
```

**Result:** You get the best of both worlds—blockchain security with cloud-scale efficiency.

---

# Key Features

###  Hybrid Decoupled Architecture
- Store files on AWS S3 (encrypted, scalable, GDPR-friendly)
- Lock only the hash on Ethereum (immutable proof of authenticity)
- Verify instantly without paying high gas fees
- Works for 1KB PDFs and 10GB videos with the same cost

###  Forensic Officer Portal
- Upload a suspect document
- Auto-hash engine generates the fingerprint instantly
- Compare against blockchain in seconds
- Instant verdict: **AUTHENTIC ** or **FAKE **
- No manual checking. No guesswork.

###  Privacy & GDPR Compliance
- Personal data stays off the blockchain
- Only mathematical proofs of existence are recorded
- Users can request deletion (files removed from AWS)
- Integrity record persists on blockchain (you can't rewrite history)
- **Best of both:** Trust without tracking

---

##  Tech Stack
| Component | Technology | Why It's Perfect |
|-----------|-----------|------------------|
| **Frontend** | React.js + Vite | Fast, responsive, modern UI |
| **Backend** | Node.js + Express | Handles file streams, AWS integration |
| **Cloud Storage** | AWS S3 (Mumbai region) | Encrypted, scalable, GDPR-compliant |
| **Blockchain** | Ethereum (Sepolia testnet) | Immutable ledger, decentralized trust |
| **Smart Contracts** | Solidity | Automated hash verification logic |
| **Web3 Auth** | MetaMask | User-owned keys, no centralized accounts |

---

##  Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MetaMask browser extension
- AWS account (free tier is fine)
- Git

### Step 1: Clone & Setup Backend

```bash
git clone https://github.com/ROHIT-JR/MindForge.git
cd MindForge/backend
npm install
```

Create a `.env` file with your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
BUCKET_NAME=mindforge-storage-2026
REGION=ap-south-1
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_wallet_private_key
```

Start the backend:

```bash
node server.js
```

You should see: ` MindForge backend running on http://localhost:5000`

### Step 2: Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open your browser to **http://localhost:5173**

---

##  How to Use

### For Citizens (Uploading Documents)

1. **Log in** to the citizen portal
2. **Select a document** (PDF, image, video—any format)
3. **Click "Upload to Cloud Vault"**
   - Your file gets encrypted and stored in AWS S3
   - You get back a file ID
4. **Click "Lock on Blockchain"**
   - MetaMask pop-up appears
   - Confirm the transaction (costs ~0.01 ETH on testnet)
   - Your document's hash is now immutable on Ethereum
5. **Success!** 
   - Share the document ID with anyone
   - They can verify it's authentic anytime

### For Officers (Verifying Documents)

1. **Log in** to the officer portal (default PIN: `admin123`)
2. **Upload a suspect document** received from someone
3. **Click "Verify Integrity"**
   - System auto-generates the hash
   - Compares it against the blockchain
4. **Get instant results:**
   -  **VERIFIED AUTHENTIC** — File is 100% original
   -  **FAKE DOCUMENT** — File has been tampered with (even 1 pixel changed)

---

##  Architecture Overview

```
┌─────────────────────────────────────────┐
│         MindForge Frontend              │
│     (React + Vite + MetaMask)           │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         MindForge Backend               │
│    (Node.js + Express + Web3.js)        │
└──┬──────────────────────────────────┬───┘
   │                                  │
   ▼                                  ▼
┌─────────────────┐        ┌──────────────────┐
│   AWS S3 Vault  │        │  Ethereum Chain  │
│ (Encrypted      │        │ (Hash Records)   │
│  Files)         │        │                  │
└─────────────────┘        └──────────────────┘
```

---

##  Workflow Example

**Scenario:** Raj wants to prove his degree is real.

1. Raj uploads his degree certificate (PDF)
2. Backend encrypts it → Stores in AWS S3 → Returns file ID
3. Raj clicks "Lock on Blockchain"
4. Smart contract receives the SHA-256 hash
5. Hash is permanently recorded on Ethereum
6. Raj shares his document ID with an employer
7. Employer uploads the same document
8. System auto-verifies: Hash matches = Certificate is authentic 

---

##  Future Roadmap

### Phase 2: Zero-Knowledge Proofs
Verify age, qualifications, or citizenship **without revealing the actual details**. Only the proof of truth.

### Phase 3: IPFS Integration
Option for fully decentralized storage (no AWS needed) for maximum censorship resistance.

### Phase 4: NFC Mobile App
Police officers can tap a document with their phone to instantly verify authenticity in the field.

### Phase 5: Cross-Chain Support
Expand beyond Ethereum to Polygon, Arbitrum for lower fees and faster verification.

---

##  Contributing

We love contributions! Whether it's:
-  Bug fixes
-  New features
-  Documentation improvements
-  UI/UX enhancements

**How to contribute:**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request with a clear description

---

##  Troubleshooting

### MetaMask doesn't pop up?
- Make sure you're on Sepolia testnet
- Check that MetaMask is connected to localhost:5173

### AWS upload fails?
- Verify your AWS credentials in `.env`
- Check that your bucket exists and is accessible
- Ensure the region is set correctly (ap-south-1 for Mumbai)

### Hash verification shows "Mismatch"?
- Even a 1-pixel change in the file will cause a mismatch
- This is intentional—it catches deepfakes and forgeries
- If you uploaded the original document, it should match

---

##  License

MIT License — See [LICENSE](./LICENSE) file for details.
This project is open-source and free to use, modify, and distribute.

---

##  Meet the Team

**MINDForge** was built with , by students passionate about cybersecurity, blockchain, and fighting fraud.
**Maintainer:** TEAM MINDForge 

---

##  Support & Contact

-  **Issues & Bugs:** Open a GitHub issue
-  **Questions:** Check out the [Discussions](https://github.com/ROHIT-JR/MindForge/discussions) tab
-  **Email:** Your contact here

---

##  Show Your Support
If MindForge helped you or you find it useful, please consider:
-  **Starring** the repository
-  **Sharing** with friends and colleagues
-  **Giving feedback** in discussions
-  **Reporting bugs** to help us improve

**Together, we're fighting deepfakes. One hash at a time.** 

---

##  Learn More

- [What is Blockchain?](https://en.wikipedia.org/wiki/Blockchain)
- [Understanding Smart Contracts](https://ethereum.org/en/developers/docs/smart-contracts/)
- [How SHA-256 Works](https://en.wikipedia.org/wiki/SHA-2)
- [GDPR Compliance Explained](https://gdpr-info.eu/)

---

**Last updated:** February 2026  
**Status:** Active Development 
