import React, { useState, useEffect, useRef } from 'react';
import { Mic, Globe, ShieldCheck, ArrowRight, Play, Star, X, Phone, PhoneOff, Loader2, Sparkles, Building2, Link, Check, Delete, MicOff, Volume2, LayoutGrid, UserPlus } from 'lucide-react';
import { generateDemoScript } from '../services/geminiService';
import { TIERS } from '../constants';

interface Props {
  onGetStarted: () => void;
}

interface ScriptLine {
  role: string;
  text: string;
  label?: string;
}

const KEYPAD = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
  { num: '*', sub: '' },
  { num: '0', sub: '+' },
  { num: '#', sub: '' },
];

const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
  // Added 'DIALER' state
  const [demoMode, setDemoMode] = useState<'OFF' | 'INPUT' | 'LOADING' | 'DIALER' | 'CALL'>('OFF');
  
  // Pricing State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Custom Demo State
  const [customBusinessName, setCustomBusinessName] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [script, setScript] = useState<ScriptLine[]>([]);
  
  // Dialer State
  const [dialedNumber, setDialedNumber] = useState('');
  
  // Call State
  const [callStatus, setCallStatus] = useState<'DIALING' | 'CONNECTED' | 'ENDED'>('DIALING');
  const [callDuration, setCallDuration] = useState(0);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Audio Refs
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (callStatus === 'CONNECTED') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset state when closing
  const closeDemo = () => {
    if (synth.current) synth.current.cancel();
    setDemoMode('OFF');
    setCallStatus('DIALING');
    setScriptIndex(0);
    setScript([]);
    setCustomBusinessName('');
    setCustomBusinessType('');
    setDialedNumber('');
    setCallDuration(0);
  };

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoMode('LOADING');
    const generatedScript = await generateDemoScript(customBusinessName, customBusinessType);
    setScript(generatedScript as ScriptLine[]);
    setDemoMode('DIALER'); // Go to keypad instead of generic ready screen
  };

  const handleDigitClick = (digit: string) => {
    if (dialedNumber.length < 15) {
      setDialedNumber(prev => prev + digit);
    }
  };

  const handleDeleteDigit = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const startCall = () => {
    if (dialedNumber.length < 3) return; // Simple validation
    setDemoMode('CALL');
    setCallDuration(0);
  };

  // Speak Function - SIMPLIFIED / STANDARD VOICE
  const speak = (text: string) => {
    if (!synth.current) return;
    
    // Cancel previous speech
    synth.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.current.getVoices();

    // Strategy: Find a premium/natural sounding voice for professional concierge persona
    // Priority: Google UK English Female (Professional/Concierge), Google US English (Mobile/Chrome), Samantha (Mac), Microsoft Zira (Windows)
    const preferredVoice = voices.find(v => 
      v.name.includes('Google UK English Female') || 
      (v.name.includes('Google US English') && !v.name.includes('Male')) || 
      v.name.includes('Samantha') || 
      (v.name.includes('Microsoft Zira') && v.lang === 'en-US')
    ) || voices.find(v => v.name.includes('Female') || v.lang === 'en-US');

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Professional & Warm settings
    // 0.9 rate for articulate, composed delivery
    utterance.rate = 0.9; 
    // Pitch: 1.0 (Neutral) is often warmer and more professional than elevated pitch
    utterance.pitch = 1.0;

    setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    
    synth.current.speak(utterance);
  };

  // Start Call Sequence
  useEffect(() => {
    if (demoMode === 'CALL' && script.length > 0) {
      setCallStatus('DIALING');
      setScriptIndex(0);

      // Simulate dialing delay then connect
      const timer = setTimeout(() => {
        setCallStatus('CONNECTED');
        // AI speaks first line
        const firstLine = script[0];
        if (firstLine && firstLine.role === 'ai') {
          speak(firstLine.text);
        }
      }, 2000); // 2 second ring time

      return () => clearTimeout(timer);
    }
  }, [demoMode, script]);

  const handleUserAction = () => {
    if (script.length === 0) return;
    
    // 1. User "Speaks" (Advance index to user line)
    const nextIdx = scriptIndex + 1;
    if (nextIdx >= script.length) return;
    
    setScriptIndex(nextIdx); // Show user text

    // 2. AI Responds after delay
    setTimeout(() => {
       const aiIdx = nextIdx + 1;
       if (aiIdx < script.length) {
         setScriptIndex(aiIdx);
         speak(script[aiIdx].text);
       } else {
         // End of script
         setTimeout(() => setCallStatus('ENDED'), 2000);
       }
    }, 1000); // 1s delay for "processing" feel
  };

  const currentLine = script[scriptIndex];
  const nextUserLine = scriptIndex + 1 < script.length ? script[scriptIndex + 1] : null;

  return (
    <div className="min-h-screen bg-luxury-black text-white selection:bg-luxury-gold selection:text-black">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-luxury-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold to-luxury-goldDim rounded-full flex items-center justify-center shadow-lg shadow-luxury-gold/20">
              <Mic className="text-black w-5 h-5" />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-wide">VOIXI<span className="text-luxury-gold">1</span></span>
          </div>
          <div className="hidden md:flex gap-10 text-sm font-medium text-gray-400 tracking-widest uppercase">
            <a href="#features" className="hover:text-luxury-gold transition-colors duration-300">Expertise</a>
            <a href="#demo" onClick={() => setDemoMode('INPUT')} className="hover:text-luxury-gold transition-colors duration-300">Live Demo</a>
            <a href="#pricing" className="hover:text-luxury-gold transition-colors duration-300">Membership</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="bg-white text-black px-8 py-3 rounded-none font-serif font-bold hover:bg-luxury-gold transition-colors duration-300"
          >
            Start Concierge
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-violet opacity-20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-luxury-gold opacity-10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 border border-luxury-gold/30 rounded-full px-4 py-1.5 bg-luxury-gold/5">
              <Star className="w-3 h-3 text-luxury-gold fill-luxury-gold" />
              <span className="text-xs font-medium text-luxury-gold tracking-widest uppercase">The Gold Standard in AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] text-white">
              The <span className="italic text-luxury-gold">Art</span> of <br/>
              Business Automation.
            </h1>
            
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed font-light">
              Elevate your front desk with Voixi1. An AI concierge so sophisticated, it doesn't just answer calls—it curates experiences and maximizes revenue.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={onGetStarted}
                className="group flex items-center justify-center gap-3 bg-luxury-gold text-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white transition-all duration-300"
              >
                Deploy Concierge <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setDemoMode('INPUT')}
                className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white text-sm font-bold tracking-widest uppercase hover:border-luxury-gold hover:text-luxury-gold transition-all duration-300"
              >
                <Phone className="w-4 h-4" /> Call AI Agent
              </button>
            </div>
          </div>
          
          {/* Abstract Luxury Visual */}
          <div className="relative group hidden md:block">
            <div className="absolute -inset-1 bg-gradient-to-r from-luxury-gold to-luxury-violet rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-luxury-charcoal border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
               <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                 <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-8 h-8 text-luxury-gold" />
                 </div>
                 <h3 className="text-2xl font-serif text-white">"Good afternoon, how may I assist you?"</h3>
                 <p className="text-gray-400 max-w-xs">Experience the difference of a neural voice engine trained on millions of hospitality interactions.</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-luxury-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-luxury-violet/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
           <span className="text-luxury-gold text-xs font-bold uppercase tracking-widest mb-4 block">Interactive Demo</span>
           <h2 className="text-4xl md:text-5xl font-serif text-white mb-8">Experience the Difference</h2>
           <p className="text-gray-400 max-w-2xl mx-auto mb-12 font-light">
             Don't just take our word for it. Configure a custom agent for your business in seconds and speak with it directly.
           </p>
           
           <div className="flex justify-center">
             <button 
                onClick={() => setDemoMode('INPUT')}
                className="relative group bg-luxury-charcoal hover:bg-luxury-gold border border-white/10 hover:border-transparent text-white hover:text-black px-12 py-8 rounded-2xl transition-all duration-500 shadow-2xl"
             >
                <div className="flex flex-col items-center gap-4">
                  <Phone className="w-12 h-12 mb-2" />
                  <span className="text-xl font-serif">Launch Phone Simulator</span>
                  <span className="text-xs uppercase tracking-widest opacity-60">Click to Dial</span>
                </div>
             </button>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-luxury-charcoal relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">Excellence in every interaction</h2>
            <div className="h-1 w-24 bg-luxury-gold mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Globe, 
                title: 'Global Intelligence', 
                desc: 'Instantly assimilates your brand identity from your digital presence to build a bespoke knowledge base.' 
              },
              { 
                icon: Mic, 
                title: 'Fidelity Voice', 
                desc: 'Indistinguishable from a human professional. Latency under 800ms for seamless, natural conversation.' 
              },
              { 
                icon: ShieldCheck, 
                title: 'Revenue Guard', 
                desc: 'Our proprietary engine analyzes schedule gaps and inventory to autonomously recover lost revenue.' 
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-luxury-black border border-white/5 hover:border-luxury-gold/30 transition-colors duration-500">
                <feature.icon className="w-10 h-10 text-luxury-gold mb-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-serif text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-luxury-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
             <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">Membership Tiers</h2>
             <p className="text-gray-400 font-light mb-8">Select the level of intelligence required for your operations.</p>
             
             {/* Billing Toggle */}
             <div className="flex justify-center items-center gap-4">
                <span className={`text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`} onClick={() => setBillingCycle('monthly')}>Monthly</span>
                <div 
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="w-14 h-7 bg-white/10 rounded-full relative cursor-pointer border border-white/10"
                >
                   <div className={`absolute top-1 w-5 h-5 bg-luxury-gold rounded-full transition-all duration-300 shadow-sm ${billingCycle === 'monthly' ? 'left-1' : 'left-8'}`}></div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`} onClick={() => setBillingCycle('yearly')}>
                   Yearly <span className="text-luxury-gold ml-1 text-[10px]">(2 Months Free)</span>
                </span>
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TIERS.map((tier) => (
              <div 
                key={tier.id}
                className={`relative p-8 border flex flex-col transition-all duration-300 ${
                  tier.recommended 
                    ? 'bg-gradient-to-b from-luxury-charcoal to-black border-luxury-gold shadow-2xl shadow-luxury-gold/5 transform md:-translate-y-4' 
                    : 'bg-transparent border-white/10 hover:border-white/20'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-luxury-gold text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1 shadow-lg">
                    Gold Standard
                  </div>
                )}
                
                <div className="mb-8 border-b border-white/5 pb-8">
                  <h3 className="text-xl font-serif text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif text-white">
                      ${billingCycle === 'monthly' ? tier.price : tier.priceYearly}
                    </span>
                    <span className="text-sm text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-luxury-gold mt-0.5 flex-shrink-0" />
                      <span className="font-light">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onGetStarted}
                  className={`w-full py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                    tier.recommended 
                      ? 'bg-luxury-gold text-black hover:bg-white' 
                      : 'bg-white/5 text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {tier.trialDays > 0 ? `Start ${tier.trialDays}-Day Trial` : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="font-serif text-lg text-white">VOIXI<span className="text-luxury-gold">1</span></span>
            <span className="mx-2">•</span>
            <span>Est. 2024</span>
          </div>
          <div className="flex gap-8 tracking-widest uppercase text-xs">
            <a href="#" className="hover:text-luxury-gold transition">Privacy</a>
            <a href="#" className="hover:text-luxury-gold transition">Terms</a>
            <button onClick={onGetStarted} className="hover:text-luxury-gold transition">Concierge</button>
          </div>
        </div>
      </footer>

      {/* CALL INTERFACE MODAL */}
      {demoMode !== 'OFF' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
           
           {/* STEP 1: INPUT BUSINESS INFO */}
           {demoMode === 'INPUT' && (
             <div className="relative w-full max-w-lg bg-luxury-charcoal border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                <button onClick={closeDemo} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
                <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-luxury-gold" />
                </div>
                <h3 className="text-3xl font-serif text-white mb-2">Configure Concierge</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">
                  Enter your business details to initialize a custom AI agent.
                </p>
                
                <form onSubmit={handleGenerateScript} className="space-y-6 max-w-md mx-auto text-left">
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-xs font-bold text-luxury-gold uppercase tracking-widest mb-2">Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-0 top-3 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                          type="text"
                          required
                          className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-600"
                          placeholder="e.g. Apex Legal"
                          value={customBusinessName}
                          onChange={(e) => setCustomBusinessName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-xs font-bold text-luxury-gold uppercase tracking-widest mb-2">Website URL (Optional)</label>
                      <div className="relative">
                        <Link className="absolute left-0 top-3 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                          type="url"
                          className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-600"
                          placeholder="https://example.com"
                          value={customBusinessType}
                          onChange={(e) => setCustomBusinessType(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-luxury-gold text-black font-serif font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors duration-300 mt-6 shadow-lg shadow-luxury-gold/10"
                  >
                    Setup Agent
                  </button>
                </form>
             </div>
           )}

           {/* STEP 2: LOADING */}
           {demoMode === 'LOADING' && (
              <div className="relative w-full max-w-lg bg-luxury-charcoal border border-white/10 rounded-2xl shadow-2xl p-12 text-center flex flex-col items-center">
                 <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-6" />
                 <h3 className="text-xl font-serif text-white mb-2">Training Neural Network</h3>
                 <p className="text-gray-400 text-sm">Synthesizing voice profile for {customBusinessName}...</p>
              </div>
           )}

           {/* STEP 3: DIALER INTERFACE (NEW) */}
           {demoMode === 'DIALER' && (
             <div className="relative w-full max-w-[380px] bg-black border-[6px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden h-[780px] flex flex-col animate-fade-in">
                 {/* Top Controls */}
                 <div className="flex justify-between items-center mb-8 pt-10 px-6">
                    <button onClick={closeDemo} className="text-gray-500 hover:text-white text-sm">Cancel</button>
                 </div>

                 {/* Number Display */}
                 <div className="mb-8 text-center px-6">
                    <input 
                      type="text" 
                      readOnly 
                      value={dialedNumber} 
                      placeholder=""
                      className="bg-transparent text-center w-full text-4xl text-white font-light focus:outline-none mb-2 tracking-widest" 
                    />
                    {dialedNumber.length > 0 && (
                       <button onClick={handleDeleteDigit} className="text-xs text-luxury-gold uppercase tracking-widest hover:text-white transition-colors">
                         Delete
                       </button>
                    )}
                 </div>

                 {/* Keypad */}
                 <div className="grid grid-cols-3 gap-y-6 gap-x-6 px-6 mb-8 flex-1 content-center">
                    {KEYPAD.map((key) => (
                       <button 
                         key={key.num} 
                         onClick={() => handleDigitClick(key.num)}
                         className="w-20 h-20 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] active:bg-[#48484a] active:scale-95 flex flex-col items-center justify-center transition-all duration-150 mx-auto shadow-2xl border border-white/5"
                       >
                         <span className="text-3xl font-light text-white leading-none">{key.num}</span>
                         {key.sub && <span className="text-[9px] font-bold text-white/50 tracking-[2px] mt-0.5">{key.sub}</span>}
                       </button>
                    ))}
                 </div>

                 {/* Call Button */}
                 <div className="mt-auto mb-12 flex justify-center">
                    <button 
                      onClick={startCall}
                      disabled={dialedNumber.length < 3}
                      className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-lg shadow-green-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <Phone className="w-8 h-8 text-white fill-current" />
                    </button>
                 </div>
             </div>
           )}

           {/* STEP 4: ACTIVE CALL INTERFACE */}
           {demoMode === 'CALL' && (
             <div className="relative w-full max-w-[380px] bg-black border-[6px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden h-[780px] flex flex-col animate-fade-in">
                {/* Phone Notch/Status Bar */}
                <div className="h-10 bg-black w-full flex justify-between items-center px-8 text-[12px] text-white font-medium z-10 pt-4">
                   <span>9:41</span>
                   <div className="flex gap-1.5">
                     <div className="w-4 h-2.5 bg-white rounded-[2px]"></div>
                   </div>
                </div>

                {/* Main Call Screen */}
                <div className="flex-1 flex flex-col items-center pt-20 pb-12 px-6 relative bg-gradient-to-b from-[#1c1c1e] to-black">
                   
                   {/* Caller Info */}
                   <div className="relative z-10 text-center w-full mb-auto">
                      <div className="w-24 h-24 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-50"></div>
                          <Building2 className="w-10 h-10 text-white/80 relative z-10" />
                          {callStatus === 'CONNECTED' && (
                            <div className="absolute inset-0 border-2 border-green-500/50 rounded-full animate-pulse"></div>
                          )}
                      </div>
                      <h2 className="text-3xl font-sans font-light text-white mb-3">{customBusinessName}</h2>
                      
                      <div className="h-8 flex items-center justify-center">
                        {callStatus === 'DIALING' && <p className="text-white/60 text-lg animate-pulse">calling...</p>}
                        {callStatus === 'CONNECTED' && (
                          <div className="bg-white/10 px-4 py-1 rounded-full backdrop-blur-md border border-white/10">
                            <p className="text-green-400 text-lg font-mono tracking-widest">{formatTime(callDuration)}</p>
                          </div>
                        )}
                        {callStatus === 'ENDED' && <p className="text-red-500 text-lg font-medium">Call Ended</p>}
                      </div>
                   </div>

                   {/* Controls Grid */}
                   <div className="w-full px-4 mb-12">
                      <div className="grid grid-cols-3 gap-6 mb-8">
                         {/* Row 1 */}
                         <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform duration-100 cursor-pointer hover:bg-white/20">
                             <MicOff className="w-7 h-7 text-white" />
                           </div>
                           <span className="text-xs text-white">Mute</span>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform duration-100 cursor-pointer hover:bg-white/20">
                             <LayoutGrid className="w-7 h-7 text-white" />
                           </div>
                           <span className="text-xs text-white">Keypad</span>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 transition-transform duration-100 cursor-pointer">
                             <Volume2 className="w-7 h-7" />
                           </div>
                           <span className="text-xs text-white font-bold">Speaker</span>
                         </div>
                         {/* Row 2 */}
                         <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform duration-100 cursor-pointer hover:bg-white/20">
                             <UserPlus className="w-7 h-7 text-white" />
                           </div>
                           <span className="text-xs text-white">Add Call</span>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform duration-100 cursor-pointer hover:bg-white/20">
                             <Phone className="w-7 h-7 text-white" />
                           </div>
                           <span className="text-xs text-white">FaceTime</span>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform duration-100 cursor-pointer hover:bg-white/20">
                             <UserPlus className="w-7 h-7 text-white" />
                           </div>
                           <span className="text-xs text-white">Contacts</span>
                         </div>
                      </div>

                      {/* Interaction Area (Captions & Buttons) */}
                      <div className="w-full min-h-[60px] mb-8 relative z-10 flex flex-col items-center justify-center">
                        {currentLine && callStatus === 'CONNECTED' && (
                          <div className={`transition-all duration-300 ${currentLine.role === 'ai' ? 'opacity-100' : 'opacity-50'}`}>
                             {currentLine.role === 'ai' && <div className="flex gap-1 h-4 items-center mb-2 justify-center">
                               {[...Array(5)].map((_, i) => (
                                  <div key={i} className={`w-1 bg-green-500 rounded-full ${isAiSpeaking ? 'animate-bounce h-4' : 'h-1'}`} style={{animationDelay: `${i*0.1}s`}}></div>
                               ))}
                             </div>}
                          </div>
                        )}
                        
                        {callStatus === 'CONNECTED' && nextUserLine && !isAiSpeaking && currentLine?.role === 'ai' && (
                           <button 
                             onClick={handleUserAction}
                             className="bg-green-600/20 border border-green-500/50 text-green-400 px-6 py-2 rounded-full text-sm font-medium animate-pulse hover:bg-green-600 hover:text-white transition-colors"
                           >
                             Reply: "{nextUserLine.label}"
                           </button>
                        )}
                     </div>

                      {/* End Call */}
                      <div className="flex justify-center">
                         <button 
                           onClick={closeDemo}
                           className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors active:scale-90 duration-200"
                         >
                           <PhoneOff className="w-8 h-8 text-white fill-white" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}

        </div>
      )}
    </div>
  );
};

export default LandingPage;