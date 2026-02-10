import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PhoneCall, 
  TrendingUp, 
  Settings, 
  Bell, 
  LogOut, 
  Search,
  Calendar,
  Users,
  Download,
  Save,
  Radio,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  CreditCard,
  Lock,
  Plus,
  Star,
  Loader2,
  Mic,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Trash2,
  UserMinus,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { BusinessProfile, CallLog, RevenueInsight, SubscriptionTier, Employee, Shift } from '../types';
import { MOCK_CALL_LOGS, MOCK_CHART_DATA, INITIAL_INSIGHTS, MOCK_EMPLOYEES, MOCK_SHIFTS, VOICE_OPTIONS, TIERS } from '../constants';
import { generateRevenueInsights } from '../services/geminiService';

interface Props {
  profile: BusinessProfile;
  onLogout: () => void;
  onUpdateProfile?: (profile: BusinessProfile) => void;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Customer {
  name: string;
  phone: string;
  email: string;
  status: string;
  last: string;
  value: string;
  history: string[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CUSTOMERS: Customer[] = [
  {
    name: "Isabella V.",
    phone: "+1 (555) 010-9988",
    email: "isabella.v@example.com",
    status: "Active",
    last: "2 days ago",
    value: "$4,200",
    history: ["Booked Consultation", "Upgraded to Premium Package"]
  },
  {
    name: "James H.",
    phone: "+1 (555) 012-3456",
    email: "j.holden@example.com",
    status: "New",
    last: "5 hours ago",
    value: "$150",
    history: ["Inquired about availability", "Booked Introductory Session"]
  },
  {
    name: "Marcus A.",
    phone: "+1 (555) 019-8765",
    email: "marcus.a@example.com",
    status: "Inactive",
    last: "3 months ago",
    value: "$850",
    history: ["Completed 3 sessions", "Missed follow-up call"]
  },
  {
    name: "Elena R.",
    phone: "+1 (555) 021-4321",
    email: "elena.r@example.com",
    status: "Active",
    last: "1 day ago",
    value: "$2,100",
    history: ["Rescheduled appointment", "Purchased product kit"]
  }
];

const Dashboard: React.FC<Props> = ({ profile, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'revenue' | 'customers' | 'settings' | 'scheduling'>('overview');
  const [callLogs, setCallLogs] = useState<CallLog[]>(MOCK_CALL_LOGS);
  const [insights, setInsights] = useState<RevenueInsight[]>(INITIAL_INSIGHTS);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [activeCall, setActiveCall] = useState<Partial<CallLog> | null>(null);
  
  // UX State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Settings State
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Scheduling State
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Partial<Shift>>({});
  
  // Staff Management State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Stylist');

  useEffect(() => {
    const fetchAI = async () => {
      setIsGeneratingInsights(true);
      const newInsights = await generateRevenueInsights(callLogs, profile);
      if (newInsights.length > 0) {
        setInsights(prev => [...newInsights, ...prev]);
      }
      setIsGeneratingInsights(false);
    };
    fetchAI();
  }, [callLogs, profile]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleExport = () => {
    showToast("Preparing Executive Report...", "info");
    setTimeout(() => showToast("Report Downloaded Successfully", "success"), 1500);
  };

  const downloadTranscript = (log: CallLog) => {
    const element = document.createElement("a");
    const file = new Blob([log.fullTranscript || 'No transcript available.'], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${log.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("Transcript downloaded", "success");
  };

  const copyTranscript = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "success");
  };

  const handleSaveSettings = () => {
    showToast("Preferences Updated", "success");
  };

  const runRevenueAnalysis = () => {
    setAnalysisProgress(10);
    const intervals = [
      { p: 30, t: 800 },
      { p: 60, t: 1600 },
      { p: 85, t: 2400 },
      { p: 100, t: 3200 }
    ];
    intervals.forEach(({ p, t }) => setTimeout(() => setAnalysisProgress(p), t));
    setTimeout(() => {
      setAnalysisProgress(0);
      showToast("Optimization Complete: 2 Opportunities Identified", "success");
      setInsights(prev => [
        {
          id: `new-${Date.now()}`,
          title: 'Projected Slowdown',
          description: 'Predictive modeling suggests a 15% dip next Tuesday.',
          type: 'WARNING',
          projectedRoi: 'Save $400',
          actionParams: 'Activate Promo'
        },
        ...prev
      ]);
    }, 3500);
  };

  const handlePlaySample = (voice: typeof VOICE_OPTIONS[0]) => {
    window.speechSynthesis.cancel();
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(voice.sampleText);
    utterance.pitch = voice.gender === 'Female' ? 1.0 : 0.9;
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const specific = voices.find(v => v.name.includes(voice.name) || (voice.gender === 'Female' ? v.name.includes('Female') : v.name.includes('Male')));
    if(specific) utterance.voice = specific;

    utterance.onend = () => setPlayingVoiceId(null);
    setPlayingVoiceId(voice.id);
    window.speechSynthesis.speak(utterance);
  };

  const updateVoice = (voiceId: string) => {
    if (onUpdateProfile) {
      onUpdateProfile({ ...profile, voiceId });
      showToast("Voice Persona Updated", "success");
    }
  };

  // Scheduling Handlers
  const handleOpenShiftModal = (shift?: Shift, empId?: string, day?: string) => {
    if (shift) {
      setEditingShift({ ...shift });
    } else {
      setEditingShift({
        employeeId: empId || employees[0]?.id,
        day: day as any || 'Mon',
        startTime: '09:00',
        endTime: '17:00'
      });
    }
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = () => {
    if (!editingShift.employeeId || !editingShift.day || !editingShift.startTime || !editingShift.endTime) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (editingShift.id) {
      setShifts(prev => prev.map(s => s.id === editingShift.id ? { ...editingShift } as Shift : s));
      showToast("Shift updated", "success");
    } else {
      const newShift = { ...editingShift, id: `shift-${Date.now()}` } as Shift;
      setShifts(prev => [...prev, newShift]);
      showToast("Shift added", "success");
    }
    setIsShiftModalOpen(false);
  };

  const handleDeleteShift = () => {
    if (editingShift.id) {
      setShifts(prev => prev.filter(s => s.id !== editingShift.id));
      showToast("Shift removed", "info");
    }
    setIsShiftModalOpen(false);
  };

  const handleAddEmployee = () => {
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = () => {
    if (!newStaffName.trim()) {
      showToast("Please enter a name", "error");
      return;
    }
    const newEmp: Employee = {
      id: `e-${Date.now()}`,
      name: newStaffName,
      role: newStaffRole,
      avatar: newStaffName.charAt(0).toUpperCase()
    };
    setEmployees(prev => [...prev, newEmp]);
    setNewStaffName('');
    setNewStaffRole('Stylist');
    setIsStaffModalOpen(false);
    showToast("Staff member added", "success");
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setShifts(prev => prev.filter(s => s.employeeId !== id)); // Clean up shifts for removed employee
    showToast("Staff member removed", "info");
  };

  const simulateIncomingCall = () => {
    if (activeCall) return; 

    // RATE LIMIT CHECK
    const currentTierData = TIERS.find(t => t.id === profile.tier);
    // Extract call limit from features string (simulated parsing) or hardcoded logic based on tier
    let limit = 300;
    if (profile.tier === SubscriptionTier.PRO) limit = 1000;
    if (profile.tier === SubscriptionTier.ENTERPRISE) limit = Infinity;

    if (callLogs.length >= limit) {
      showToast(`Monthly limit of ${limit} calls reached. Upgrade required.`, "error");
      return;
    }

    const tempId = `live-${Date.now()}`;
    const callerId = `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    setActiveCall({
      id: tempId,
      callerNumber: callerId,
      status: 'RINGING' as any,
      summary: 'Establishing secure connection...'
    });

    setTimeout(() => {
      setActiveCall(prev => prev ? ({ ...prev, summary: 'AI Concierge active...', status: 'CONNECTED' as any }) : null);
    }, 2000);

    setTimeout(() => {
      setActiveCall(null);
      const newLog: CallLog = {
        id: tempId,
        callerNumber: callerId,
        timestamp: 'Just now',
        duration: '0m 42s',
        summary: 'Inquired about VIP availability.',
        outcome: 'BOOKED',
        sentiment: 'POSITIVE',
        transcriptSnippet: "Agent: 'The executive suite is available.' Customer: 'Book it.'",
        revenueImpact: 65,
        fullTranscript: "AI: Thank you for calling. How can I help?\nCustomer: Is the suite available tonight?\nAI: Yes, the executive suite is available for $400/night.\nCustomer: Great, please book it."
      };
      setCallLogs(prev => [newLog, ...prev]);
      showToast("Call Complete. Appointment Confirmed.", "success");
    }, 8000);
  };

  const SidebarContent = () => (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-serif text-white tracking-wide">VOIXI<span className="text-luxury-gold">1</span></h1>
        <div className="mt-2 flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${activeCall ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
           <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">{activeCall ? 'Active' : 'Standby'}</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <SidebarItem id="overview" icon={LayoutDashboard} label="Command Center" />
        <SidebarItem id="calls" icon={PhoneCall} label="Live Communications" />
        <SidebarItem id="revenue" icon={TrendingUp} label="Revenue Engine" />
        <SidebarItem id="scheduling" icon={Calendar} label="Staff Roster" />
        <div className="pt-8 pb-4 px-4 text-[10px] font-bold text-luxury-gold uppercase tracking-widest opacity-50">Administration</div>
        <SidebarItem id="customers" icon={Users} label="Clientele" />
        <SidebarItem id="settings" icon={Settings} label="Configuration" />
      </nav>

      <div className="p-6 border-t border-white/5">
         <div className="flex items-center gap-4 mb-4">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-violet to-luxury-black border border-white/10 flex items-center justify-center text-white font-serif italic">
             {profile.name.charAt(0)}
           </div>
           <div className="overflow-hidden">
             <p className="text-sm font-medium text-white truncate font-serif">{profile.name}</p>
             <p className="text-[10px] text-luxury-gold tracking-widest uppercase">{profile.tier} Member</p>
           </div>
         </div>
         <button onClick={onLogout} className="flex items-center gap-3 text-xs text-gray-500 hover:text-white transition w-full uppercase tracking-widest">
           <LogOut className="w-3 h-3" /> Sign Out
         </button>
      </div>
    </>
  );

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3.5 transition-all duration-300 group ${
        activeTab === id 
          ? 'bg-white/5 text-luxury-gold border-r-2 border-luxury-gold' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className={`w-4 h-4 ${activeTab === id ? 'text-luxury-gold' : 'text-gray-500 group-hover:text-white'}`} />
      <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-luxury-black overflow-hidden relative font-sans text-gray-800">
      
      {/* Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center px-6 py-4 rounded-none shadow-2xl text-white text-sm animate-fade-in ${
            toast.type === 'success' ? 'bg-luxury-black border-l-2 border-luxury-gold' : 
            toast.type === 'error' ? 'bg-red-900 border-l-2 border-red-500' : 'bg-gray-900'
          }`}>
             {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 mr-3 text-luxury-gold" />}
             <span className="font-medium tracking-wide">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-luxury-black border-r border-white/10 flex flex-col" onClick={e => e.stopPropagation()}>
             <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-luxury-black border-r border-white/5 flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f8f8f8]"> {/* Soft off-white main bg */}
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <h2 className="text-xl font-serif text-gray-900">{
              activeTab === 'overview' ? 'Executive Dashboard' :
              activeTab === 'calls' ? 'Communication Logs' :
              activeTab === 'revenue' ? 'Revenue Optimization' :
              activeTab === 'customers' ? 'Client Database' : 
              activeTab === 'scheduling' ? 'Staff Roster' :
              'System Configuration'
            }</h2>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-luxury-gold transition">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={simulateIncomingCall}
              disabled={!!activeCall}
              className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                activeCall 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-luxury-gold hover:text-black'
              }`}
            >
              {activeCall ? 'System Engaged' : 'Simulate Inquiry'}
            </button>
          </div>
        </header>

        {activeCall && (
          <div className="bg-luxury-black text-white px-8 py-4 flex items-center justify-between z-10 border-b border-luxury-gold/30">
             <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-2 h-2 absolute top-0 right-0 bg-red-500 rounded-full animate-ping"></div>
                  <PhoneCall className="w-5 h-5 text-luxury-gold" />
                </div>
                <div>
                  <p className="text-sm font-serif tracking-wide">Incoming: <span className="text-luxury-gold">{activeCall.callerNumber}</span></p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{activeCall.summary}</p>
                </div>
             </div>
          </div>
        )}

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Revenue Delta', val: '$1,240', sub: '+12% this week', icon: TrendingUp },
                  { label: 'Volume', val: '142', sub: '98% Response Rate', icon: PhoneCall },
                  { label: 'Conversions', val: '28', sub: '$2,800 Value', icon: CheckCircle2 },
                  { label: 'Efficiency', val: '12h', sub: 'Man-hours Saved', icon: Star },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <stat.icon className="w-4 h-4 text-luxury-gold" />
                    </div>
                    <h3 className="text-3xl font-serif text-gray-900 mb-2">{stat.val}</h3>
                    <p className="text-xs text-gray-500 font-medium">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-lg text-gray-900">Performance Analytics</h3>
                    <div className="flex gap-2">
                       <span className="w-3 h-3 rounded-full bg-luxury-violet"></span> <span className="text-xs text-gray-500 mr-4">Revenue</span>
                       <span className="w-3 h-3 rounded-full bg-gray-300"></span> <span className="text-xs text-gray-500">Volume</span>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_CHART_DATA}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2e1065" stopOpacity={0.05}/>
                            <stop offset="95%" stopColor="#2e1065" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                        <Tooltip 
                          contentStyle={{background: '#09090b', border: 'none', borderRadius: '0px', color: '#fff'}}
                          itemStyle={{color: '#fff'}}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#2e1065" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                        <Bar dataKey="calls" fill="#e2e8f0" barSize={4} radius={[2, 2, 0, 0]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-luxury-black p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold opacity-10 rounded-full blur-3xl"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-lg text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-luxury-gold fill-luxury-gold" /> Intelligence
                      </h3>
                      {isGeneratingInsights && <Loader2 className="animate-spin w-4 h-4 text-gray-500" />}
                    </div>
                    
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                      {insights.map((insight) => (
                        <div key={insight.id} className="p-4 bg-white/5 border border-white/10 hover:border-luxury-gold/50 transition duration-300 cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">{insight.type}</span>
                             <span className="text-[10px] text-gray-400">{insight.projectedRoi}</span>
                          </div>
                          <h4 className="font-serif text-white mb-2">{insight.title}</h4>
                          <p className="text-xs text-gray-400 mb-4 leading-relaxed font-light">{insight.description}</p>
                          <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-black bg-white hover:bg-luxury-gold transition-colors">
                            {insight.actionParams}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calls List */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-serif text-lg text-gray-900">Recent Communications</h3>
                  <button onClick={() => setActiveTab('calls')} className="text-xs font-bold text-luxury-violet uppercase tracking-widest hover:underline">View All Logs</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {callLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                           log.outcome === 'BOOKED' ? 'border-green-200 bg-green-50 text-green-700' :
                           'border-gray-200 bg-gray-50 text-gray-500'
                         }`}>
                            <PhoneCall className="w-4 h-4" />
                         </div>
                         <div>
                           <p className="font-medium text-gray-900 font-serif">{log.callerNumber}</p>
                           <p className="text-xs text-gray-400 uppercase tracking-wider">{log.timestamp}</p>
                         </div>
                       </div>
                       <div className="hidden sm:block flex-1 mx-12">
                          <p className="text-sm text-gray-600 truncate font-light italic">
                            "{log.summary}"
                          </p>
                       </div>
                       <div>
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest group-hover:text-luxury-violet transition-colors">
                            {log.outcome}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="bg-white border border-gray-100 shadow-sm h-full flex flex-col">
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
                 <div>
                   <h2 className="text-xl font-serif text-gray-900">Communication Logs</h2>
                   <p className="text-xs text-gray-500 mt-1">Review transcripts, recordings, and AI sentiment analysis.</p>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => showToast("Exporting all logs...", "info")} className="flex items-center gap-2 text-xs font-bold bg-white border border-gray-200 text-gray-900 px-4 py-2 uppercase tracking-widest hover:bg-black hover:text-white transition">
                      <Download className="w-3 h-3" /> Export All
                   </button>
                 </div>
              </div>
              
              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto">
                 <div className="divide-y divide-gray-50">
                    {callLogs.map((log) => (
                       <div key={log.id} className="group bg-white hover:bg-gray-50 transition-colors duration-200">
                          {/* Summary Row (Clickable) */}
                          <div 
                            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                            className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                             <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                                     log.outcome === 'BOOKED' ? 'border-green-200 bg-green-50 text-green-700' :
                                     log.outcome === 'MISSED' ? 'border-red-200 bg-red-50 text-red-700' :
                                     'border-gray-200 bg-gray-50 text-gray-500'
                                   }`}>
                                   <PhoneCall className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 font-serif text-lg">{log.callerNumber}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mt-1">
                                     <span>{log.timestamp}</span>
                                     <span>•</span>
                                     <span>{log.duration}</span>
                                  </div>
                                </div>
                             </div>

                             <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
                                <div className="hidden md:block text-sm text-gray-600 font-light italic truncate max-w-xs">
                                   "{log.summary}"
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                       log.outcome === 'BOOKED' ? 'bg-green-100 text-green-800' :
                                       log.outcome === 'MISSED' ? 'bg-red-100 text-red-800' :
                                       'bg-gray-100 text-gray-600'
                                  }`}>
                                      {log.outcome}
                                  </span>
                                  {expandedLogId === log.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </div>
                             </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedLogId === log.id && (
                            <div className="px-6 pb-8 pt-2 bg-gray-50/50 border-t border-gray-100 animate-fade-in pl-20">
                               
                               {/* 1. Audio Player Placeholder */}
                               <div className="mb-6 bg-white border border-gray-100 p-4 rounded-lg flex items-center gap-4 shadow-sm">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); showToast("Playing audio recording...", "info"); }}
                                    className="w-10 h-10 rounded-full bg-luxury-black text-white flex items-center justify-center hover:bg-luxury-gold hover:text-black transition-colors"
                                  >
                                     <Play className="w-4 h-4 ml-0.5" />
                                  </button>
                                  <div className="flex-1">
                                     <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-gray-300 rounded-full"></div>
                                     </div>
                                  </div>
                                  <span className="text-xs font-mono text-gray-500">{log.duration}</span>
                               </div>

                               {/* 2. Transcript */}
                               <div className="mb-6">
                                  <div className="flex items-center justify-between mb-3">
                                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                       <FileText className="w-3 h-3" /> Full Transcript
                                     </h4>
                                     <div className="flex gap-2">
                                        <button onClick={() => copyTranscript(log.fullTranscript || '')} className="text-gray-400 hover:text-luxury-gold transition p-1" title="Copy">
                                          <Copy className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => downloadTranscript(log)} className="text-gray-400 hover:text-luxury-gold transition p-1" title="Download">
                                          <Download className="w-3 h-3" />
                                        </button>
                                     </div>
                                  </div>
                                  <div className="bg-white border border-gray-100 p-6 rounded-lg font-mono text-sm text-gray-600 leading-relaxed shadow-sm whitespace-pre-wrap">
                                     {log.fullTranscript || "No transcript available for this call."}
                                  </div>
                               </div>

                               {/* 3. AI Sentiment Analysis (Extra Value) */}
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="p-4 bg-white border border-gray-100 rounded-lg text-center">
                                     <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Sentiment</span>
                                     <span className={`font-bold ${
                                       log.sentiment === 'POSITIVE' ? 'text-green-600' : 
                                       log.sentiment === 'NEGATIVE' ? 'text-red-600' : 'text-gray-600'
                                     }`}>{log.sentiment}</span>
                                  </div>
                                  <div className="p-4 bg-white border border-gray-100 rounded-lg text-center">
                                     <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Rev. Impact</span>
                                     <span className="font-bold text-gray-900">{log.revenueImpact > 0 ? `+$${log.revenueImpact}` : `$${log.revenueImpact}`}</span>
                                  </div>
                               </div>
                            </div>
                          )}
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
             <div className="flex flex-col items-center justify-center h-full text-center p-12">
               {analysisProgress > 0 ? (
                 <div className="w-full max-w-md bg-white p-10 shadow-2xl border-t-4 border-luxury-gold">
                    <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mx-auto mb-6" />
                    <h3 className="text-xl font-serif text-gray-900 mb-2">Analyzing Data Streams</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">Cross-referencing inventory with historical logs</p>
                    <div className="w-full bg-gray-100 h-1 mb-2">
                       <div className="bg-luxury-black h-1 transition-all duration-500 ease-out" style={{ width: `${analysisProgress}%` }}></div>
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="bg-white p-6 rounded-full shadow-lg mb-8">
                     <TrendingUp className="w-8 h-8 text-luxury-violet" />
                   </div>
                   <h2 className="text-3xl font-serif text-gray-900 mb-4">Deep Learning Optimization</h2>
                   <p className="text-gray-500 max-w-md mb-10 font-light leading-relaxed">
                     Activate the Voixi1 neural engine to scan your business operations for hidden revenue opportunities and efficiency gaps.
                   </p>
                   <button 
                     onClick={runRevenueAnalysis}
                     className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-black transition-colors duration-300"
                   >
                     Initiate Analysis
                   </button>
                 </>
               )}
             </div>
          )}

          {activeTab === 'scheduling' && (
             <div className="h-full flex flex-col">
               {profile.tier === SubscriptionTier.ENTERPRISE ? (
                 <div className="flex-1 bg-white border border-gray-100 shadow-sm flex flex-col">
                   <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-luxury-black text-white rounded-full">
                           <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                           <h2 className="text-xl font-serif text-gray-900">Staff Rostering</h2>
                           <div className="flex gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {employees.length} Active Staff</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {shifts.length} Scheduled Shifts</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={handleAddEmployee} className="flex items-center gap-2 text-xs font-bold bg-white border border-gray-200 text-gray-900 px-6 py-3 uppercase tracking-widest hover:bg-black hover:text-white transition shadow-sm">
                         <Users className="w-3 h-3" /> Add Staff
                       </button>
                       <button onClick={() => handleOpenShiftModal()} className="flex items-center gap-2 text-xs font-bold bg-black text-white px-6 py-3 uppercase tracking-widest hover:bg-luxury-gold hover:text-black transition shadow-sm">
                         <Plus className="w-3 h-3" /> Add Shift
                       </button>
                     </div>
                   </div>
                   <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
                      <div className="min-w-[800px] bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                       <div className="grid grid-cols-8 gap-0 border-b border-gray-100 bg-gray-50">
                         <div className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest col-span-1 flex items-center">Personnel</div>
                         {DAYS.map(day => (
                           <div key={day} className="p-4 font-bold text-gray-900 text-center font-serif text-sm border-l border-gray-100">{day}</div>
                         ))}
                       </div>
                       <div className="divide-y divide-gray-100">
                         {employees.map(emp => (
                           <div key={emp.id} className="grid grid-cols-8 gap-0 items-stretch hover:bg-gray-50/50 transition group/row">
                             <div className="col-span-1 p-4 flex items-center justify-between gap-2 border-r border-gray-100 bg-white group-hover/row:bg-gray-50/50 transition">
                               <div className="flex items-center gap-3 overflow-hidden">
                                 <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-luxury-black to-gray-800 text-white rounded-full flex items-center justify-center font-serif text-xs shadow-md">
                                   {emp.avatar}
                                 </div>
                                 <div className="min-w-0">
                                   <p className="font-medium text-sm text-gray-900 font-serif truncate">{emp.name}</p>
                                   <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate">{emp.role}</p>
                                 </div>
                               </div>
                               <button 
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="opacity-0 group-hover/row:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1"
                                title="Remove Staff"
                               >
                                 <UserMinus className="w-4 h-4" />
                               </button>
                             </div>
                             {DAYS.map(day => {
                               const shift = shifts.find(s => s.employeeId === emp.id && s.day === day);
                               return (
                                 <div key={day} className="col-span-1 p-2 border-l border-gray-100 min-h-[80px] relative group/cell">
                                   {shift ? (
                                     <div 
                                      onClick={() => handleOpenShiftModal(shift)}
                                      className="h-full bg-luxury-violet/5 text-luxury-violet border border-luxury-violet/20 text-xs font-medium py-2 px-1 w-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-luxury-violet/10 hover:border-luxury-violet/40 transition-all rounded shadow-sm"
                                     >
                                       <span className="font-bold">{shift.startTime}</span>
                                       <div className="w-px h-2 bg-luxury-violet/20 my-0.5"></div>
                                       <span className="text-luxury-violet/70">{shift.endTime}</span>
                                     </div>
                                   ) : (
                                     <div 
                                      onClick={() => handleOpenShiftModal(undefined, emp.id, day)}
                                      className="absolute inset-0 m-2 border border-dashed border-gray-100 rounded flex items-center justify-center text-gray-200 hover:border-luxury-gold/50 hover:text-luxury-gold hover:bg-luxury-gold/5 cursor-pointer transition opacity-0 group-hover/cell:opacity-100"
                                     >
                                       <Plus className="w-4 h-4" />
                                     </div>
                                   )}
                                 </div>
                               );
                             })}
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="h-full relative overflow-hidden flex flex-col items-center justify-center text-center p-12 bg-gray-50 border border-gray-200 group">
                   {/* Background Pattern */}
                   <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                   
                   <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-luxury-gold/20 transition-colors">
                           <Lock className="w-8 h-8 text-gray-400 group-hover:text-luxury-gold transition-colors" />
                       </div>
                       <h2 className="text-2xl font-serif text-gray-900 mb-3">Enterprise Access Required</h2>
                       <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                         Unlock AI-powered staff rostering, predictive shift optimization, and unlimited employee profiles.
                       </p>
                       <button className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-black transition shadow-lg">
                         Upgrade Membership
                       </button>
                   </div>
                 </div>
               )}
             </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white border border-gray-100 shadow-sm">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-serif text-gray-900">Client Database</h2>
                  <button onClick={handleExport} className="flex items-center gap-2 text-xs font-bold text-gray-900 border border-gray-200 px-4 py-2 hover:bg-black hover:text-white transition uppercase tracking-widest">
                    <Download className="w-3 h-3" /> Export CSV
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Client', 'Status', 'Last Contact', 'LTV'].map(h => (
                          <th key={h} className="py-4 px-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {CUSTOMERS.map((cust, i) => (
                        <tr key={i} onClick={() => setSelectedCustomer(cust)} className="hover:bg-gray-50 cursor-pointer transition">
                          <td className="py-5 px-6">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-luxury-black text-white flex items-center justify-center font-serif text-xs mr-4">
                                {cust.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 font-serif">{cust.name}</div>
                                <div className="text-xs text-gray-500">{cust.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold ${
                              cust.status === 'Active' ? 'text-green-700 bg-green-50' :
                              cust.status === 'New' ? 'text-blue-700 bg-blue-50' : 'text-orange-700 bg-orange-50'
                            }`}>{cust.status}</span>
                          </td>
                          <td className="py-5 px-6 text-sm text-gray-600 font-light">{cust.last}</td>
                          <td className="py-5 px-6 font-medium text-gray-900 font-serif">{cust.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-black text-white rounded-full">
                     <Mic className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-xl font-serif text-gray-900">Concierge Persona</h3>
                     <p className="text-xs text-gray-500 uppercase tracking-widest">Voice & Tone Configuration</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {VOICE_OPTIONS.map(voice => (
                      <div 
                        key={voice.id} 
                        onClick={() => updateVoice(voice.id)}
                        className={`p-6 border transition-all duration-300 cursor-pointer relative ${
                          profile.voiceId === voice.id 
                            ? 'bg-luxury-black text-white border-luxury-gold shadow-lg ring-1 ring-luxury-gold' 
                            : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                         {profile.voiceId === voice.id && (
                           <div className="absolute top-0 right-0 p-2">
                             <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                           </div>
                         )}
                         <div className="flex items-center justify-between mb-4">
                            <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold ${
                              profile.voiceId === voice.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {voice.tone}
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handlePlaySample(voice); }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                profile.voiceId === voice.id 
                                  ? 'bg-luxury-gold text-black hover:bg-white' 
                                  : 'bg-black text-white hover:bg-luxury-gold hover:text-black'
                              }`}
                            >
                               {playingVoiceId === voice.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                            </button>
                         </div>
                         <h4 className="font-serif text-lg mb-2">{voice.name}</h4>
                         <p className={`text-xs leading-relaxed ${profile.voiceId === voice.id ? 'text-gray-400' : 'text-gray-500'}`}>
                           {voice.description}
                         </p>
                      </div>
                   ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm p-8">
                 <h3 className="text-xl font-serif text-gray-900 mb-6">General Configuration</h3>
                 <div className="space-y-6 max-w-2xl">
                    <div className="group">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business Name</label>
                      <input type="text" value={profile.name} readOnly className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-500 font-serif" />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Service Hours</label>
                      <input type="text" value={profile.hours} readOnly className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-500 font-serif" />
                    </div>
                    <div className="pt-4">
                      <button className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-black transition">
                        Update Business Profile
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CRM Detail Modal - Luxury Redesign */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="p-8 bg-luxury-black text-white relative border-b border-luxury-gold/20">
               <button onClick={() => setSelectedCustomer(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition">
                 <X className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-serif text-luxury-gold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif mb-1">{selectedCustomer.name}</h3>
                    <p className="text-luxury-gold text-xs uppercase tracking-widest">VIP Client • {selectedCustomer.value} LTV</p>
                  </div>
               </div>
             </div>
             <div className="p-8">
               <div className="grid grid-cols-2 gap-6 mb-8">
                 <div>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                   <p className="text-sm font-serif text-gray-900">{selectedCustomer.email}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Mobile</p>
                   <p className="text-sm font-serif text-gray-900">{selectedCustomer.phone}</p>
                 </div>
               </div>
               
               <h4 className="font-serif text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">Interaction History</h4>
               <ul className="space-y-3 mb-8">
                 {selectedCustomer.history.map((h, i) => (
                   <li key={i} className="text-sm text-gray-600 flex items-center gap-3 font-light">
                     <div className="w-1 h-1 bg-luxury-gold rounded-full"></div>
                     {h}
                   </li>
                 ))}
               </ul>

               <div className="flex gap-4">
                 <button onClick={() => showToast("Offer Sent", "success")} className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-black transition">Send Exclusive Offer</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* SHIFT SCHEDULING MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsShiftModalOpen(false)}>
           <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden p-8" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-serif text-gray-900 mb-6">{editingShift.id ? 'Edit Shift' : 'Schedule Shift'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Employee</label>
                  <select 
                    value={editingShift.employeeId}
                    onChange={e => setEditingShift({...editingShift, employeeId: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 font-sans focus:outline-none focus:border-black"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Day</label>
                   <select 
                    value={editingShift.day}
                    onChange={e => setEditingShift({...editingShift, day: e.target.value as any})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 font-sans focus:outline-none focus:border-black"
                   >
                     {DAYS.map(day => (
                       <option key={day} value={day}>{day}</option>
                     ))}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                     <input 
                      type="time" 
                      value={editingShift.startTime}
                      onChange={e => setEditingShift({...editingShift, startTime: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 font-sans focus:outline-none focus:border-black"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">End Time</label>
                     <input 
                      type="time" 
                      value={editingShift.endTime}
                      onChange={e => setEditingShift({...editingShift, endTime: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 font-sans focus:outline-none focus:border-black"
                     />
                   </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                 {editingShift.id && (
                   <button 
                    onClick={handleDeleteShift}
                    className="w-12 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
                 <button 
                  onClick={() => setIsShiftModalOpen(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-900 font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-50 transition"
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={handleSaveShift}
                  className="flex-1 bg-black text-white font-bold uppercase tracking-widest text-xs py-4 hover:bg-luxury-gold hover:text-black transition"
                 >
                   Save Shift
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsStaffModalOpen(false)}>
           <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden p-8" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-serif text-gray-900 mb-6">Add Staff Member</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                  <input 
                    type="text" 
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 font-sans focus:outline-none focus:border-black"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Role</label>
                  <input 
                    type="text" 
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    placeholder="e.g. Senior Stylist"
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 font-sans focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                 <button 
                  onClick={() => setIsStaffModalOpen(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-900 font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-50 transition"
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={handleSaveStaff}
                  className="flex-1 bg-black text-white font-bold uppercase tracking-widest text-xs py-4 hover:bg-luxury-gold hover:text-black transition"
                 >
                   Add Staff
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;