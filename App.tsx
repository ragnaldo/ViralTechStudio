
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Video, 
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
  Rocket
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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [trendData, analysisData] = await Promise.all([
        findViralTrends(),
        analyzeCompetitors()
      ]);
      setTrends(trendData);
      setAnalysis(analysisData);
    } catch (error) {
      console.error("Failed to load initial data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!scriptTopic) return;
    setLoading(true);
    try {
      const script = await generateScript(scriptTopic, contentType);
      setGeneratedScript(script);
      setActiveTab('scripts');
    } catch (error) {
      alert("Ocorreu um erro ao gerar o roteiro.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Rocket className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ViralStudio AI
          </h1>
        </div>

        <nav className="space-y-2">
          <SidebarLink 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <SidebarLink 
            active={activeTab === 'trends'} 
            onClick={() => setActiveTab('trends')}
            icon={<TrendingUp size={20} />}
            label="Viral Trends"
          />
          <SidebarLink 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')}
            icon={<Users size={20} />}
            label="Análise de Perfis"
          />
        </nav>

        <div className="mt-auto pt-10 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              Dica Pro
            </h3>
            <p className="text-xs text-slate-400">
              Vídeos de 60s+ performam melhor no Reels atualmente. Garanta que o roteiro preencha todo o tempo.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {activeTab === 'dashboard' ? 'Início' : activeTab === 'trends' ? 'Tendências 1M+' : activeTab === 'analysis' ? 'Análise de Competidores' : 'Roteiro'}
            </h2>
          </div>
          <button 
            onClick={loadInitialData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Recarregar</span>
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                   <Terminal className="text-indigo-400" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Criador de Conteúdo Rápido</h3>
                  <p className="text-slate-400 text-sm">Gere roteiros cirúrgicos de 60-70 segundos.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Tópico ou Notícia do Vídeo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Como remover fundo de vídeo em 1 clique..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg placeholder:text-slate-600"
                      value={scriptTopic}
                      onChange={(e) => setScriptTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Formato do Vídeo</label>
                    <div className="grid grid-cols-2 gap-3">
                      <FormatButton 
                        active={contentType === ContentType.REACTION} 
                        onClick={() => setContentType(ContentType.REACTION)}
                        icon={<Zap size={20} />}
                        label="Reação/Remix AI"
                        sub="Baseado em notícias reais"
                      />
                      <FormatButton 
                        active={contentType === ContentType.TECH_TIP} 
                        onClick={() => setContentType(ContentType.TECH_TIP)}
                        icon={<Cpu size={20} />}
                        label="Dica Tech"
                        sub="Estilo Thiago Augusto"
                      />
                      <FormatButton 
                        active={contentType === ContentType.SECURITY_ALARM} 
                        onClick={() => setContentType(ContentType.SECURITY_ALARM)}
                        icon={<ShieldCheck size={20} />}
                        label="Segurança"
                        sub="Alerta de proteção"
                      />
                      <FormatButton 
                        active={contentType === ContentType.GADGET_REVIEW} 
                        onClick={() => setContentType(ContentType.GADGET_REVIEW)}
                        icon={<Sparkles size={20} />}
                        label="Gadgets"
                        sub="Reviews rápidos"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerateScript}
                    disabled={loading || !scriptTopic}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 text-xl"
                  >
                    {loading ? 'Gerando inteligência...' : 'Gerar Roteiro Viral (60-70s)'}
                  </button>
                </div>
                
                <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <Video className="text-indigo-400" size={40} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">Padrão @jornadatop & @jefdicastech</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Nossos roteiros são calibrados para manter a retenção alta. <br/>
                    <b>Gancho (3s)</b> → <b>Conteúdo (55s)</b> → <b>CTA (2s)</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex items-center gap-4">
              <Zap className="text-indigo-400" size={24} />
              <div>
                <p className="font-bold text-indigo-300">Filtro: 1 Milhão+ Views</p>
                <p className="text-sm text-indigo-400/80">Mostrando apenas vídeos que realmente explodiram recentemente.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trends.map((trend, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all group">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-4 py-1.5 bg-indigo-500 text-white text-xs font-black rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                        {trend.viewCount}
                      </span>
                      <a href={trend.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                        <ExternalLink size={24} />
                      </a>
                    </div>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-indigo-400 transition-colors">{trend.title}</h3>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2 flex items-center gap-2">
                        <Sparkles size={14} /> Estratégia Recomendada
                      </h4>
                      <p className="text-slate-300 leading-relaxed">{trend.strategy}</p>
                    </div>
                    <button 
                      onClick={() => { setScriptTopic(trend.title); handleGenerateScript(); }}
                      className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold transition-all border border-slate-700"
                    >
                      Gerar roteiro baseado nessa trend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scripts' && generatedScript && (
          <div className="max-w-4xl mx-auto space-y-6 mb-20 animate-in zoom-in-95 duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-10">
                 <div className="bg-indigo-600/10 p-4 rounded-3xl border border-indigo-500/20 text-center">
                    <span className="text-[10px] text-indigo-400 font-black uppercase block mb-1">Viral Score</span>
                    <div className="text-4xl font-black text-indigo-400">{generatedScript.viralScore}</div>
                 </div>
              </div>

              <div className="mb-10 pb-6 border-b border-slate-800">
                <h3 className="text-4xl font-black mb-4 leading-tight">{generatedScript.title}</h3>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 bg-slate-800 text-indigo-300 px-4 py-2 rounded-xl text-sm font-black border border-slate-700">
                    <Clock size={16} /> {generatedScript.estimatedDuration}
                  </div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                    {generatedScript.wordCount} Palavras
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h4 className="text-indigo-400 font-black mb-4 flex items-center gap-2 tracking-widest text-xs uppercase">
                    <Zap size={18} /> Gancho (00:00 - 00:03)
                  </h4>
                  <p className="text-3xl italic font-black text-white leading-snug bg-indigo-500/10 p-8 rounded-[2rem] border-l-8 border-indigo-500 shadow-inner">
                    "{generatedScript.hook}"
                  </p>
                </section>

                <section>
                  <h4 className="text-slate-400 font-black mb-4 flex items-center gap-2 tracking-widest text-xs uppercase">
                    <Terminal size={18} /> Roteiro Completo (Locução)
                  </h4>
                  <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700/50">
                    <p className="text-2xl leading-relaxed text-slate-200 font-medium whitespace-pre-line">
                      {generatedScript.body}
                    </p>
                  </div>
                </section>

                {generatedScript.generatedImages && generatedScript.generatedImages.length > 0 && (
                  <section>
                    <h4 className="text-cyan-400 font-black mb-6 flex items-center gap-2 tracking-widest text-xs uppercase">
                      <ImageIcon size={18} /> Fundo Visual (Sugestão IA)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {generatedScript.generatedImages.map((img, i) => (
                        <div key={i} className="aspect-[9/16] rounded-3xl overflow-hidden border border-slate-700 relative group">
                          <img src={img} alt="Background" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs font-bold text-white uppercase">Cena {i+1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h4 className="text-emerald-400 font-black mb-4 tracking-widest text-xs uppercase">Encerramento (CTA)</h4>
                  <p className="text-2xl font-black text-emerald-100 bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 text-center">
                    {generatedScript.cta}
                  </p>
                </section>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => copyToClipboard(`${generatedScript.hook}\n\n${generatedScript.body}\n\n${generatedScript.cta}`)}
                className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xl transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3"
              >
                <Copy size={28} /> Copiar Tudo
              </button>
              <button 
                onClick={() => setGeneratedScript(null)}
                className="flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-3xl font-bold text-xl transition-all border border-slate-700"
              >
                Voltar / Novo
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 max-w-5xl mx-auto mb-20">
            <h3 className="text-3xl font-black mb-10 flex items-center gap-4">
              <Users className="text-indigo-400" size={36} />
              Elite da Tecnologia (Benchmarking)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
               <ProfileBadge name="@jornadatop" label="Thiago Augusto" color="bg-pink-600" />
               <ProfileBadge name="@jefdicastech" label="Jeferson" color="bg-blue-600" />
               <ProfileBadge name="@bernardopasqual" label="Bernardo" color="bg-purple-600" />
               <ProfileBadge name="@oficial_tech" label="Oficial Tech" color="bg-emerald-600" />
            </div>

            <div className="bg-slate-800/30 p-10 rounded-[2.5rem] border border-slate-700/50">
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-line text-slate-300 text-xl leading-relaxed font-medium">
                  {analysis || "Analisando métricas de retenção dos grandes perfis..."}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper Components
const SidebarLink: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
  >
    {icon}
    <span className="font-bold text-lg">{label}</span>
  </button>
);

const FormatButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, sub: string }> = ({ active, onClick, icon, label, sub }) => (
  <button 
    onClick={onClick}
    className={`p-5 rounded-[1.5rem] border flex flex-col items-start gap-2 transition-all text-left ${active ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-700 hover:border-slate-600 bg-slate-800/40'}`}
  >
    <div className={`p-2 rounded-lg ${active ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
      {icon}
    </div>
    <div className="mt-2">
      <span className="text-sm font-black block leading-none mb-1">{label}</span>
      <span className="text-[10px] text-slate-500 font-bold uppercase">{sub}</span>
    </div>
  </button>
);

const ProfileBadge: React.FC<{ name: string, label: string, color: string }> = ({ name, label, color }) => (
  <div className="flex flex-col items-center gap-3 group">
    <div className={`w-20 h-20 rounded-[2rem] ${color} flex items-center justify-center text-white text-3xl font-black shadow-xl group-hover:scale-110 transition-all duration-500 cursor-help ring-4 ring-white/5`}>
      {name.substring(1, 2).toUpperCase()}
    </div>
    <div className="text-center">
      <span className="text-sm font-black text-white block">{name}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
    </div>
  </div>
);

export default App;
