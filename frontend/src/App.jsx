import React, { useState } from 'react';   // <--- This "React" word was missing!
import { ethers } from 'ethers';
import axios from 'axios';
import './App.css';
import { ShieldCheck, UploadCloud, Lock, Search, FileCheck, CheckCircle, AlertTriangle, Menu, X, Globe, Cpu } from 'lucide-react';

// --- CONFIGURATION --- // Make sure to install lucide-react

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = "0x1477EE05dceBdb88Fbc49d6b0C2c5F5De7051ea3"; // Paste from Notepad
const ABI = [ 
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			}
		],
		"name": "addDocument",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "hash",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			}
		],
		"name": "DocumentAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "documents",
		"outputs": [
			{
				"internalType": "string",
				"name": "hash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			}
		],
		"name": "verifyDocument",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// --- COMPONENTS ---

// 1. NAVIGATION BAR (The Professional Header)
const Navbar = ({ setView }) => (
  <nav className="fixed top-0 left-0 right-0 h-20 glass-panel z-50 flex items-center justify-between px-8">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
        <ShieldCheck className="w-6 h-6 text-white" />
      </div>
      <span className="text-xl font-bold tracking-wider">MINDFORGE <span className="text-xs text-blue-400 font-normal">SECURE</span></span>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-400 font-mono">SYSTEM ONLINE</span>
      </div>
    </div>
  </nav>
);

// 2. PUBLIC VERIFICATION PORTAL
const PublicVerification = ({ goBack }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const verifyDoc = async () => {
    if(!file) return;
    setStatus("⏳ Running Forensic Analysis...");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:5000/upload", formData);
      const autoHash = res.data.hash;

      setStatus("🔍 Querying Immutable Ledger...");

      if (!window.ethereum) return alert("Please install MetaMask!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const data = await contract.verifyDocument(autoHash);
      
      setResult({
        isValid: data[0],
        timestamp: new Date(Number(data[1]) * 1000).toLocaleString(),
        uploader: data[2]
      });
      setStatus(""); 

    } catch (err) {
      console.error(err);
      setStatus("");
      setResult({ isValid: false });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center">
      <div className="glass-panel max-w-2xl w-full p-10 rounded-3xl animate-fade-in relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <button onClick={goBack} className="mb-6 text-slate-400 hover:text-white transition flex items-center gap-2">← Back to Hub</button>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Verify Authenticity</h1>
          <p className="text-slate-400">Upload any document to check its blockchain signature.</p>
        </div>

        <div className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl p-12 text-center bg-slate-800/30 transition-all duration-300 group cursor-pointer relative">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <Search className="w-12 h-12 text-slate-500 group-hover:text-blue-400 mx-auto mb-4 transition-colors" />
            <p className="text-slate-300 font-medium">Click to Upload Document</p>
            <p className="text-slate-500 text-sm mt-2">{file ? file.name : "PDF, JPG, PNG supported"}</p>
        </div>
        
        <button onClick={verifyDoc} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02]">
          Verify Integrity
        </button>

        {status && <div className="mt-6 flex justify-center items-center gap-3 text-blue-400 animate-pulse"><Cpu className="w-5 h-5" /> {status}</div>}

        {result && (
          <div className={`mt-8 p-6 rounded-xl border ${result.isValid ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'} animate-fade-in`}>
            {result.isValid ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold text-white mb-2">VERIFIED AUTHENTIC</h2>
                <div className="text-sm text-green-300 font-mono mt-2 bg-green-900/30 py-2 px-4 rounded inline-block">
                    Minted: {result.timestamp}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <h2 className="text-2xl font-bold text-white">DOCUMENT TAMPERED</h2>
                <p className="text-red-300 mt-2">Hash mismatch. This file is invalid.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. OFFICER UPLOAD PORTAL
const OfficerUpload = ({ goBack }) => {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setStatus("⏳ Encrypting & Uploading to AWS Vault...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:5000/upload", formData);
      setHash(res.data.hash);
      setStatus("✅ Cloud Upload Complete. Ready for Blockchain Lock.");
    } catch (err) { setStatus("❌ Upload Failed."); }
  };

 const saveToBlockchain = async () => {
    setStatus("🦊 Requesting Wallet Signature...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      const tx = await contract.addDocument(hash);
      setStatus("⛓️ Mining Transaction...");
      await tx.wait();
      
      setStatus(`🎉 SUCCESS! Certificate Issued on Blockchain.`);
      
    } catch (err) {
      // --- NEW ERROR HANDLING CODE START ---
      console.error(err); // Print full error to console just in case
      
      // Check if the error message contains "Document already exists"
      if (JSON.stringify(err).includes("Document already exists")) {
        // 1. Show Pop-up
        alert("⚠️ WARNING: This document is ALREADY registered on the Blockchain!\n\nYou cannot register the same file twice. Click OK to start over.");
        
        // 2. Reload Page when they click OK
        window.location.reload(); 
        return;
      }
      // --- NEW ERROR HANDLING CODE END ---

      setStatus("❌ Error: " + (err.reason || err.message));
    }
  };
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center">
      <div className="glass-panel max-w-2xl w-full p-10 rounded-3xl animate-fade-in relative border-t-4 border-purple-500">
        
        <div className="flex justify-between items-center mb-8">
           <button onClick={goBack} className="text-slate-400 hover:text-white transition">← Logout</button>
           <div className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">OFFICIAL MODE</div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
            <UploadCloud className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Issue Credential</h1>
            <p className="text-slate-400">Upload to secure vault & mint NFT proof.</p>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer" />
        </div>

        <button onClick={handleUpload} className="w-full mb-4 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
          1. Upload to Cloud
        </button>

        {hash && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-fade-in">
             <p className="text-xs font-mono text-green-400 mb-4 break-all">Hash: {hash}</p>
             <button onClick={saveToBlockchain} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition flex items-center justify-center gap-2">
               <Lock className="w-5 h-5" /> 2. Sign & Lock on Chain
             </button>
          </div>
        )}
        
        {status && <p className="mt-4 text-center text-purple-300 text-sm font-mono">{status}</p>}
      </div>
    </div>
  );
};

// 4. MAIN LANDING PAGE
function App() {
  const [view, setView] = useState('home');
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "admin123") setView('officer-upload');
    else alert("⛔ ACCESS DENIED");
  };

  return (
    <>
      <Navbar setView={setView} />
      
      {view === 'home' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold mb-6">
              🚀 The Future of Document Verification
            </div>
            <h1 className="text-6xl font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 text-glow">
              Immutable Trust for the <br/><span className="text-blue-500">Digital Age</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10">
              Securely issue and verify credentials using a Hybrid Blockchain + Cloud Architecture. 
              Prevents fraud. Ensures privacy.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl animate-fade-in">
            
            {/* Card 1: Public */}
            <div className="glass-panel p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-2 cursor-pointer" onClick={() => setView('public-verify')}>
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                <Globe className="w-8 h-8 text-blue-400 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Public Verification</h2>
              <p className="text-slate-400 mb-6">Instantly verify any document authenticity using its digital fingerprint.</p>
              <div className="text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">Start Verification →</div>
            </div>

            {/* Card 2: Officer */}
            <div className="glass-panel p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-2 cursor-pointer" onClick={() => setView('officer-login')}>
               <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                <ShieldCheck className="w-8 h-8 text-purple-400 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Officer Portal</h2>
              <p className="text-slate-400 mb-6">Restricted access for issuing new tamper-proof credentials to the ledger.</p>
              <div className="text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">Official Login →</div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {view === 'officer-login' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl border-t-4 border-purple-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Security Clearance</h2>
                <button onClick={() => setView('home')}><X className="text-slate-400 hover:text-white"/></button>
            </div>
            <p className="text-slate-400 mb-6 text-sm">Please enter your specialized officer PIN to access the issuance ledger.</p>
            <input 
              type="password" 
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-center text-2xl tracking-[0.5em] text-white focus:border-purple-500 focus:outline-none transition-colors mb-6"
              placeholder="••••••"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-purple-500/20">
              Authenticate
            </button>
          </div>
        </div>
      )}

      {view === 'public-verify' && <PublicVerification goBack={() => setView('home')} />}
      {view === 'officer-upload' && <OfficerUpload goBack={() => { setView('home'); setPassword(""); }} />}
    </>
  );
}

export default App;