
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Candidate } from '../types';
import { getAIResponse } from '../services/geminiService';

const ChatBot: React.FC<{ candidates: Candidate[] }> = ({ candidates }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ 
    role: 'ai', 
    text: 'Namaste! I am your Dhaka-17 Assistant. You can text me or click the phone icon for a real-time voice call in Banglish. আপনার জিজ্ঞাসার উত্তর দিতে আমি প্রস্তুত!' 
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio Context and Stream Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    const response = await getAIResponse(userMsg, candidates);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  // World-class Encoding/Decoding implementation as per guidelines
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  const startVoiceCall = async () => {
    setIsCalling(true);
    try {
      // Create a fresh instance for the call session
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.debug('Live session opened successfully');
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: initiate sendRealtimeInput solely after live.connect call resolves.
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(err => {
                console.error("Session send error:", err);
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch (e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: (e) => {
            console.debug('Live session closed:', e);
            setIsCalling(false);
          },
          onerror: (e) => {
            console.error('Live session error:', e);
            setIsCalling(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are the Dhaka-17 Election Assistant. 
          Constituency context: Gulshan, Banani, Baridhara, Cantonment. 
          Bilingual capability: Use Bengali and English mixed (Banglish). 
          Keep it very conversational and helpful. Speak in a friendly, professional Bangladeshi accent.`
        }
      });
    } catch (err) {
      console.error('Call initialization failed:', err);
      setIsCalling(false);
    }
  };

  const stopVoiceCall = () => {
    setIsCalling(false);
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) inputAudioContextRef.current.close().catch(() => {});
    if (outputAudioContextRef.current) outputAudioContextRef.current.close().catch(() => {});
    
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[550px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[32px] flex flex-col border border-slate-200 overflow-hidden relative transition-all duration-300">
          {/* Header */}
          <div className="bg-[#006a4e] p-5 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <span className="font-black text-sm block tracking-tight">AI ASSISTANT</span>
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">Dhaka-17 Live</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={isCalling ? stopVoiceCall : startVoiceCall}
                className={`${isCalling ? 'bg-red-500 animate-pulse' : 'bg-white/10'} p-2.5 rounded-2xl hover:bg-white/20 transition-all border border-white/5 active:scale-90`}
                title={isCalling ? "End Call" : "Start Voice Call"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </button>
              <button onClick={() => setIsOpen(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
          
          {isCalling ? (
            <div className="flex-grow bg-[#0f172a] flex flex-col items-center justify-center space-y-10 p-8 text-center">
              <div className="relative">
                <div className="w-40 h-40 bg-emerald-500/10 rounded-full animate-ping absolute -inset-0 opacity-20"></div>
                <div className="w-40 h-40 bg-emerald-600/20 rounded-full animate-pulse absolute -inset-0 opacity-40"></div>
                <div className="w-40 h-40 bg-emerald-700/80 backdrop-blur-xl rounded-full flex items-center justify-center relative z-10 border border-emerald-400/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]">
                   <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-white text-2xl font-black tracking-tight">Listening...</h3>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">Voice Connection Secure</p>
                <p className="text-slate-400 text-sm font-medium px-4">Ask about candidates, polling centers, or voting rules in Banglish.</p>
              </div>
              <button 
                onClick={stopVoiceCall} 
                className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-500/20 transition-all active:scale-95"
              >
                End Session
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-5 bg-slate-50/50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-[24px] px-5 py-3.5 text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                      m.role === 'user' ? 'bg-[#006a4e] text-white' : 'bg-white border border-slate-200 text-slate-800'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-[20px] px-4 py-2.5 shadow-sm">
                      <div className="flex space-x-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-grow bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()} 
                  className="bg-[#006a4e] text-white p-3 rounded-2xl shadow-lg shadow-emerald-900/10 hover:bg-emerald-800 disabled:opacity-50 disabled:scale-100 active:scale-90 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#006a4e] text-white w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-105 hover:bg-emerald-900 transition-all group relative border border-white/10"
        >
          <div className="absolute -top-1 -right-1 bg-[#f42a41] w-4 h-4 rounded-full border-2 border-white"></div>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
