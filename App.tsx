
import React, { useState, useRef, useEffect } from 'react';
import { 
  Twitter, Loader2, Flame, Swords, Library, Ghost, Handshake, Globe, 
  Target, Terminal, ShieldAlert, Zap, User, Lock, Mail, Download, 
  Copy, CheckCircle, Sun, Moon, Database, Camera, Sparkles,
  // Fix: Added missing icons AtSign and Thermometer.
  AtSign, Thermometer
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toPng } from 'html-to-image';
import { ResponseTone, PostResponse, LibertarianPersona } from './types';
import { generateResponse, generateImagenImage } from './services/geminiService';

// Prevenir ReferenceError en el navegador
const safeProcess = typeof process !== 'undefined' ? process : { env: {} as Record<string, string> };

const SUPABASE_URL = (safeProcess.env as any).SUPABASE_URL || 'https://vqgfqofrnymvxnhggggt.supabase.co';
const SUPABASE_ANON_KEY = (safeProcess.env as any).SUPABASE_ANON_KEY || 'sb_publishable_utCEom6kAlJVyTaS3IvtJg_gXnhlMwd'; 

let supabase: any;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.error("Supabase fail:", e);
}

const TONE_STYLES: Record<ResponseTone, { icon: React.ReactNode, color: string, bg: string, text: string }> = {
  [ResponseTone.SARCASTIC]: { icon: <Zap className="w-4 h-4" />, color: "from-purple-500 to-indigo-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  [ResponseTone.ACADEMIC]: { icon: <Library className="w-4 h-4" />, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  [ResponseTone.AGGRESSIVE]: { icon: <Swords className="w-4 h-4" />, color: "from-red-500 to-rose-600", bg: "bg-red-500/10", text: "text-red-400" },
  [ResponseTone.DIPLOMATIC]: { icon: <Handshake className="w-4 h-4" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  [ResponseTone.IRONIC]: { icon: <Ghost className="w-4 h-4" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", text: "text-amber-400" }
};

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Sincronizando Sistemas de Libertad..." }) => (
  <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center p-8 text-center space-y-6">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      <Twitter className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">{message}</p>
  </div>
);

const ConfigError: React.FC = () => (
  <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-8">
    <div className="max-w-md w-full p-10 rounded-[2.5rem] bg-slate-900 border border-red-500/20 text-center space-y-6 shadow-2xl">
      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
      <h1 className="text-2xl font-black text-white">Error de Configuración</h1>
      <p className="text-slate-400 text-sm leading-relaxed">
        No se pudieron cargar las variables críticas. Asegúrate de configurar <code className="text-blue-400">SUPABASE_URL</code> y <code className="text-blue-400">SUPABASE_ANON_KEY</code> en tu panel de Vercel.
      </p>
      <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-700 transition-all">
        Reiniciar Sistema
      </button>
    </div>
  </div>
);

const Auth: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) onAuth();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) onAuth();
        else alert("¡Registro iniciado! Por favor verifica tu email.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
      <div className="auth-card w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Twitter className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Liberta<span className="text-blue-500">X</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Tactical Rebuttal Unit</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Agente" required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-tighter bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-shake">{error}</p>}
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'ENTRAR AL COMBATE' : 'REGISTRAR AGENTE')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors">
          {isLogin ? 'Crear nuevas credenciales' : 'Volver al acceso táctico'}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [inputText, setInputText] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [selectedTone, setSelectedTone] = useState<ResponseTone>(ResponseTone.SARCASTIC);
  const [selectedPersona, setSelectedPersona] = useState<LibertarianPersona>(LibertarianPersona.ANCAP);
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<PostResponse[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const responseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!supabase) {
      setIsInitializing(false);
      return;
    }
    
    // Verificación de sesión inicial
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setIsInitializing(false);
    }).catch(() => setIsInitializing(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchUserHistory();
  }, [session]);

  const fetchUserHistory = async () => {
    if (!supabase || !session) return;
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setResponses(data as any);
      if (error) console.error("History fetch error:", error);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    setIsLoading(true);
    try {
      const result = await generateResponse(inputText, null, selectedTone, selectedPersona, inputUsername, false);
      const newEntry = {
        user_id: session.user.id,
        username: inputUsername || 'Estatista',
        original_text: inputText,
        generated_content: result.text,
        meme_caption: result.memeCaption,
        tone: selectedTone,
        persona: selectedPersona,
        collectivism_score: result.collectivismScore,
        created_at: new Date().toISOString()
      };
      if (supabase) {
        const { data, error } = await supabase.from('responses').insert([newEntry]).select();
        if (data) setResponses(prev => [data[0] as any, ...prev]);
        if (error) throw error;
      }
      setInputText('');
    } catch (err: any) { 
      alert("Error: " + err.message); 
    } finally { 
      setIsLoading(false); 
    }
  };

  if (isInitializing) return <LoadingScreen />;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return <ConfigError />;
  if (!session) return <Auth onAuth={() => {}} />;

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar Historial */}
      <aside className={`hidden lg:flex w-80 border-r flex-col p-6 sticky top-0 h-screen ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg"><Twitter className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">Liberta<span className="text-blue-500">X</span></h1>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Base de Datos</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center py-2 border-b border-white/5 mb-4 flex items-center justify-center gap-2">
            <Database className="w-3 h-3" /> Registros Tácticos
          </div>
          {responses.length === 0 && <p className="text-[10px] text-center text-slate-600 italic">No hay operaciones previas.</p>}
          {responses.map(r => (
            <button key={r.id} onClick={() => responseRefs.current[r.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                 <div className={`p-1 rounded bg-blue-600 text-white`}>{TONE_STYLES[r.tone as ResponseTone]?.icon}</div>
                 <span className="text-[9px] font-black opacity-60">@{r.username}</span>
              </div>
              <p className="text-[10px] line-clamp-2 opacity-80 italic">"{r.generated_content}"</p>
            </button>
          ))}
        </div>

        <button onClick={() => supabase.auth.signOut()} className="mt-4 w-full py-3 bg-red-500/10 text-red-500 text-[10px] font-black uppercase border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">Desconectar</button>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-10 space-y-12">
        <section className={`rounded-[2.5rem] border p-1 shadow-2xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-8 lg:p-12 space-y-8">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-widest">Nueva Ofensiva</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="Usuario objetivo"
                    className={`w-full rounded-xl py-4 pl-12 pr-6 border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} />
                </div>
                <select value={selectedPersona} onChange={e => setSelectedPersona(e.target.value as LibertarianPersona)}
                  className={`w-full rounded-xl py-4 px-6 border-2 outline-none font-bold appearance-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}>
                  {Object.values(LibertarianPersona).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div className="relative">
                <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Pega aquí el post colectivista que vamos a demoler..."
                  className={`w-full min-h-[180px] rounded-[2rem] p-8 border-2 outline-none resize-none text-lg leading-relaxed ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} />
                <div className="absolute bottom-6 right-6 flex gap-2">
                  {Object.values(ResponseTone).map(t => (
                    <button key={t} type="button" onClick={() => setSelectedTone(t)} title={t}
                      className={`p-3 rounded-lg transition-all ${selectedTone === t ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}>
                      {TONE_STYLES[t].icon}
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={isLoading || !inputText} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-40">
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Flame className="w-7 h-7" />}
                <span className="uppercase tracking-[0.2em]">{isLoading ? 'DEMOLIENDO FALACIA...' : 'EJECUTAR RESPUESTA'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Feed de Resultados */}
        <div className="space-y-16 pb-32">
          {responses.map(r => {
            const style = TONE_STYLES[r.tone as ResponseTone] || TONE_STYLES[ResponseTone.SARCASTIC];
            return (
              <div key={r.id} ref={el => responseRefs.current[r.id] = el} className={`border rounded-[3.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-10 lg:p-14 space-y-10 relative">
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${style.color}`} />
                  
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-5 rounded-2xl ${style.bg} ${style.text} shadow-inner`}>{style.icon}</div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Agente LibertaX</p>
                        <h3 className="text-3xl font-black tracking-tighter">@{r.username}</h3>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                       {/* Fix: Replaced missing icon Thermometer */}
                       <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center justify-end gap-2"><Thermometer className="w-3 h-3 text-red-500" /> Colectivómetro</p>
                       <div className="w-40 h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-red-600" style={{ width: `${r.collectivism_score}%` }} />
                       </div>
                       <p className="text-[9px] font-black opacity-50">{r.collectivism_score}% Estatismo Detectado</p>
                    </div>
                  </div>

                  <p className="text-3xl lg:text-5xl font-black leading-tight tracking-tight italic">"{r.generated_content}"</p>
                  
                  <div className="pt-8 border-t border-white/5 opacity-30 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-2"><Twitter className="w-4 h-4" /> LibertaX AI</div>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); } 20%, 40%, 60%, 80% { transform: translateX(2px); } }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
