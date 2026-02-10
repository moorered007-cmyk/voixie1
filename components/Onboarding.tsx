import React, { useState } from 'react';
import { Globe, Phone, CheckCircle2, Loader2, Building2, AlignLeft, CreditCard, Play, Pause, Mic } from 'lucide-react';
import { generateBusinessProfile } from '../services/geminiService';
import { initiateCheckout } from '../services/stripeService';
import { BusinessProfile, SubscriptionTier } from '../types';
import { TIERS, VOICE_OPTIONS } from '../constants';

interface Props {
  onComplete: (profile: BusinessProfile) => void;
  onCancel: () => void;
}

const Onboarding: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Voice State
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[0].id);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    phone: '',
    description: ''
  });

  const [generatedProfile, setGeneratedProfile] = useState<Partial<BusinessProfile> | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const profile = await generateBusinessProfile(
      formData.name, 
      useManualInput ? '' : formData.url, 
      useManualInput ? formData.description : undefined
    );
    // Initialize profile with default voice if not present
    setGeneratedProfile({ ...profile, voiceId: VOICE_OPTIONS[0].id });
    setLoading(false);
    setStep(2);
  };

  const handleVoiceSelection = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    // Requirement: Store the selected voice ID in the generatedProfile state
    if (generatedProfile) {
      setGeneratedProfile({ ...generatedProfile, voiceId });
    }
  };

  const handlePlaySample = (voice: typeof VOICE_OPTIONS[0]) => {
    window.speechSynthesis.cancel();
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(voice.sampleText);
    // Simple heuristic for demo purposes
    utterance.pitch = voice.gender === 'Female' ? 1.0 : 0.9;
    utterance.rate = 0.95;
    
    // Attempt to pick a suitable system voice
    const voices = window.speechSynthesis.getVoices();
    const specific = voices.find(v => v.name.includes(voice.name) || (voice.gender === 'Female' ? v.name.includes('Female') : v.name.includes('Male')));
    if(specific) utterance.voice = specific;

    utterance.onend = () => setPlayingVoiceId(null);
    setPlayingVoiceId(voice.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleTierSelection = async (tier: any) => {
    if (!generatedProfile) return;
    setCheckoutLoading(tier.id);
    
    // Select price ID based on billing cycle
    const priceId = billingCycle === 'yearly' ? tier.stripePriceIdYearly : tier.stripePriceId;
    
    const result = await initiateCheckout(tier.id, priceId, tier.trialDays > 0);
    setCheckoutLoading(null);

    if (result.success) {
      const finalProfile: BusinessProfile = {
        name: formData.name,
        url: useManualInput ? 'No Website' : formData.url,
        phone: formData.phone,
        industry: generatedProfile.industry || 'Unknown',
        description: generatedProfile.description || '',
        hours: generatedProfile.hours || '',
        services: generatedProfile.services || [],
        tier: tier.id,
        // Ensure we use the voiceId stored in generatedProfile, falling back to local state if needed
        voiceId: generatedProfile.voiceId || selectedVoiceId
      };
      onComplete(finalProfile);
    } else {
      alert(result.error || "Checkout failed");
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-violet opacity-20 blur-[128px] rounded-full"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-gold opacity-10 blur-[128px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-10">
           <h2 className="text-3xl font-serif text-white mb-2">
             {step === 1 ? "Initialize Concierge" : step === 2 ? "Verify Intelligence" : step === 3 ? "Select Voice Persona" : "Select Membership"}
           </h2>
           <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-luxury-gold' : 'w-4 bg-white/10'}`}></div>
              ))}
           </div>
        </div>

        <div className="bg-luxury-charcoal border border-white/10 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          
          {/* STEP 1: INPUT */}
          {step === 1 && (
            <form onSubmit={handleScan} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs font-bold text-luxury-gold uppercase tracking-widest mb-2">Business Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-0 top-3 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-600"
                      placeholder="e.g. The Grand Hotel"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-luxury-gold uppercase tracking-widest mb-2">Direct Line</label>
                  <div className="relative">
                    <Phone className="absolute left-0 top-3 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="tel"
                      required
                      className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-600"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                   <label className="text-xs font-bold text-luxury-gold uppercase tracking-widest">
                     {useManualInput ? 'Business Brief' : 'Digital Presence'}
                   </label>
                   <button 
                     type="button"
                     onClick={() => setUseManualInput(!useManualInput)}
                     className="text-xs text-gray-400 hover:text-white underline decoration-luxury-gold/50"
                   >
                      {useManualInput ? 'Switch to Website URL' : 'Switch to Manual Entry'}
                   </button>
                </div>

                {!useManualInput ? (
                  <div className="relative group animate-fade-in">
                    <Globe className="absolute left-0 top-3 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="url"
                      required={!useManualInput}
                      className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-600"
                      placeholder="https://example.com"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                    />
                  </div>
                ) : (
                  <div className="relative group animate-fade-in">
                    <AlignLeft className="absolute left-0 top-3 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <textarea
                      required={useManualInput}
                      rows={3}
                      className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-600 resize-none"
                      placeholder="Briefly describe your services and clientele..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-serif font-bold uppercase tracking-widest py-4 hover:bg-luxury-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin w-4 h-4" /> Analyzing...</>
                  ) : (
                    'Generate Profile'
                  )}
                </button>
                <button onClick={onCancel} type="button" className="w-full text-center text-xs text-gray-500 hover:text-white mt-6 tracking-widest uppercase">Abort Setup</button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFICATION */}
          {step === 2 && generatedProfile && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-l-2 border-luxury-gold pl-6 py-2">
                <h3 className="text-xl font-serif text-white">Profile Generated</h3>
                <p className="text-sm text-gray-400">Please review the extracted intelligence.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 border border-white/5">
                    <span className="block text-xs text-luxury-gold uppercase tracking-widest mb-1">Industry</span>
                    <span className="text-white font-serif">{generatedProfile.industry}</span>
                  </div>
                  <div className="bg-white/5 p-4 border border-white/5">
                    <span className="block text-xs text-luxury-gold uppercase tracking-widest mb-1">Hours</span>
                    <span className="text-white font-serif">{generatedProfile.hours}</span>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 border border-white/5">
                  <span className="block text-xs text-luxury-gold uppercase tracking-widest mb-1">Description</span>
                  <p className="text-gray-300 text-sm font-light leading-relaxed">{generatedProfile.description}</p>
                </div>

                <div className="bg-white/5 p-4 border border-white/5">
                  <span className="block text-xs text-luxury-gold uppercase tracking-widest mb-2">Services</span>
                  <div className="flex flex-wrap gap-2">
                    {generatedProfile.services?.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 text-white text-xs tracking-wide">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full bg-luxury-gold text-black font-serif font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors duration-300"
              >
                Confirm Intelligence
              </button>
            </div>
          )}

          {/* STEP 3: VOICE SELECTION */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-6">
                 <Mic className="w-8 h-8 text-luxury-gold mx-auto mb-4" />
                 <h3 className="text-xl font-serif text-white mb-2">Select Your Concierge Voice</h3>
                 <p className="text-sm text-gray-400">Choose a persona that aligns with your brand identity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VOICE_OPTIONS.map(voice => (
                  <div 
                    key={voice.id}
                    onClick={() => handleVoiceSelection(voice.id)}
                    className={`p-4 border transition-all duration-200 cursor-pointer ${
                      selectedVoiceId === voice.id 
                      ? 'bg-white/10 border-luxury-gold shadow-lg shadow-luxury-gold/10' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold ${selectedVoiceId === voice.id ? 'bg-luxury-gold text-black' : 'bg-black text-gray-500'}`}>
                          {voice.tone}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePlaySample(voice); }}
                          className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                        >
                          {playingVoiceId === voice.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                        </button>
                     </div>
                     <h4 className="text-lg font-serif text-white mb-1">{voice.name}</h4>
                     <p className="text-xs text-gray-400 font-light leading-relaxed h-10">{voice.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest py-4 hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-luxury-gold text-black font-serif font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors duration-300"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PRICING */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="flex justify-center items-center gap-4 mb-8">
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

              <div className="grid gap-6">
                {TIERS.map((tier: any) => (
                  <div 
                    key={tier.id}
                    onClick={() => handleTierSelection(tier)}
                    className={`relative p-6 border transition-all duration-300 cursor-pointer group ${
                      tier.recommended 
                        ? 'bg-gradient-to-r from-luxury-violet/20 to-luxury-black border-luxury-gold/50' 
                        : 'bg-transparent border-white/10 hover:border-luxury-gold/30'
                    } ${checkoutLoading && checkoutLoading !== tier.id ? 'opacity-30 pointer-events-none' : ''}`}
                  >
                    {tier.recommended && (
                      <div className="absolute top-0 right-0 bg-luxury-gold text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                        Preferred
                      </div>
                    )}
                    
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <h3 className="text-xl font-serif text-white group-hover:text-luxury-gold transition-colors">{tier.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{tier.features[0]}</p>
                      </div>
                      <p className="text-2xl font-serif text-white">
                        ${billingCycle === 'monthly' ? tier.price : tier.priceYearly}
                        <span className="text-sm text-gray-500 font-sans">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </p>
                    </div>

                    <button 
                      disabled={checkoutLoading === tier.id}
                      className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                        tier.recommended 
                          ? 'bg-luxury-gold text-black hover:bg-white' 
                          : 'bg-white/5 text-white hover:bg-white hover:text-black'
                      }`}
                    >
                      {checkoutLoading === tier.id ? 'Processing...' : tier.trialDays > 0 ? 'Start Free Trial' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;