import React, { useState } from 'react';   // <--- This "React" word was missing!
import { ethers } from 'ethers';
import axios from 'axios';
import { ShieldCheck, UploadCloud, Lock, User, Briefcase } from 'lucide-react';

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

// 1. LOGIN PORTAL (The Entry Point)
const LoginPortal = ({ onLogin }) => {
  const [officerPass, setOfficerPass] = useState("");

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans text-white">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          MindForge
        </h1>
        <p className="text-gray-400 text-lg">Secure Document Verification System</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* CITIZEN CARD */}
        <div className="bg-slate-800 p-8 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition border border-slate-700 group cursor-pointer"
             onClick={() => onLogin('citizen')}>
          <div className="bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition">
            <User className="text-purple-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Citizen Portal</h2>
          <p className="text-gray-400">Upload documents securely to the blockchain vault.</p>
          <button className="mt-6 w-full py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500 transition">
            Access as Citizen
          </button>
        </div>

        {/* OFFICER CARD */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="text-blue-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Officer Portal</h2>
          <p className="text-gray-400 mb-4">Verify documents and audit records.</p>
          
          {/* Security Check */}
          <div className="space-y-3">
            <input 
              type="password" 
              placeholder="Enter Officer PIN" 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              onChange={(e) => setOfficerPass(e.target.value)}
            />
            <button 
              onClick={() => {
                if(officerPass === "admin123") onLogin('officer');
                else alert("⛔ ACCESS DENIED: Invalid Officer Credentials");
              }}
              className="w-full py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500 transition"
            >
              Verify Identity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. CITIZEN DASHBOARD (Corrected)
const CitizenDashboard = ({ goBack }) => {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");

  // Step 1: Upload to AWS
  const handleUpload = async () => {
    if (!file) return;
    setStatus("⏳ Uploading to AWS S3...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      setHash(res.data.hash);
      setStatus("✅ Uploaded to AWS! File Hash generated.");
    } catch (err) {
      setStatus("❌ AWS Upload Failed. Is Backend running?");
      console.error(err);
    }
  };

  // Step 2: Lock on Blockchain
  const saveToBlockchain = async () => {
    setStatus("🦊 Opening MetaMask... Please Confirm.");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      // Send transaction
      const tx = await contract.addDocument(hash);
      setStatus("⛓️ Transaction Sent! Waiting for confirmation...");
      
      // Wait for it to be mined
      await tx.wait();
      
      // SUCCESS MESSAGE (This was the problem area before)
      setStatus(`🎉 SUCCESS! Document Verified on Blockchain.\nHash: ${hash.slice(0, 15)}...`);
      
    } catch (err) {
      setStatus("❌ Blockchain Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-10">
      <button onClick={goBack} className="mb-6 text-purple-600 font-bold hover:underline">← Logout</button>
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <UploadCloud className="w-10 h-10 text-purple-600" />
          <h1 className="text-3xl font-bold">Secure Document Upload</h1>
        </div>

        <div className="border-2 border-dashed border-purple-200 rounded-xl p-10 text-center bg-purple-50 mb-6">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-slate-500 file:bg-purple-600 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2" />
        </div>

        <button onClick={handleUpload} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition">
          1. Upload to Cloud Vault
        </button>

        {hash && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <p className="font-mono text-xs text-green-800 break-all mb-4">Generated Hash: {hash}</p>
            <button onClick={saveToBlockchain} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" /> 2. Lock on Blockchain
            </button>
          </div>
        )}
        
        {/* Only show the status text, not the raw object */}
        {status && (
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg font-semibold text-center whitespace-pre-wrap">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};
// 3. OFFICER DASHBOARD (Upgraded: Auto-Hash Verification)
const OfficerDashboard = ({ goBack }) => {
  const [file, setFile] = useState(null); // CHANGED: Now storing a file, not text
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const verifyDoc = async () => {
    if(!file) return;
    setStatus("⏳ Processing File & Generating Hash...");
    setResult(null); // Reset previous results

    try {
      // Step 1: Send file to Backend to calculate the EXACT same hash as the Citizen
      const formData = new FormData();
      formData.append("file", file);

      // We use the same route. It will upload to S3 (which is fine), 
      // but most importantly, it returns the correct SHA-256 hash.
      const res = await axios.post("http://localhost:5000/upload", formData);
      const autoHash = res.data.hash;

      setStatus("🔍 Hash Generated! Checking Blockchain...");

      // Step 2: Verify that Hash on Blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const data = await contract.verifyDocument(autoHash);
      
      // Step 3: Show Results
      setResult({
        isValid: data[0], // true or false
        timestamp: new Date(Number(data[1]) * 1000).toLocaleString(),
        uploader: data[2]
      });
      setStatus(""); 

    } catch (err) {
      console.error(err);
      setStatus("");
      setResult({ isValid: false }); // Assume invalid if anything fails
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-10">
      <button onClick={goBack} className="mb-6 text-blue-600 font-bold hover:underline">← Logout</button>
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-xl border-t-4 border-blue-600">
        <div className="flex items-center gap-4 mb-8">
          <ShieldCheck className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold">Officer Verification Console</h1>
        </div>

        {/* CHANGED: File Input instead of Text Input */}
        <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50 mb-6">
            <p className="text-blue-800 font-semibold mb-2">Upload Suspect Document</p>
            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])} 
                className="w-full text-slate-500 file:bg-blue-600 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2 cursor-pointer" 
            />
        </div>
        
        <button onClick={verifyDoc} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg">
          Verify Integrity
        </button>

        {status && <p className="mt-4 text-center text-blue-600 font-medium animate-pulse">{status}</p>}

        {result && (
          <div className={`mt-8 p-6 rounded-xl text-center border-2 ${result.isValid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {result.isValid ? (
              <>
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h2 className="text-3xl font-bold mb-2">VERIFIED AUTHENTIC</h2>
                <div className="text-sm opacity-80 mt-4 space-y-1">
                    <p><strong>Timestamp:</strong> {result.timestamp}</p>
                    <p><strong>Signer:</strong> {result.uploader}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-3xl font-bold">FAKE DOCUMENT</h2>
                <p className="mt-2">This file hash does not exist on the blockchain.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
// --- MAIN APP COMPONENT ---
function App() {
  const [view, setView] = useState('login'); // 'login' | 'citizen' | 'officer'

  return (
    <>
      {view === 'login' && <LoginPortal onLogin={setView} />}
      {view === 'citizen' && <CitizenDashboard goBack={() => setView('login')} />}
      {view === 'officer' && <OfficerDashboard goBack={() => setView('login')} />}
    </>
  );
}

export default App;