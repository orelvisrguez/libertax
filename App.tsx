
import React, { useState, useRef, useEffect } from 'react';
import { 
  Twitter, Loader2, Flame, Swords, Library, Ghost, Handshake, Globe, 
  Target, Terminal, ShieldAlert, Zap, User, Lock, Mail, Download, 
  Copy, CheckCircle, Sun, Moon, Database, Camera, Sparkles,
  AtSign, Thermometer, Settings, Quote
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toPng } from 'html-to-image';
import { ResponseTone, PostResponse, LibertarianPersona } from './types';
import { generateResponse, generateImagenImage } from './services/geminiService';

// Acceso seguro a variables
const getEnv = (key: string, fallback: string = ''): string => {
  try {
    return (window as any).process?.env?.[key] || (typeof process !== 'undefined' ? process.env[key] : '') || fallback;
  } catch (e) {
    return fallback;
  }
};

const SUPABASE_URL = getEnv('SUPABASE_URL', 'https://vqgfqofrnymvxnhggggt.supabase.co');
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', 'sb_publishable_utCEom6kAlJVyTaS3IvtJg_gXnhlMwd'); 

let supabase: any;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.error("Supabase failed to initialize:", e);
}

const TONE_STYLES: Record<ResponseTone, { icon: React.ReactNode, color: string, bg: string, text: string }> = {
  [ResponseTone.SARCASTIC]: { icon: <Zap className="w-4 h-4" />, color: "from-purple-500 to-indigo-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  [ResponseTone.ACADEMIC]: { icon: <Library className="w-4 h-4" />, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  [ResponseTone.AGGRESSIVE]: { icon: <Swords className="w-4 h-4" />, color: "from-red-500 to-rose-600", bg: "bg-red-500/10", text: "text-red-400" },
  [ResponseTone.DIPLOMATIC]: { icon: <Handshake className="w-4 h-4" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  [ResponseTone.IRONIC]: { icon: <Ghost className="w-4 h-4" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", text: "text-amber-400" }
};

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Iniciando Sistemas..." }) => (
  <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center p-8 text-center space-y-6">
    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">{message}</p>
  </div>
);

const ConfigError: React.FC<{ error?: string }> = ({ error }) => (
  <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-8">
    <div className="max-w-md w-full p-10 rounded-[2.5rem] bg-slate-900 border border-red-500/20 text-center space-y-6 shadow-2xl">
      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
      <h1 className="text-2xl font-black text-white">Error Operativo</h1>
      <p className="text-slate-400 text-sm leading-relaxed">
        {error || "No se detectaron las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY en Vercel."}
      </p>
      <div className="p-4 bg-slate-950 rounded-xl text-left border border-white/5">
        <p className="text-[10px] font-mono text-blue-400"># Instrucción Vercel:</p>
        <p className="text-[10px] font-mono text-slate-500 mt-1">1. Ve a Settings -> Environment Variables</p>
        <p className="text-[10px] font-mono text-slate-500">2. Añade API_KEY, SUPABASE_URL, etc.</p>
        <p className="text-[10px] font-mono text-slate-500">3. Redespliega el proyecto.</p>
      </div>
      <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition-all">
        Reintentar Sincronización
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
        else alert("¡Registro enviado! Verifica tu email para activar tu rango de agente.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
      <div className="auth-card w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <Twitter className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Liberta<span className="text-blue-500">X</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic opacity-60">Centro de Operaciones Tácticas</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Agente" required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Credencial de Acceso" required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase bg-red-500/5 p-3 rounded-lg border border-red-500/10 text-center">{error}</p>}
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'INICIAR SESIÓN' : 'REGISTRAR AGENTE')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors">
          {isLogin ? '¿Nuevo recluta? Crea una cuenta' : '¿Ya eres agente? Identifícate'}
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
    } catch (err) { console.error("History Error:", err); }
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
      alert("Error Crítico: " + err.message); 
    } finally { 
      setIsLoading(false); 
    }
  };

  if (isInitializing) return <LoadingScreen message="Autenticando Credenciales de Libertad..." />;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return <ConfigError />;
  if (!session) return <Auth onAuth={() => {}} />;

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar de Operaciones */}
      <aside className={`hidden lg:flex w-80 border-r flex-col p-6 sticky top-0 h-screen shadow-2xl ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-blue-500/20 shadow-lg"><Twitter className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">Liberta<span className="text-blue-500">X</span></h1>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Unidad de Combate</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center py-2 border-b border-white/5 mb-4 flex items-center justify-center gap-2">
            <Database className="w-3 h-3" /> Archivos de Inteligencia
          </div>
          {responses.length === 0 && (
            <div className="text-center py-10 opacity-20">
              <Ghost className="w-10 h-10 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sin registros</p>
            </div>
          )}
          {responses.map(r => (
            <button key={r.id} onClick={() => responseRefs.current[r.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:translate-x-1 ${isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                 <div className={`p-1 rounded bg-blue-600/20 text-blue-400`}>{TONE_STYLES[r.tone as ResponseTone]?.icon}</div>
                 <span className="text-[9px] font-black opacity-60 truncate">@{r.username}</span>
              </div>
              <p className="text-[10px] line-clamp-2 opacity-80 italic leading-relaxed">"{r.generated_content}"</p>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full py-2 flex items-center justify-between px-4 rounded-xl bg-slate-800/50 text-[10px] font-black uppercase">
            <span>Tema {isDarkMode ? 'Oscuro' : 'Claro'}</span>
            {isDarkMode ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="w-full py-2 bg-red-500/10 text-red-500 text-[10px] font-black uppercase border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">Desconectar</button>
        </div>
      </aside>

      {/* Centro de Mando */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-10 space-y-12">
        <section className={`rounded-[2.5rem] border p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-8 lg:p-12 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-blue-500" />
                <h2 className="text-sm font-black uppercase tracking-widest">Desplegar Ofensiva</h2>
              </div>
              <div className="bg-blue-600/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">IA Generativa Nivel 3</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="Usuario Objetivo"
                    className={`w-full rounded-2xl py-4 pl-12 pr-6 border-2 outline-none font-bold transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} />
                </div>
                <div className="relative">
                  <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select value={selectedPersona} onChange={e => setSelectedPersona(e.target.value as LibertarianPersona)}
                    className={`w-full rounded-2xl py-4 pl-12 pr-6 border-2 outline-none font-bold appearance-none cursor-pointer transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}>
                    {Object.values(LibertarianPersona).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="relative">
                <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Introduce el post colectivista que vamos a destruir..."
                  className={`w-full min-h-[200px] rounded-[2.5rem] p-10 border-2 outline-none resize-none text-xl leading-relaxed transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} />
                <div className="absolute bottom-8 right-8 flex gap-3">
                  {Object.values(ResponseTone).map(t => (
                    <button key={t} type="button" onClick={() => setSelectedTone(t)} title={t}
                      className={`p-3.5 rounded-xl transition-all ${selectedTone === t ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}>
                      {TONE_STYLES[t].icon}
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={isLoading || !inputText} className="group w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black py-7 rounded-[2.5rem] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Flame className="w-7 h-7" />}
                <span className="uppercase tracking-[0.3em] relative z-10">{isLoading ? 'DEMOLIENDO FALACIA...' : 'EJECUTAR RESPUESTA TÁCTICA'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Feed de Operaciones Exitosas */}
        <div className="space-y-16 pb-40">
          {responses.length > 0 && (
            <div className="flex items-center gap-4 opacity-50">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Operaciones de Campo</p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-500" />
            </div>
          )}
          {responses.map(r => {
            const style = TONE_STYLES[r.tone as ResponseTone] || TONE_STYLES[ResponseTone.SARCASTIC];
            return (
              <div key={r.id} ref={el => responseRefs.current[r.id] = el} className={`group border rounded-[4rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-10 duration-1000 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-12 lg:p-16 space-y-12 relative">
                  <div className={`absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r ${style.color} opacity-80`} />
                  
                  <div className="flex justify-between items-start flex-wrap gap-8">
                    <div className="flex items-center gap-6">
                      <div className={`p-6 rounded-[2rem] ${style.bg} ${style.text} shadow-inner group-hover:scale-110 transition-transform duration-500`}>{style.icon}</div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em] mb-1">Agente Autorizado</p>
                        <h3 className="text-4xl font-black tracking-tighter">@{r.username}</h3>
                      </div>
                    </div>
                    <div className="text-right space-y-3 bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center justify-end gap-2"><Thermometer className="w-4 h-4 text-red-500" /> Colectivómetro</p>
                       <div className="w-48 h-3.5 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div className={`h-full bg-gradient-to-r from-blue-500 to-red-600 transition-all duration-1000`} style={{ width: `${r.collectivism_score}%` }} />
                       </div>
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Libertad</span>
                          <span className="text-[11px] font-black text-red-500">{r.collectivism_score}%</span>
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Tiranía</span>
                       </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-6 -left-8 w-16 h-16 text-blue-500/5 rotate-12" />
                    <p className="text-3xl lg:text-5xl font-black leading-tight tracking-tight italic relative z-10 text-pretty">
                      "{r.generated_content}"
                    </p>
                  </div>
                  
                  <div className="pt-10 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                      <div className="flex items-center gap-2"><Twitter className="w-4 h-4" /> LibertaX AI</div>
                      <div className="h-1 w-1 bg-slate-500 rounded-full" />
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { navigator.clipboard.writeText(r.generated_content); alert("¡Texto táctico copiado!"); }} className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-colors border border-white/5">
                          <Copy className="w-4 h-4 text-slate-400" />
                       </button>
                       <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('@' + r.username + ' ' + r.generated_content)}`)} className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-blue-500/20">
                          Publicar Respuesta
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: slide-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
