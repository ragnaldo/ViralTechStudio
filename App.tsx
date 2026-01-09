
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Copy,
  RefreshCw,
  Sparkles,
  Zap,
  Clock,
  Image as ImageIcon,
  Rocket,
  Eye,
  Mic,
  Download,
  Link as LinkIcon,
  Video
} from 'lucide-react';
import { ContentType, VideoScript, ViralTrend } from './types';
import { generateScript, findViralTrends, analyzeCompetitors } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scripts' | 'trends' | 'analysis'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [scriptTopic, setScriptTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.TECH_TIP);
  const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(null);
  const [trends, setTrends] = useState<ViralTrend[]>([]);
  const [analysis, setAnalysis] = useState<string>('');

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [trendData, analysisData] = await Promise.all([findViralTrends(), analyzeCompetitors()]);
      setTrends(trendData);
      setAnalysis(analysisData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleGenerateScript = async () => {
    if (!scriptTopic) return;
    setLoading(true);
    try {
      const script = await generateScript(scriptTopic, contentType);
      setGeneratedScript(script);
      setActiveTab('scripts');
    } catch (error) { alert("Erro ao gerar roteiro."); } finally { setLoading(false); }
  };

  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `viral-scene-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg"><Rocket className="text-white" size={24} /></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">ViralStudio AI</h1>
        </div>
        <nav className="space-y-2">
          <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<TrendingUp size={20} />} label="Tendências 1M+" />
          <SidebarLink active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<Users size={20} />} label="Análise Elite" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">{activeTab === 'dashboard' ? 'Criador' : activeTab === 'trends' ? 'Viral Trends' : activeTab === 'analysis' ? 'Benchmarking' : 'Estúdio de Produção'}</h2>
          <button onClick={loadInitialData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /><span className="hidden sm:inline">Atualizar</span>
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/20 rounded-2xl"><Terminal className="text-indigo-400" size={32} /></div>
                <div><h3 className="text-2xl font-bold">Roteirista Tech</h3><p className="text-slate-400 text-sm">Scripts de 60-70s baseados em notícias atuais.</p></div>
              </div>
              <div className="space-y-6">
                <input type="text" placeholder="Qual a notícia ou tópico de hoje?" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-indigo-500 outline-none text-xl" value={scriptTopic} onChange={(e) => setScriptTopic(e.target.value)} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FormatButton active={contentType === ContentType.REACTION} onClick={() => setContentType(ContentType.REACTION)} icon={<Zap size={20} />} label="Remix Notícia" />
                  <FormatButton active={contentType === ContentType.TECH_TIP} onClick={() => setContentType(ContentType.TECH_TIP)} icon={<Cpu size={20} />} label="Dica / Truque" />
                  <FormatButton active={contentType === ContentType.SECURITY_ALARM} onClick={() => setContentType(ContentType.SECURITY_ALARM)} icon={<ShieldCheck size={20} />} label="Segurança" />
                  <FormatButton active={contentType === ContentType.GADGET_REVIEW} onClick={() => setContentType(ContentType.GADGET_REVIEW)} icon={<Sparkles size={20} />} label="Gadget" />
                </div>
                <button onClick={handleGenerateScript} disabled={loading || !scriptTopic} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-6 rounded-2xl transition-all shadow-xl text-xl">
                  {loading ? 'Buscando Fontes e Gerando...' : 'Gerar Roteiro Completo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scripts' && generatedScript && (
          <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in zoom-in-95 duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 relative shadow-2xl overflow-hidden">
              <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-8">
                <div>
                  <h3 className="text-4xl font-black mb-3">{generatedScript.title}</h3>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-black"><Clock size={16} /> {generatedScript.estimatedDuration}</span>
                    <span className="bg-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{generatedScript.wordCount} Palavras</span>
                  </div>
                </div>
                <div className="text-center bg-indigo-600/10 p-5 rounded-3xl border border-indigo-500/20">
                  <span className="text-[10px] text-indigo-400 font-black uppercase block mb-1">Viral Score</span>
                  <div className="text-4xl font-black text-indigo-400">{generatedScript.viralScore}</div>
                </div>
              </div>

              {/* Referências de Vídeo */}
              <div className="mb-10 bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <LinkIcon size={14} /> Fontes de Referência para o Remix
                </h4>
                <div className="flex flex-wrap gap-3">
                  {generatedScript.referenceLinks.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-slate-700">
                      Link de Referência {i+1} <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Timeline de Cenas */}
              <div className="space-y-6">
                {generatedScript.scenes.map((scene, i) => (
                  <div key={i} className="grid grid-cols-12 gap-6 bg-slate-800/10 rounded-[2rem] p-8 border border-slate-700/30 hover:bg-slate-800/20 transition-all">
                    <div className="col-span-12 lg:col-span-5">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center font-black text-xs">{i+1}</span>
                        <div>
                          <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">Visual</p>
                          <p className="text-slate-300 font-medium leading-relaxed">{scene.visual}</p>
                        </div>
                      </div>
                      
                      {scene.isStaticImage && generatedScript.generatedImages && scene.imageIndex !== undefined && generatedScript.generatedImages[scene.imageIndex] && (
                        <div className="mt-4 relative group aspect-[9/16] w-full max-w-[200px] rounded-2xl overflow-hidden border border-slate-700 shadow-xl mx-auto lg:mx-0">
                          <img src={generatedScript.generatedImages[scene.imageIndex]} alt="Scene Ref" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => downloadImage(generatedScript.generatedImages![scene.imageIndex!], i)}
                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-indigo-600 rounded-lg text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      )}
                      {!scene.isStaticImage && (
                        <div className="mt-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center gap-3">
                          <Video size={16} className="text-amber-400" />
                          <p className="text-[10px] font-bold text-amber-300 uppercase">Usar Vídeo da Referência</p>
                        </div>
                      )}
                    </div>
                    <div className="col-span-12 lg:col-span-7 lg:pl-6 lg:border-l border-slate-800">
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Áudio</p>
                      <p className="text-2xl font-bold text-white leading-snug">"{scene.audio}"</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 text-center">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Chamada para Ação</p>
                <p className="text-3xl font-black text-white">{generatedScript.cta}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => {
                const text = generatedScript.scenes.map((s, i) => `CENA ${i+1}\nVISUAL: ${s.visual}\nAUDIO: ${s.audio}`).join('\n\n');
                navigator.clipboard.writeText(text);
                alert("Roteiro copiado!");
              }} className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-3 transition-all">
                <Copy size={24} /> Copiar Roteiro Técnico
              </button>
              <button onClick={() => setGeneratedScript(null)} className="flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-[2rem] font-bold text-xl border border-slate-700 transition-all">Novo Projeto</button>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {trends.map((t, idx) => (
              <div key={idx} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-indigo-500/50 transition-all group">
                <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{t.viewCount}</span>
                <h3 className="text-2xl font-black my-4">{t.title}</h3>
                <p className="text-slate-400 text-sm mb-6">{t.strategy}</p>
                <button onClick={() => { setScriptTopic(t.title); handleGenerateScript(); }} className="w-full py-4 bg-slate-800 hover:bg-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  Usar esse tema <ExternalLink size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-[3rem] p-10 animate-in fade-in duration-500">
            <h3 className="text-3xl font-black mb-8 text-indigo-400 flex items-center gap-3"><Users size={32} /> Análise de Estilo Elite</h3>
            <div className="prose prose-invert max-w-none text-slate-300 text-lg leading-relaxed whitespace-pre-line bg-slate-800/20 p-8 rounded-3xl border border-slate-700/50">
              {analysis}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    {icon}<span className="font-bold text-lg">{label}</span>
  </button>
);

const FormatButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${active ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-700 bg-slate-800/40 text-slate-500'}`}>
    {icon}<span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
  </button>
);

export default App;
