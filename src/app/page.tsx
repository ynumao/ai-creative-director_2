"use client";

import { useState, useRef } from "react";
import { Sparkles, ArrowRight, Image as ImageIcon, Copy, Brain, Layout, Target, Upload, Link as LinkIcon, X, Check } from "lucide-react";
import Loader from "./components/Loader";

// Types
interface AnalysisResult {
  analysis: {
    design_impression: string;
    target_audience: string;
    structure_summary: string;
    price_strategy: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  three_c: {
    customer: string;
    competitor: string;
    company: string;
  };
  copies: { type: string; text: string }[];
  image_suggestion: {
    description: string;
    search_keywords: string;
  };
  banner_prompt: string;
  rationale: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 4 * 1024 * 1024) {
        setError("画像は4MB以下にしてください。");
        return;
      }
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルをアップロードしてください。");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setError("画像は4MB以下にしてください。");
        return;
      }
      processFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      setError("APIキーを入力してください。");
      return;
    }

    if (!previewUrl && !url) {
      setError("分析対象を指定してください（URL入力 または 画像アップロード）");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body: any = { apiKey };

      if (previewUrl) {
        const base64Data = previewUrl.split(",")[1];
        body.imageBase64 = base64Data;
      } else {
        body.url = url;
      }

      const res = await fetch("/api/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分析に失敗しました");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen bg-white text-[#1a1a1a] selection:bg-black selection:text-white flex flex-col items-center ${!result && !loading ? 'justify-center' : 'justify-start pt-20'} transition-all duration-500`}>
      <div className="w-full max-w-[70%] min-w-[320px] px-6 py-20">

        {/* Header */}
        <header className={`animate-fade-in relative z-10 text-center transition-all duration-500 mt-20 ${!result && !loading ? 'mb-20' : 'mb-24'}`}>
          <div className="border-b border-gray-200 pb-8 inline-block w-full">
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#E60012] mb-4">AI AGENT</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-none">
              AI CREATIVE DIRECTOR
            </h1>
          </div>
        </header>

        {/* Input Section */}
        {(!result || loading) && (
          <section className={`bg-white border border-gray-200 animate-fade-in delay-100 overflow-hidden w-full transition-all duration-500 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>

            <div className="p-10 md:p-16">
              <div className="grid md:grid-cols-2 gap-10 md:gap-16 relative">

                {/* Option A: URL */}
                <div className={`transition-all duration-300 relative group h-full flex flex-col justify-center
                    ${previewUrl ? 'opacity-40 grayscale' : 'opacity-100'}
                `}>
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-2 tracking-wide uppercase text-gray-500">
                    ターゲットURL
                  </h3>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full bg-gray-50 border border-gray-300 py-4 px-8 text-base focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={!!previewUrl}
                  />
                </div>

                {/* OR Divider (Absolute Centered) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-white border border-gray-200">
                  <span className="text-xs font-bold text-gray-400">or</span>
                </div>
                <div className="md:hidden flex items-center justify-center py-4">
                  <span className="text-sm font-bold text-gray-300">- or -</span>
                </div>

                {/* Option B: Image */}
                <div
                  className={`transition-all duration-300 relative cursor-pointer group min-h-[160px]
                        ${previewUrl ? 'bg-gray-50 border-2 border-black' : 'bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100'}
                    `}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    {previewUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={previewUrl} alt="Preview" className="max-h-32 object-contain drop-shadow-md" />
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); }}
                          className="absolute -top-3 -right-3 bg-white shadow-md p-1.5 hover:bg-black hover:text-white transition-colors border border-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-white px-2 py-1 text-[10px] font-bold text-black flex items-center gap-1 shadow-sm border border-gray-200">
                          <Check className="w-3 h-3" /> Ready
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-3 group-hover:text-black transition-colors" />
                        <p className="text-sm font-bold text-gray-500 group-hover:text-black">画像をアップロード</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: API Key & Action */}
            <div className="bg-gray-50 p-8 md:px-16 md:py-10 border-t border-gray-200 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gemini APIキー</label>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-[#E60012] hover:underline flex items-center gap-1">
                    キーを取得 <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  className="w-full bg-white border border-gray-300 py-3 px-6 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || (!url && !previewUrl) || !apiKey}
                  className="w-full md:w-[240px] bg-black text-white py-4 text-sm font-bold tracking-widest hover:bg-[#E60012] transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span>{loading ? "分析中..." : "分析を開始"}</span>
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 p-4 border-t border-red-100 text-center">
                <p className="text-xs text-red-600 font-bold">{error}</p>
              </div>
            )}
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 animate-fade-in flex justify-center">
            <Loader />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="animate-slide-up pb-64">

            <div className="grid md:grid-cols-2 gap-12">

              {/* Strategy Core */}
              <section className="border border-gray-200 p-20 bg-white hover-lift">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-8 h-8 bg-black flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-light tracking-tight">戦略コア</h2>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="label-badge mb-3">ターゲット層</div>
                    <p className="text-base leading-loose text-gray-700">{result.analysis.target_audience}</p>
                  </div>
                  <div className="section-divider"></div>
                  <div>
                    <div className="label-badge mb-3">デザイン印象</div>
                    <p className="text-base leading-loose text-gray-700">{result.analysis.design_impression}</p>
                  </div>
                  <div className="section-divider"></div>
                  <div>
                    <div className="label-badge mb-3">価格戦略</div>
                    <p className="text-base leading-loose text-gray-700">{result.analysis.price_strategy}</p>
                  </div>
                </div>
              </section>

              {/* Copywriting */}
              <section className="border border-gray-200 p-20 bg-white hover-lift">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-8 h-8 bg-[#E60012] flex items-center justify-center">
                    <Copy className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-light tracking-tight">コピーライティング</h2>
                </div>

                <div className="space-y-6">
                  {result.copies.map((copy, idx) => (
                    <div key={idx} className="group hover:bg-gray-50 p-4 -mx-4 transition-colors">
                      <div className="label-badge mb-3">{copy.type}</div>
                      <p className="text-lg font-medium leading-relaxed text-gray-900">{copy.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3C Analysis */}
              <section className="border border-gray-200 p-20 bg-white hover-lift">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-light tracking-tight">3C分析</h2>
                </div>

                <div className="space-y-8">
                  {Object.entries(result.three_c).map(([key, value]) => (
                    <div key={key}>
                      <div className="label-badge mb-3">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                      <p className="text-base leading-loose text-gray-700 border-l-2 border-[#E60012] pl-4">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SWOT Analysis */}
              <section className="border border-gray-200 p-20 bg-white hover-lift">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                    <Layout className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-light tracking-tight">SWOT分析</h2>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {Object.entries(result.swot).map(([key, values]) => (
                    <div key={key}>
                      <div className="label-badge mb-4">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                      <ul className="space-y-3">
                        {(values as string[]).map((v, i) => (
                          <li key={i} className="text-sm leading-loose text-gray-700 flex items-start gap-3">
                            <span className="w-1 h-1 bg-black mt-2 flex-shrink-0"></span>
                            <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Visual Direction - Full Width */}
              <section className="md:col-span-2 border border-gray-200 p-20 bg-white hover-lift">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-8 h-8 bg-black flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-light tracking-tight">ビジュアルディレクション</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <div className="label-badge mb-3">ビジュアルコンセプト</div>
                    <p className="text-lg leading-loose text-gray-900 mb-4">{result.image_suggestion.description}</p>
                    <p className="text-sm text-gray-400 font-mono tracking-wide">{result.image_suggestion.search_keywords}</p>
                  </div>
                  <div>
                    <div className="label-badge mb-3">選定理由</div>
                    <p className="text-base leading-loose text-gray-700">{result.rationale}</p>
                  </div>
                </div>
              </section>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
