import { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';

const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=246d1604-90bc-4093-8ea8-483540673a5a';
const connection = new Connection(RPC_URL, 'confirmed');

// Supabase client
const supabase = createClient(
  'https://mvglowfvayvpqsfbortv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12Z2xvd2Z2YXl2cHFzZmJvcnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5ODEyNTgsImV4cCI6MjA4MDU1NzI1OH0.AMt0qkySg8amOyrBbypFZnrRaEPbIrpmMYGGMxksPks'
);

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

// Check if URL is a profile page like /@username
function getProfileFromURL(): string | null {
  const path = window.location.pathname;
  if (path.startsWith('/@')) {
    return path.slice(2).toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
  return null;
}

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
  text-decoration: none;
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
  text-decoration: none;
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
  const [profileUser, setProfileUser] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfileFromURL();
    if (profile) setProfileUser(profile);
  }, []);

  // Profile page view
  if (profileUser) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <nav className="nav">
            <a href="/" className="logo" style={{textDecoration:'none'}}>soltag</a>
            <div className="nav-links">
              <a href="/" className="nav-link">Home</a>
              <a href="https://x.com/SolTagxyz" target="_blank" rel="noreferrer" className="nav-link">𝕏</a>
            </div>
          </nav>
          <main className="main">
            <div className="content">
              <ProfilePage username={profileUser} />
            </div>
          </main>
          <footer className="footer">
            <div style={{marginBottom:12}}>
              <span style={{color:'#666',fontSize:11,textTransform:'uppercase',letterSpacing:1}}>CA: </span>
              <span style={{fontFamily:'monospace',fontSize:12,color:'#888',cursor:'pointer'}} onClick={() => {navigator.clipboard.writeText('PASTE_YOUR_CA_HERE');}} title="Click to copy">PASTE_YOUR_CA_HERE</span>
            </div>
            Free to register · <a href="https://x.com/SolTagxyz" target="_blank" rel="noreferrer" style={{color:'#666',textDecoration:'none'}}>@SolTagxyz</a>
          </footer>
        </div>
      </>
    );
  }

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
            <a href="https://x.com/SolTagxyz" target="_blank" rel="noreferrer" className="nav-link">𝕏</a>
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
        <footer className="footer">
          <div style={{marginBottom:12}}>
            <span style={{color:'#666',fontSize:11,textTransform:'uppercase',letterSpacing:1}}>CA: </span>
            <span 
              style={{fontFamily:'monospace',fontSize:12,color:'#888',cursor:'pointer'}} 
              onClick={() => {navigator.clipboard.writeText('PASTE_YOUR_CA_HERE');}}
              title="Click to copy"
            >
              PASTE_YOUR_CA_HERE
            </span>
          </div>
          Free to register · <a href="https://x.com/SolTagxyz" target="_blank" rel="noreferrer" style={{color:'#666',textDecoration:'none'}}>@SolTagxyz</a>
        </footer>
      </div>
    </>
  );
}

interface WalletStats {
  balance: number;
  tokenCount: number;
  txCount: number;
}

// Profile page component
function ProfilePage({ username }: { username: string }) {
  const [data, setData] = useState<{alias:string;address:string}|null>(null);
  const [stats, setStats] = useState<WalletStats|null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await resolveAlias(username);
      if (result) {
        setData(result);
        // Fetch stats
        try {
          const pubkey = new PublicKey(result.address);
          const balance = await connection.getBalance(pubkey);
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
          });
          const sigs = await connection.getSignaturesForAddress(pubkey, { limit: 100 });
          setStats({
            balance: balance / LAMPORTS_PER_SOL,
            tokenCount: tokenAccounts.value.length,
            txCount: sigs.length
          });
        } catch (e) {
          setStats({ balance: 0, tokenCount: 0, txCount: 0 });
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [username]);

  if (loading) return (
    <div style={{textAlign:'center',padding:60}}>
      <div style={{fontSize:24,color:'#666'}}>Loading...</div>
    </div>
  );

  if (notFound) return (
    <div className="result-box">
      <div className="result-alias">@{username}</div>
      <div className="result-label">Not registered</div>
      <div className="tag">Available</div>
      <a href="/" className="btn-ghost" style={{display:'inline-block',marginTop:20}}>Register this name</a>
    </div>
  );

  return (
    <div style={{textAlign:'center'}}>
      <div style={{fontSize:64,fontWeight:700,marginBottom:8}}>@{data?.alias}</div>
      <div style={{fontFamily:'monospace',fontSize:13,color:'#666',background:'#111',padding:16,borderRadius:12,marginBottom:24,wordBreak:'break-all'}}>
        {data?.address}
      </div>
      
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:24}}>
        <div style={{background:'#111',padding:20,borderRadius:12}}>
          <div style={{fontSize:28,fontWeight:700}}>{stats ? stats.balance.toFixed(4) : '...'}</div>
          <div style={{fontSize:12,color:'#666',marginTop:4}}>SOL</div>
        </div>
        <div style={{background:'#111',padding:20,borderRadius:12}}>
          <div style={{fontSize:28,fontWeight:700}}>{stats ? stats.tokenCount : '...'}</div>
          <div style={{fontSize:12,color:'#666',marginTop:4}}>TOKENS</div>
        </div>
        <div style={{background:'#111',padding:20,borderRadius:12}}>
          <div style={{fontSize:28,fontWeight:700}}>{stats ? (stats.txCount >= 100 ? '100+' : stats.txCount) : '...'}</div>
          <div style={{fontSize:12,color:'#666',marginTop:4}}>TXS</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
        <button className="btn-main" style={{flex:'1',maxWidth:200}} onClick={() => {navigator.clipboard.writeText(data?.address || '');setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
          {copied ? '✓ Copied!' : 'Copy address'}
        </button>
        <a href={`https://solscan.io/account/${data?.address}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{flex:'1',maxWidth:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
          View on Solscan
        </a>
      </div>

      <div style={{marginTop:32,padding:20,background:'#111',borderRadius:12}}>
        <div style={{fontSize:12,color:'#666',marginBottom:12}}>Share this profile</div>
        <div style={{fontFamily:'monospace',fontSize:14,color:'#888'}}>soltag.xyz/@{data?.alias}</div>
      </div>
    </div>
  );
}

// Supabase helper functions
async function resolveAlias(alias: string) {
  const { data, error } = await supabase
    .from('aliases')
    .select('*')
    .eq('alias', alias.toLowerCase())
    .single();
  if (error || !data) return null;
  return { alias: data.alias, address: data.address };
}

async function checkAlias(alias: string) {
  const { data } = await supabase
    .from('aliases')
    .select('alias')
    .eq('alias', alias.toLowerCase())
    .single();
  return !data; // available if no data
}

async function registerAlias(alias: string, address: string) {
  const { error } = await supabase
    .from('aliases')
    .insert({ alias: alias.toLowerCase(), address });
  return !error;
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
      const balance = await connection.getBalance(pubkey);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });
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
    const data = await resolveAlias(q);
    if (data) {
      setResult(data);
      fetchStats(data.address);
    } else {
      setNotFound(true);
    }
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
  const [addr, setAddr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<'select'|'phantom'|'manual'|null>(null);
  const [wallet, setWallet] = useState<PublicKey|null>(null);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [txSig, setTxSig] = useState<string|null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (a.length < 3) { setAddr(null); setNotFound(false); setMode(null); return; }
    const t = setTimeout(async () => {
      setLoading(true); setNotFound(false);
      const data = await resolveAlias(a);
      if (data) setAddr(data.address);
      else { setAddr(null); setNotFound(true); }
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
        <button className="btn-ghost" onClick={() => {setTxSig(null);setA('');setAmount('');setMode(null);}}>Send more</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="form-section">
        <label className="form-label">Recipient</label>
        <div className="input-wrap">
          <span className="input-prefix">@</span>
          <input className="input-main" value={a} onChange={e => {setA(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'')); setMode(null);}} placeholder="username" />
          {loading && <span className="input-status load">◌</span>}
          {addr && <span className="input-status ok">✓</span>}
          {notFound && <span className="input-status err">✗</span>}
        </div>
        {addr && <div className="hint ok" style={{fontFamily:'monospace',fontSize:11}}>{addr.slice(0,16)}...{addr.slice(-8)}</div>}
        {notFound && <div className="hint err">Not registered</div>}
      </div>

      {/* Mode selection */}
      {addr && !mode && (
        <div style={{display:'flex',gap:12,marginBottom:20}}>
          <button className="btn-main" style={{flex:1,padding:16}} onClick={() => setMode('phantom')}>
            ⚡ Send with Phantom
          </button>
          <button className="btn-ghost" style={{flex:1,padding:16}} onClick={() => setMode('manual')}>
            📋 Manual steps
          </button>
        </div>
      )}

      {/* Phantom mode */}
      {mode === 'phantom' && addr && (
        <>
          <div className="form-section">
            <label className="form-label">Amount (SOL)</label>
            <div className="input-wrap">
              <input className="input-main" style={{paddingLeft:24}} type="number" step="0.001" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          {!wallet ? (
            <button className="btn-main" onClick={connectWallet}>
              {window.solana ? 'Connect Phantom' : 'Install Phantom'}
            </button>
          ) : (
            <button className="btn-main" disabled={!amount || parseFloat(amount) <= 0 || sending} onClick={sendSol}>
              {sending ? 'Confirming...' : amount ? `Send ${amount} SOL to @${a}` : 'Enter amount'}
            </button>
          )}
          {wallet && (
            <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'#666'}}>
              Connected: {wallet.toBase58().slice(0,6)}...{wallet.toBase58().slice(-4)}
            </div>
          )}
          <button className="btn-ghost" style={{width:'100%',marginTop:12}} onClick={() => setMode(null)}>← Back</button>
        </>
      )}

      {/* Manual mode */}
      {mode === 'manual' && addr && (
        <div className="result-box" style={{textAlign:'left'}}>
          <div style={{fontSize:16,fontWeight:600,marginBottom:20,textAlign:'center'}}>How to send SOL manually</div>
          
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,color:'#666',marginBottom:8}}>STEP 1: Copy the address</div>
            <div style={{background:'#0a0a0a',padding:12,borderRadius:8,fontFamily:'monospace',fontSize:12,wordBreak:'break-all',color:'#888'}}>
              {addr}
            </div>
            <button className="btn-copy" style={{width:'100%',marginTop:8}} onClick={() => {navigator.clipboard.writeText(addr);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
              {copied ? '✓ Copied!' : 'Copy address'}
            </button>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,color:'#666',marginBottom:8}}>STEP 2: Open your wallet</div>
            <div style={{fontSize:14,color:'#aaa'}}>Open Phantom, Solflare, Backpack, or any Solana wallet</div>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,color:'#666',marginBottom:8}}>STEP 3: Send SOL</div>
            <div style={{fontSize:14,color:'#aaa'}}>Click "Send" → Paste the address → Enter amount → Confirm</div>
          </div>

          <div style={{padding:12,background:'#0a0a0a',borderRadius:8,marginBottom:16}}>
            <div style={{fontSize:12,color:'#22c55e'}}>✓ Sending to @{a}</div>
          </div>

          <button className="btn-ghost" style={{width:'100%'}} onClick={() => setMode(null)}>← Back</button>
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
  const [checking, setChecking] = useState({alias:false,wallet:false});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (alias.length < 3) { setAliasOk(null); return; }
    setChecking(c => ({...c, alias:true}));
    const t = setTimeout(async () => {
      const available = await checkAlias(alias);
      setAliasOk(available);
      setChecking(c => ({...c, alias:false}));
    }, 300);
    return () => clearTimeout(t);
  }, [alias]);

  useEffect(() => {
    if (wallet.length < 32) { setWalletOk(null); return; }
    setChecking(c => ({...c, wallet:true}));
    const t = setTimeout(() => {
      try {
        new PublicKey(wallet);
        setWalletOk(true);
      } catch { setWalletOk(false); }
      setChecking(c => ({...c, wallet:false}));
    }, 300);
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
          {walletOk === false && <div className="hint err">Invalid address</div>}
          {walletOk && <div className="hint ok">Valid address</div>}
        </div>
      )}
      <button className="btn-main" disabled={!aliasOk || !walletOk || submitting}
        onClick={async () => {
          setSubmitting(true);
          const success = await registerAlias(alias, wallet);
          if (success) setDone(true);
          else alert('Registration failed - alias may already be taken');
          setSubmitting(false);
        }}>
        {submitting ? 'Registering...' : aliasOk && walletOk ? `Claim @${alias}` : 'Complete form above'}
      </button>
    </>
  );
}


