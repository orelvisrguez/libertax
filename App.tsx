
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, History, Copy, CheckCircle, Zap, Twitter, 
  AlertCircle, Loader2, Sparkles, AtSign, Quote, Flame, Swords, Library, 
  Ghost, Handshake, Globe, ExternalLink, BarChart3, Link2, Target, Terminal, 
  ShieldAlert, Thermometer, Upload, Camera, X, Award, Sun, Moon, Download, Menu,
  LogIn, UserPlus, LogOut, User, Lock, Mail, ChevronUp, Database
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toPng } from 'html-to-image';
import { ResponseTone, PostResponse, LibertarianPersona } from './types';
import { generateResponse, generateImagenImage } from './services/geminiService';

// Variables de entorno para Vercel o entorno local
// Si no están definidas, usará las del proyecto actual como fallback seguro
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vqgfqofrnymvxnhggggt.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_utCEom6kAlJVyTaS3IvtJg_gXnhlMwd'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TONE_STYLES: Record<ResponseTone, { icon: React.ReactNode, color: string, bg: string, text: string }> = {
  [ResponseTone.SARCASTIC]: { icon: <Zap className="w-4 h-4" />, color: "from-purple-500 to-indigo-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  [ResponseTone.ACADEMIC]: { icon: <Library className="w-4 h-4" />, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  [ResponseTone.AGGRESSIVE]: { icon: <Swords className="w-4 h-4" />, color: "from-red-500 to-rose-600", bg: "bg-red-500/10", text: "text-red-400" },
  [ResponseTone.DIPLOMATIC]: { icon: <Handshake className="w-4 h-4" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  [ResponseTone.IRONIC]: { icon: <Ghost className="w-4 h-4" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", text: "text-amber-400" }
};

const Auth: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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
        else alert("¡Registro iniciado! Por favor verifica tu email si es necesario.");
      }
    } catch (err: any) {
      setError(err.message.includes("confirmation email") 
        ? "Configura Supabase: Desactiva 'Confirm email' para entrar directo." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
      <div className="auth-card w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20">
            <Twitter className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Liberta<span className="text-blue-500">X</span></h1>
          <p className="text-slate-400 text-sm font-medium italic">Tactical Command Center</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email del agente" required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña táctica" required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black flex items-start gap-3 uppercase animate-pulse">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
            <span className="uppercase tracking-widest text-sm relative z-10">{loading ? 'Accediendo...' : (isLogin ? 'Entrar al Combate' : 'Registrarse')}</span>
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400">
            {isLogin ? '¿Aún sin credenciales? Crea una cuenta' : '¿Ya eres un agente? Identifícate'}
          </button>
        </div>
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCapturingId, setIsCapturingId] = useState<string | null>(null);
  const [isGeneratingMeme, setIsGeneratingMeme] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const responseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchUserHistory();
  }, [session]);

  const fetchUserHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setResponses(data as any);
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText && !selectedImage) return;
    setIsLoading(true);
    
    try {
      const result = await generateResponse(inputText, selectedImage, selectedTone, selectedPersona, inputUsername, useSearch);
      
      const newEntry = {
        user_id: session.user.id,
        username: inputUsername || 'EstatistaPromedio',
        original_text: inputText,
        original_image: selectedImage,
        generated_content: result.text,
        meme_caption: result.memeCaption,
        tone: selectedTone,
        persona: selectedPersona,
        fallacies: result.fallacies,
        collectivism_score: result.collectivismScore,
        sources: result.sources,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('responses').insert([newEntry]).select();
      if (error) throw error;
      if (data) setResponses(prev => [data[0] as any, ...prev]);

      setInputText('');
      setInputUsername('');
      setSelectedImage(null);
    } catch (err: any) {
      alert("Error táctico: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMeme = async (responseId: string, caption: string) => {
    setIsGeneratingMeme(responseId);
    try {
      const imgUrl = await generateImagenImage(caption);
      const { error } = await supabase
        .from('responses')
        .update({ generated_image_url: imgUrl })
        .eq('id', responseId);
      
      if (error) throw error;
      setResponses(prev => prev.map(r => r.id === responseId ? { ...r, generated_image_url: imgUrl } : r));
    } catch (err: any) {
      alert("Error generando meme: " + err.message);
    } finally {
      setIsGeneratingMeme(null);
    }
  };

  const downloadCard = async (id: string) => {
    const element = responseRefs.current[id];
    if (!element) return;
    setIsCapturingId(id);
    try {
      const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: isDarkMode ? '#0b1120' : '#f8fafc' });
      const link = document.createElement('a');
      link.download = `LibertaX-Tactical-${id}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsCapturingId(null);
    }
  };

  if (!session) return <Auth onAuth={() => {}} />;

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar - Tactical History */}
      <aside className={`hidden lg:flex w-80 border-r flex-col p-6 sticky top-0 h-screen ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-xl">
            <Twitter className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">Liberta<span className="text-blue-500">X</span></h1>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Personal Command</p>
          </div>
        </div>

        <div className={`mb-8 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-3">
             <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400"><User className="w-4 h-4" /></div>
             <div className="truncate">
                <p className="text-[8px] font-black text-blue-500 uppercase">Perfil Agente</p>
                <p className="text-[10px] font-bold truncate opacity-70">{session.user.email}</p>
             </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="w-full py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase hover:bg-red-500/20 transition-all">
            Cerrar Sesión
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center py-2 border-b border-white/5 mb-4 flex items-center justify-center gap-2">
            <Database className="w-3 h-3" /> Mis Operaciones
          </div>
          {responses.map(r => (
            <button key={r.id} onClick={() => responseRefs.current[r.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:translate-x-1 ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                 <div className={`p-1 rounded bg-gradient-to-br ${TONE_STYLES[r.tone as ResponseTone]?.color || 'from-blue-500'} text-white`}>{TONE_STYLES[r.tone as ResponseTone]?.icon}</div>
                 <span className="text-[9px] font-black opacity-60">@{r.username}</span>
              </div>
              <p className="text-[10px] line-clamp-2 opacity-80 italic">"{r.generated_content}"</p>
            </button>
          ))}
        </div>

        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`mt-6 p-4 rounded-2xl border flex items-center justify-between hover:scale-[1.02] transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <span className="text-xs font-black uppercase">{isDarkMode ? 'Modo Luz' : 'Modo Noche'}</span>
          {isDarkMode ? <Sun className="w-4 h-4 text-blue-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </aside>

      {/* Main Command Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-10 space-y-12">
        
        {/* Environment Alert */}
        {(!process.env.API_KEY || !process.env.SUPABASE_URL) && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[10px] font-black uppercase flex items-center gap-3">
            <ShieldAlert className="w-4 h-4" /> 
            Modo Local Detectado: Asegúrate de configurar las variables de entorno en Vercel.
          </div>
        )}

        {/* Input Card */}
        <section className={`rounded-[2.5rem] border p-1 shadow-2xl relative z-10 ${isDarkMode ? 'bg-slate-900/60 border-slate-800/50' : 'bg-white border-slate-200'}`}>
          <div className={`p-8 lg:p-12 rounded-[2.3rem] ${isDarkMode ? 'bg-[#0f172a]/50' : 'bg-slate-50/50'}`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Objetivo en X</label>
                  <div className="relative group">
                    <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                    <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="@usuario"
                      className={`w-full rounded-[1.5rem] py-4 pl-14 pr-6 border-2 outline-none font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500 shadow-inner' : 'bg-white border-slate-200 focus:border-blue-400'}`} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Doctrina Táctica</label>
                  <select value={selectedPersona} onChange={e => setSelectedPersona(e.target.value as LibertarianPersona)}
                    className={`w-full rounded-[1.5rem] py-4 px-6 border-2 outline-none font-bold appearance-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-200'}`}>
                    {Object.values(LibertarianPersona).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /> Post Estatista</label>
                <div className="relative group">
                  <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="¿Qué falacia vamos a destruir hoy?"
                    className={`w-full min-h-[160px] rounded-[2rem] px-8 py-8 border-2 outline-none resize-none font-medium text-lg leading-relaxed ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500 shadow-inner' : 'bg-white border-slate-200 focus:border-blue-400'}`} />
                  <div className="absolute bottom-6 right-6">
                    {selectedImage ? (
                       <img src={selectedImage} onClick={() => setSelectedImage(null)} className="w-14 h-14 rounded-xl object-cover border-2 border-blue-500 cursor-pointer shadow-lg hover:scale-105" />
                    ) : (
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 rounded-xl bg-slate-800 text-slate-400 hover:text-blue-500 transition-all border border-slate-700 shadow-lg"><Camera className="w-6 h-6" /></button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSelectedImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 flex-wrap">
                <div className="flex gap-2 p-1 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                  {Object.values(ResponseTone).map(t => (
                    <button key={t} type="button" onClick={() => setSelectedTone(t)} title={t}
                      className={`p-4 rounded-xl transition-all ${selectedTone === t ? `bg-gradient-to-br ${TONE_STYLES[t].color} text-white shadow-xl scale-110` : 'text-slate-600 hover:text-slate-400'}`}>
                      {TONE_STYLES[t].icon}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setUseSearch(!useSearch)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl border-2 font-black text-xs uppercase transition-all ${useSearch ? 'bg-blue-600 text-white border-transparent' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  <Globe className={`w-4 h-4 ${useSearch ? 'animate-pulse' : ''}`} /> Evidencia Web {useSearch ? 'ON' : 'OFF'}
                </button>
              </div>

              <button disabled={isLoading || (!inputText && !selectedImage)} className="group w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black py-6 rounded-[1.8rem] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.97] overflow-hidden">
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Flame className="w-7 h-7" />}
                <span className="uppercase tracking-[0.2em]">{isLoading ? 'Destruyendo falacia...' : 'Ejecutar Respuesta'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Results Feed */}
        <div className="space-y-16 pb-32">
          {responses.map(r => {
            const style = TONE_STYLES[r.tone as ResponseTone] || TONE_STYLES[ResponseTone.SARCASTIC];
            return (
              <div key={r.id} className={`border rounded-[3rem] overflow-hidden relative shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                
                <div ref={el => responseRefs.current[r.id] = el} className={`p-10 lg:p-14 space-y-10 relative overflow-hidden ${isDarkMode ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${style.color}`} />
                  <div className="flex justify-between items-start flex-wrap gap-6">
                    <div className="flex gap-4">
                      <div className={`p-5 rounded-2xl ${style.bg} ${style.text} shadow-inner`}>{style.icon}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>{r.tone}</span>
                          <span className="text-[10px] font-bold opacity-30 tracking-tight">• Agente LibertaX</span>
                        </div>
                        <div className="text-3xl font-black text-blue-500 mt-1 tracking-tighter">@{r.username}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500"><Thermometer className="w-3.5 h-3.5 text-red-500" /> Colectivómetro</div>
                      <div className="w-44 h-3 bg-slate-800/60 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]" style={{ width: `${r.collectivism_score}%` }} />
                      </div>
                      <span className="text-[10px] font-black opacity-60 tracking-wider">{r.collectivism_score}% Estatismo</span>
                    </div>
                  </div>
                  <div className={`text-3xl lg:text-5xl font-black leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {r.generated_content}
                  </div>
                  <div className="pt-8 flex items-center justify-between opacity-30 border-t border-white/5">
                     <div className="flex items-center gap-3">
                        <Twitter className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Liberta<span className="text-blue-500">X</span> AI</span>
                     </div>
                     <span className="text-[10px] font-bold uppercase">{new Date(r.created_at || r.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={`p-10 border-t ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('@' + r.username + ' ' + r.generated_content)}`)} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-blue-500 transition-all">
                      <Twitter className="w-4 h-4" /> PUBLICAR
                    </button>
                    <button onClick={() => downloadCard(r.id)} disabled={isCapturingId === r.id} className="bg-slate-800 text-slate-300 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 border border-slate-700 hover:border-blue-500 transition-all">
                      {isCapturingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} CAPTURA
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(r.generated_content); setCopiedId(r.id); setTimeout(() => setCopiedId(null), 2000); }} 
                      className={`py-4 rounded-2xl text-[10px] font-black border transition-all flex items-center justify-center gap-2 ${copiedId === r.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                      {copiedId === r.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedId === r.id ? 'COPIADO' : 'COPIAR'}
                    </button>
                    <button onClick={() => handleGenerateMeme(r.id, r.meme_caption || r.generated_content)} 
                      disabled={isGeneratingMeme === r.id || !!r.generated_image_url}
                      className="py-4 rounded-2xl text-[10px] font-black border-2 border-purple-500/20 bg-purple-500/10 text-purple-400 flex items-center justify-center gap-3 transition-all hover:bg-purple-500/20">
                      {isGeneratingMeme === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {r.generated_image_url ? 'MEME LISTO' : 'GENERAR MEME'}
                    </button>
                  </div>
                  {r.generated_image_url && (
                    <div className="mt-8 rounded-[2rem] overflow-hidden border-4 border-purple-500/10 shadow-2xl group relative animate-in zoom-in duration-700">
                      <img src={r.generated_image_url} className="w-full h-auto" alt="Meme táctico" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => window.open(r.generated_image_url, '_blank')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:scale-110 transition-transform">Ver Imagen Completa</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="lg:hidden p-8 text-center opacity-30 border-t border-white/5">
        <h2 className="text-xl font-black tracking-tighter">Liberta<span className="text-blue-500">X</span></h2>
        <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-1">Ready for Vercel Deployment</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
