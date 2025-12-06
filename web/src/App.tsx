import { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=246d1604-90bc-4093-8ea8-483540673a5a';
const connection = new Connection(RPC_URL, 'confirmed');

// Phantom wallet types
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

type Tab = 'lookup' | 'send' | 'register';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Space Grotesk', -apple-system, sans-serif;
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
}

::selection {
  background: #fff;
  color: #000;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid #1a1a1a;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  background: none;
  border: none;
  color: #666;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
}

.nav-link:hover { color: #fff; }
.nav-link.active { color: #fff; }

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: clamp(48px, 12vw, 120px);
  font-weight: 700;
  letter-spacing: -4px;
  line-height: 0.9;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 18px;
  color: #666;
  font-weight: 400;
}

.content {
  width: 100%;
  max-width: 500px;
}

.input-wrap {
  position: relative;
  margin-bottom: 16px;
}

.input-main {
  width: 100%;
  padding: 20px 24px;
  padding-left: 50px;
  background: #111;
  border: 1px solid #222;
  border-radius: 12px;
  font-family: inherit;
  font-size: 18px;
  color: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-main:focus {
  border-color: #444;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.05);
}

.input-main::placeholder { color: #444; }

.input-prefix {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #666;
}

.input-status {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
}

.input-status.ok { color: #22c55e; }
.input-status.err { color: #ef4444; }
.input-status.load { color: #666; animation: spin 1s linear infinite; }

@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

.btn-main {
  width: 100%;
  padding: 20px;
  background: #fff;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-main:hover { transform: scale(1.02); }
.btn-main:active { transform: scale(0.98); }
.btn-main:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

.result-box {
  margin-top: 24px;
  padding: 32px;
  background: #111;
  border: 1px solid #222;
  border-radius: 16px;
  text-align: center;
}

.result-box.success { border-color: #22c55e; }
.result-box.error { border-color: #ef4444; }

.result-alias {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.result-label {
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.result-addr {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #888;
  background: #0a0a0a;
  padding: 16px;
  border-radius: 8px;
  word-break: break-all;
  margin-bottom: 20px;
}

.btn-copy {
  padding: 14px 32px;
  background: #222;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-copy:hover { background: #333; }

.tag {
  display: inline-block;
  padding: 10px 24px;
  background: #22c55e;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: #000;
}

.form-section { margin-bottom: 20px; }

.form-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hint {
  font-size: 13px;
  margin-top: 8px;
}

.hint.ok { color: #22c55e; }
.hint.err { color: #ef4444; }

.success-check {
  width: 64px;
  height: 64px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 24px;
}

.btn-ghost {
  padding: 14px 32px;
  background: transparent;
  border: 1px solid #333;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover { border-color: #fff; color: #fff; }

.footer {
  padding: 20px 40px;
  border-top: 1px solid #1a1a1a;
  text-align: center;
  font-size: 13px;
  color: #444;
}

@media (max-width: 600px) {
  .nav { padding: 16px 20px; }
  .nav-links { gap: 20px; }
  .title { letter-spacing: -2px; }
  .main { padding: 40px 16px; }
}
`;

export default function App() {
  const [tab, setTab] = useState<Tab>('lookup');
  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="nav">
          <div className="logo">soltag</div>
          <div className="nav-links">
            <button className={`nav-link ${tab === 'lookup' ? 'active' : ''}`} onClick={() => setTab('lookup')}>Lookup</button>
            <button className={`nav-link ${tab === 'send' ? 'active' : ''}`} onClick={() => setTab('send')}>Send</button>
            <button className={`nav-link ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
          </div>
        </nav>
        <main className="main">
          <div className="hero">
            <h1 className="title">soltag</h1>
            <p className="subtitle">Send to @names, not addresses</p>
          </div>
          <div className="content">
            {tab === 'lookup' && <LookupTab />}
            {tab === 'send' && <SendTab />}
            {tab === 'register' && <RegisterTab />}
          </div>
        </main>
        <footer className="footer">Free to register</footer>
      </div>
    </>
  );
}


interface WalletStats {
  balance: number;
  tokenCount: number;
  txCount: number;
}

function LookupTab() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<{alias:string;address:string}|null>(null);
  const [stats, setStats] = useState<WalletStats|null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async (address: string) => {
    setLoadingStats(true);
    try {
      const pubkey = new PublicKey(address);
      
      // Get SOL balance
      const balance = await connection.getBalance(pubkey);
      
      // Get token accounts count
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });
      
      // Get recent transaction signatures (limit 100)
      const sigs = await connection.getSignaturesForAddress(pubkey, { limit: 100 });
      
      setStats({
        balance: balance / LAMPORTS_PER_SOL,
        tokenCount: tokenAccounts.value.length,
        txCount: sigs.length
      });
    } catch (e) {
      console.error('Failed to fetch stats:', e);
      setStats({ balance: 0, tokenCount: 0, txCount: 0 });
    }
    setLoadingStats(false);
  };

  const search = async () => {
    if (q.length < 3) return;
    setLoading(true); setResult(null); setNotFound(false); setStats(null);
    try {
      const r = await fetch(`${API_URL}/resolve/${q}`);
      if (r.ok) {
        const data = await r.json();
        setResult(data);
        fetchStats(data.address);
      } else setNotFound(true);
    } catch { setNotFound(true); }
    setLoading(false);
  };

  return (
    <>
      <div className="input-wrap">
        <span className="input-prefix">@</span>
        <input className="input-main" value={q} onChange={e => setQ(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} 
          placeholder="Enter username" onKeyDown={e => e.key === 'Enter' && search()} />
      </div>
      <button className="btn-main" onClick={search} disabled={q.length < 3 || loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {result && (
        <div className="result-box success">
          <div className="result-alias">@{result.alias}</div>
          <div className="result-label">Linked wallet</div>
          <div className="result-addr">{result.address}</div>
          
          {/* Wallet Stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,margin:'20px 0',textAlign:'center'}}>
            <div style={{background:'#0a0a0a',padding:16,borderRadius:8}}>
              <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>
                {loadingStats ? '...' : stats ? stats.balance.toFixed(4) : '-'}
              </div>
              <div style={{fontSize:11,color:'#666',marginTop:4}}>SOL</div>
            </div>
            <div style={{background:'#0a0a0a',padding:16,borderRadius:8}}>
              <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>
                {loadingStats ? '...' : stats ? stats.tokenCount : '-'}
              </div>
              <div style={{fontSize:11,color:'#666',marginTop:4}}>TOKENS</div>
            </div>
            <div style={{background:'#0a0a0a',padding:16,borderRadius:8}}>
              <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>
                {loadingStats ? '...' : stats ? (stats.txCount >= 100 ? '100+' : stats.txCount) : '-'}
              </div>
              <div style={{fontSize:11,color:'#666',marginTop:4}}>TXS</div>
            </div>
          </div>
          
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <button className="btn-copy" onClick={() => navigator.clipboard.writeText(result.address)}>Copy address</button>
            <a href={`https://solscan.io/account/${result.address}`} target="_blank" rel="noreferrer" className="btn-ghost">Solscan</a>
          </div>
        </div>
      )}
      {notFound && q && (
        <div className="result-box">
          <div className="result-alias">@{q}</div>
          <div className="result-label">Not registered</div>
          <div className="tag">Available</div>
        </div>
      )}
    </>
  );
}

function SendTab() {
  const [a, setA] = useState('');
  const [amount, setAmount] = useState('');
  const [addr, setAddr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [wallet, setWallet] = useState<PublicKey|null>(null);
  const [sending, setSending] = useState(false);
  const [txSig, setTxSig] = useState<string|null>(null);

  // Check if Phantom is connected
  useEffect(() => {
    if (window.solana?.publicKey) setWallet(window.solana.publicKey);
  }, []);

  // Resolve alias
  useEffect(() => {
    if (a.length < 3) { setAddr(null); setNotFound(false); return; }
    const t = setTimeout(async () => {
      setLoading(true); setNotFound(false);
      try {
        const r = await fetch(`${API_URL}/resolve/${a}`);
        if (r.ok) setAddr((await r.json()).address); else { setAddr(null); setNotFound(true); }
      } catch { setNotFound(true); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [a]);

  const connectWallet = async () => {
    if (!window.solana) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    try {
      const { publicKey } = await window.solana.connect();
      setWallet(publicKey);
    } catch (e) { console.error(e); }
  };

  const sendSol = async () => {
    if (!wallet || !addr || !amount || !window.solana) return;
    setSending(true); setTxSig(null);
    try {
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet,
          toPubkey: new PublicKey(addr),
          lamports
        })
      );
      tx.feePayer = wallet;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const { signature } = await window.solana.signAndSendTransaction(tx);
      setTxSig(signature);
    } catch (e: any) {
      alert(e.message || 'Transaction failed');
    }
    setSending(false);
  };

  if (txSig) return (
    <div className="result-box success">
      <div className="success-check">✓</div>
      <div className="result-alias">{amount} SOL sent</div>
      <div className="result-label">to @{a}</div>
      <div className="result-addr">{txSig}</div>
      <div style={{display:'flex',gap:12,justifyContent:'center'}}>
        <a href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noreferrer" className="btn-copy">View on Solscan</a>
        <button className="btn-ghost" onClick={() => {setTxSig(null);setA('');setAmount('');}}>Send more</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="form-section">
        <label className="form-label">Recipient</label>
        <div className="input-wrap">
          <span className="input-prefix">@</span>
          <input className="input-main" value={a} onChange={e => setA(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} placeholder="username" />
          {loading && <span className="input-status load">◌</span>}
          {addr && <span className="input-status ok">✓</span>}
          {notFound && <span className="input-status err">✗</span>}
        </div>
        {addr && <div className="hint ok" style={{fontFamily:'monospace',fontSize:11}}>{addr.slice(0,16)}...{addr.slice(-8)}</div>}
        {notFound && <div className="hint err">Not registered</div>}
      </div>

      {addr && (
        <div className="form-section">
          <label className="form-label">Amount (SOL)</label>
          <div className="input-wrap">
            <input className="input-main" style={{paddingLeft:24}} type="number" step="0.001" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>
      )}

      {!wallet ? (
        <button className="btn-main" onClick={connectWallet}>
          {window.solana ? 'Connect Phantom' : 'Install Phantom'}
        </button>
      ) : (
        <button className="btn-main" disabled={!addr || !amount || parseFloat(amount) <= 0 || sending} onClick={sendSol}>
          {sending ? 'Confirming...' : addr && amount ? `Send ${amount} SOL to @${a}` : 'Enter recipient & amount'}
        </button>
      )}

      {wallet && (
        <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'#666'}}>
          Connected: {wallet.toBase58().slice(0,6)}...{wallet.toBase58().slice(-4)}
        </div>
      )}
    </>
  );
}

function RegisterTab() {
  const [alias, setAlias] = useState('');
  const [wallet, setWallet] = useState('');
  const [aliasOk, setAliasOk] = useState<boolean|null>(null);
  const [walletOk, setWalletOk] = useState<boolean|null>(null);
  const [balance, setBalance] = useState<number|null>(null);
  const [checking, setChecking] = useState({alias:false,wallet:false});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (alias.length < 3) { setAliasOk(null); return; }
    setChecking(c => ({...c, alias:true}));
    const t = setTimeout(async () => {
      try { setAliasOk((await (await fetch(`${API_URL}/check/${alias}`)).json()).available); }
      catch { setAliasOk(false); }
      setChecking(c => ({...c, alias:false}));
    }, 300);
    return () => clearTimeout(t);
  }, [alias]);

  useEffect(() => {
    if (wallet.length < 32) { setWalletOk(null); setBalance(null); return; }
    setChecking(c => ({...c, wallet:true}));
    const t = setTimeout(async () => {
      try {
        new PublicKey(wallet); // Just validate address format
        // No token check - anyone can register
        setBalance(0); setWalletOk(true);
      } catch { setWalletOk(false); setBalance(null); }
      setChecking(c => ({...c, wallet:false}));
    }, 500);
    return () => clearTimeout(t);
  }, [wallet]);

  if (done) return (
    <div className="result-box success">
      <div className="success-check">✓</div>
      <div className="result-alias">@{alias}</div>
      <div className="result-label">Successfully registered</div>
      <div style={{fontFamily:'monospace',fontSize:12,color:'#666',marginBottom:20}}>{wallet.slice(0,8)}...{wallet.slice(-8)}</div>
      <button className="btn-ghost" onClick={() => {setDone(false);setAlias('');setWallet('');}}>Register another</button>
    </div>
  );

  return (
    <>
      <div className="form-section">
        <label className="form-label">Handle</label>
        <div className="input-wrap">
          <span className="input-prefix">@</span>
          <input className="input-main" value={alias} onChange={e => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,15))} placeholder="yourname" />
          {checking.alias && <span className="input-status load">◌</span>}
          {!checking.alias && aliasOk === true && <span className="input-status ok">✓</span>}
          {!checking.alias && aliasOk === false && <span className="input-status err">✗</span>}
        </div>
        {aliasOk === false && <div className="hint err">Already taken</div>}
        {aliasOk === true && <div className="hint ok">Available</div>}
      </div>
      {aliasOk && (
        <div className="form-section">
          <label className="form-label">Wallet address</label>
          <div className="input-wrap">
            <input className="input-main" style={{paddingLeft:24,fontSize:14,fontFamily:'monospace'}} value={wallet} onChange={e => setWallet(e.target.value.trim())} placeholder="Paste your Solana address" />
            {checking.wallet && <span className="input-status load">◌</span>}
            {!checking.wallet && walletOk === true && <span className="input-status ok">✓</span>}
            {!checking.wallet && walletOk === false && <span className="input-status err">✗</span>}
          </div>
          {walletOk === false && balance !== null && <div className="hint err">Invalid address</div>}
          {walletOk === false && balance === null && <div className="hint err">Invalid address</div>}
          {walletOk && <div className="hint ok">Valid address</div>}
        </div>
      )}
      <button className="btn-main" disabled={!aliasOk || !walletOk || submitting}
        onClick={async () => {
          setSubmitting(true);
          try {
            const res = await fetch(`${API_URL}/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ alias, address: wallet })
            });
            if (res.ok) setDone(true);
            else alert('Registration failed: ' + ((await res.json()).error || 'Unknown error'));
          } catch { alert('Registration failed - check your connection'); }
          setSubmitting(false);
        }}>
        {submitting ? 'Registering...' : aliasOk && walletOk ? `Claim @${alias}` : 'Complete form above'}
      </button>
    </>
  );
}
