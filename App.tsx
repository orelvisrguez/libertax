
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, History, Copy, CheckCircle, Zap, Twitter, 
  AlertCircle, Loader2, Sparkles, AtSign, Quote, Flame, Swords, Library, 
  Ghost, Handshake, Globe, ExternalLink, BarChart3, Link2, Target, Terminal, 
  ShieldAlert, Thermometer, Upload, Camera, X, Award, Sun, Moon, Download, Menu,
  LogIn, UserPlus, LogOut, User, Lock, Mail, ChevronUp, Database, Settings
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toPng } from 'html-to-image';
import { ResponseTone, PostResponse, LibertarianPersona } from './types';
import { generateResponse, generateImagenImage } from './services/geminiService';

// Ayudante de seguridad para entornos de navegador
const getEnv = (key: string, fallback: string = ''): string => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
  } catch (e) {
    return fallback;
  }
};

const SUPABASE_URL = getEnv('SUPABASE_URL', 'https://vqgfqofrnymvxnhggggt.supabase.co');
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', 'sb_publishable_utCEom6kAlJVyTaS3IvtJg_gXnhlMwd'); 

// Inicialización segura
let supabase: any;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.error("Supabase Init Error", e);
}

const TONE_STYLES: Record<ResponseTone, { icon: React.ReactNode, color: string, bg: string, text: string }> = {
  [ResponseTone.SARCASTIC]: { icon: <Zap className="w-4 h-4" />, color: "from-purple-500 to-indigo-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  [ResponseTone.ACADEMIC]: { icon: <Library className="w-4 h-4" />, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  [ResponseTone.AGGRESSIVE]: { icon: <Swords className="w-4 h-4" />, color: "from-red-500 to-rose-600", bg: "bg-red-500/10", text: "text-red-400" },
  [ResponseTone.DIPLOMATIC]: { icon: <Handshake className="w-4 h-4" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  [ResponseTone.IRONIC]: { icon: <Ghost className="w-4 h-4" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", text: "text-amber-400" }
};

const ConfigError: React.FC = () => (
  <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-8">
    <div className="max-w-md w-full p-10 rounded-[2.5rem] bg-slate-900 border border-red-500/20 text-center space-y-6">
      <div className="bg-red-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-black text-white">Configuración Incompleta</h1>
      <p className="text-slate-400 text-sm leading-relaxed">
        La aplicación no puede iniciar porque faltan las variables de entorno en Vercel. 
        Asegúrate de añadir <code className="text-blue-400">SUPABASE_URL</code> y <code className="text-blue-400">SUPABASE_ANON_KEY</code>.
      </p>
      <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">
        Reintentar Conexión
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
        else alert("¡Verifica tu email!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6">
      <div className="auth-card w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Twitter className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Liberta<span className="text-blue-500">X</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Tactical Command Center</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-white outline-none focus:border-blue-500 transition-all" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-white outline-none focus:border-blue-500 transition-all" />
          {error && <p className="text-red-500 text-[10px] font-black uppercase">{error}</p>}
          <button disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-500 transition-all">
            {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrar')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
          {isLogin ? 'Crear cuenta de agente' : 'Ya tengo credenciales'}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<ResponseTone>(ResponseTone.SARCASTIC);
  const [selectedPersona, setSelectedPersona] = useState<LibertarianPersona>(LibertarianPersona.ANCAP);
  const [useSearch, setUseSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<PostResponse[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const responseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchUserHistory();
  }, [session]);

  const fetchUserHistory = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('responses').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (data) setResponses(data as any);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText && !selectedImage) return;
    setIsLoading(true);
    try {
      const result = await generateResponse(inputText, selectedImage, selectedTone, selectedPersona, inputUsername, useSearch);
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
        const { data } = await supabase.from('responses').insert([newEntry]).select();
        if (data) setResponses(prev => [data[0] as any, ...prev]);
      }
      setInputText('');
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return <ConfigError />;
  if (!session) return <Auth onAuth={() => {}} />;

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <aside className={`hidden lg:flex w-80 border-r flex-col p-6 sticky top-0 h-screen ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-xl"><Twitter className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">Liberta<span className="text-blue-500">X</span></h1>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Command Unit</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center py-2 border-b border-white/5 mb-4">Operaciones Pasadas</div>
          {responses.map(r => (
            <button key={r.id} onClick={() => responseRefs.current[r.id]?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-full text-left p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <span className="text-[9px] font-black opacity-60">@{r.username}</span>
              <p className="text-[10px] line-clamp-2 opacity-80 italic">"{r.generated_content}"</p>
            </button>
          ))}
        </div>

        <button onClick={() => supabase.auth.signOut()} className="mt-4 w-full py-2 bg-red-500/10 text-red-500 text-[10px] font-black uppercase border border-red-500/20 rounded-xl hover:bg-red-500/20">Desconectar</button>
      </aside>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-10 space-y-12">
        <section className={`rounded-[2.5rem] border p-1 shadow-2xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="@objetivo"
                  className={`w-full rounded-xl py-4 px-6 border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} />
                <select value={selectedPersona} onChange={e => setSelectedPersona(e.target.value as LibertarianPersona)}
                  className={`w-full rounded-xl py-4 px-6 border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`}>
                  {Object.values(LibertarianPersona).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Post estatista..."
                className={`w-full min-h-[150px] rounded-2xl p-8 border-2 outline-none resize-none text-lg ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'}`} />
              <button disabled={isLoading} className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Flame className="w-6 h-6" />}
                <span className="uppercase tracking-[0.2em]">{isLoading ? 'Procesando...' : 'Ejecutar Reclamo'}</span>
              </button>
            </form>
          </div>
        </section>

        <div className="space-y-16 pb-32">
          {responses.map(r => {
            const style = TONE_STYLES[r.tone as ResponseTone] || TONE_STYLES[ResponseTone.SARCASTIC];
            return (
              <div key={r.id} ref={el => responseRefs.current[r.id] = el} className={`border rounded-[3rem] overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-10 lg:p-14 space-y-8 relative">
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${style.color}`} />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${style.bg} ${style.text}`}>{style.icon}</div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-500">Agente LibertaX</p>
                        <h3 className="text-2xl font-black">@{r.username}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Estatismo</p>
                       <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600" style={{ width: `${r.collectivism_score}%` }} />
                       </div>
                    </div>
                  </div>
                  <p className="text-3xl lg:text-4xl font-black leading-tight italic">"{r.generated_content}"</p>
                  <div className="pt-6 border-t border-white/5 opacity-30 flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>LibertaX Tactical v1.0</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
