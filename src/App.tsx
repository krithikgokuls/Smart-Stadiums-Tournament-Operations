import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  AlertCircle,
  Bus,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  Info,
  Languages,
  MapPin,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  Users,
  Volume2,
  Zap,
  TrendingUp,
  Leaf,
  Check,
  Search,
  UserCheck,
  Map,
  ShoppingBag,
  ExternalLink,
  Plus
} from "lucide-react";
import { StadiumMap } from "./components/StadiumMap";
import { Incident, TransportStatus, StadiumZone, VolunteerStaff, ChatMessage, OperationsStats } from "./types";

interface AITactics {
  crowdSafety: string;
  transitOptimization: string;
  accessibilityWaste: string;
  volunteerAllocation: string;
}

export default function App() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState<"staff" | "fan">("staff");

  // Live Stadium State
  const [stadiumState, setStadiumState] = useState<{
    incidents: Incident[];
    transportStatuses: TransportStatus[];
    stadiumZones: StadiumZone[];
    volunteers: VolunteerStaff[];
    stats: OperationsStats;
    messages: ChatMessage[];
  } | null>(null);

  // App statuses
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isGeneratingTactics, setIsGeneratingTactics] = useState(false);
  const [isReportingIncident, setIsReportingIncident] = useState(false);

  // Chatbot State
  const [chatInput, setChatInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Selected Digital Twin Zone
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("zone-a");

  // Incident Filtering & Reporting State
  const [incidentFilter, setIncidentFilter] = useState<"all" | "reported" | "dispatched" | "resolved">("all");
  const [newIncident, setNewIncident] = useState({
    title: "",
    category: "crowd" as "crowd" | "medical" | "facility" | "security" | "accessibility" | "sustainability",
    zone: "Zone A - North Concourse",
    location: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    description: "",
  });

  // AURA Strategic AI Tactical Advice
  const [aiTactics, setAiTactics] = useState<AITactics | null>({
    crowdSafety: "Deploy crowd barriers around Gate 3 turnstiles. Divert arriving ticket-holders at Gate 3 queue to adjacent Gate 2 to reduce wait times from 35 mins down to 8 mins.",
    transitOptimization: "Direct shuttle buses on North Loop to relocate standby slots to the Rideshare hub to resolve Prairie Ave delay bottlenecks.",
    accessibilityWaste: "Initiate visual signpost dispatchers at West Concourse Gate 11 to help disabled fans find elevator alternative EL-5. Send volunteers with compostable waste guides to South Concourse snack courts.",
    volunteerAllocation: "Assign Chloe Martin (French/English) to assist any incoming tourists near Zone A to relieve language bottlenecks."
  });

  // Fan Feature Filters
  const [fanFoodSearch, setFanFoodSearch] = useState("");
  const [fanFoodFilter, setFanFoodFilter] = useState<"all" | "meals" | "drinks" | "sweets">("all");
  const [simulatedTransitUpdate, setSimulatedTransitUpdate] = useState({
    id: "tx-002",
    waitTimeMinutes: 18,
    status: "Crowded" as const,
    alertText: "High demand post-match. Bus frequency increased to 6 minutes."
  });

  // Clock state
  const [currentTime, setCurrentTime] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all live data on mount
  const fetchStadiumState = async (showPulse = false) => {
    if (showPulse) setIsRefreshing(true);
    try {
      const res = await fetch("/api/stadium/state");
      if (res.ok) {
        const data = await res.json();
        setStadiumState(data);
        if (data.messages && data.messages.length > 0) {
          setChatHistory(data.messages);
        }
      }
    } catch (err) {
      console.error("Error fetching stadium state:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStadiumState();
    // Auto refresh every 20 seconds
    const interval = setInterval(() => {
      fetchStadiumState();
    }, 20000);

    // Live clock
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }) + " CDT");
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle reporting a new incident
  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.title || !newIncident.location || !newIncident.description) {
      alert("Please fill in all the required incident fields.");
      return;
    }

    setIsReportingIncident(true);
    try {
      const res = await fetch("/api/incidents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      });

      if (res.ok) {
        const addedIncident = await res.json();
        // Optimistically update or re-fetch state
        await fetchStadiumState();
        // Reset form
        setNewIncident({
          title: "",
          category: "crowd",
          zone: "Zone A - North Concourse",
          location: "",
          severity: "medium",
          description: "",
        });
        // Scroll map or incident feed into focus
        const element = document.getElementById("incident-logs-header");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (err) {
      console.error("Failed to report incident:", err);
    } finally {
      setIsReportingIncident(false);
    }
  };

  // Assign volunteer or change status of incident
  const handleUpdateIncident = async (incidentId: string, status: Incident["status"], staffId?: string) => {
    try {
      const res = await fetch("/api/incidents/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: incidentId,
          status,
          assignedStaffId: staffId,
        }),
      });

      if (res.ok) {
        await fetchStadiumState();
      }
    } catch (err) {
      console.error("Error updating incident status:", err);
    }
  };

  // Generate strategic GenAI report with current live variables
  const handleGenerateTactics = async () => {
    setIsGeneratingTactics(true);
    try {
      const res = await fetch("/api/operations/recommendations", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setAiTactics(data);
      }
    } catch (err) {
      console.error("Error generating tactics advice:", err);
    } finally {
      setIsGeneratingTactics(false);
    }
  };

  // Send message to AURA assistant
  const handleSendChatMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    if (!customText) {
      setChatInput("");
    }

    setIsSendingChat(true);

    // Optimistically push the user message
    const userMsg: ChatMessage = {
      id: `m-temp-user-${Date.now()}`,
      sender: activeMode === "staff" ? "staff" : "fan",
      senderName: activeMode === "staff" ? "Staff Operator" : "Stadium Fan",
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          mode: activeMode,
          language: selectedLanguage,
        }),
      });

      if (res.ok) {
        const aiMessage = await res.json();
        setChatHistory(prev => {
          // Filter out temporary optimistic user message to prevent duplicates from state sync
          const filtered = prev.filter(m => !m.id.startsWith("m-temp-"));
          return [...filtered, userMsg, aiMessage];
        });
        // Sync full server state to reflect new messages stored in server session
        fetchStadiumState();
      }
    } catch (err) {
      console.error("Error in AI chat request:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Update transportation statuses dynamically (Organizer/steward simulation)
  const handleUpdateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/transport/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simulatedTransitUpdate),
      });
      if (res.ok) {
        await fetchStadiumState();
        alert("Transportation hub details successfully updated live!");
      }
    } catch (err) {
      console.error("Error updating transit status:", err);
    }
  };

  const languagesAvailable = [
    "English", "Spanish", "French", "German", "Arabic", "Japanese", "Portuguese", "Hindi"
  ];

  // Filter concessions based on searches
  const filteredConcessionsList = (zone: StadiumZone) => {
    return zone.features.concessions.filter((concession) => {
      const matchSearch = concession.toLowerCase().includes(fanFoodSearch.toLowerCase());
      if (fanFoodFilter === "all") return matchSearch;
      if (fanFoodFilter === "meals") {
        return matchSearch && (concession.includes("Burger") || concession.includes("Taco") || concession.includes("Pizza") || concession.includes("Bites"));
      }
      if (fanFoodFilter === "drinks") {
        return matchSearch && (concession.includes("Beer") || concession.includes("Beverage") || concession.includes("Espresso") || concession.includes("Cantina"));
      }
      if (fanFoodFilter === "sweets") {
        return matchSearch && (concession.includes("Pretzels") || concession.includes("Gelato") || concession.includes("Churros"));
      }
      return matchSearch;
    });
  };

  if (isLoading || !stadiumState) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-sm flex items-center justify-center font-black text-black text-2xl animate-pulse">
            WC
          </div>
          <span className="font-black tracking-tighter text-xl md:text-2xl uppercase text-center">Smart Stadiums & Tournament Operations</span>
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
            Bootstrapping real-time tactical digital twin...
          </div>
        </div>
      </div>
    );
  }

  // Active Incidents filtered
  const activeIncidentsFiltered = stadiumState.incidents.filter((inc) => {
    if (incidentFilter === "all") return true;
    return inc.status === incidentFilter;
  });

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white font-sans flex flex-col select-none overflow-x-hidden">
      
      {/* TOP BRAND NAVIGATION BAR */}
      <header className="h-16 border-b border-white/10 px-4 md:px-8 flex items-center justify-between bg-black shrink-0 relative z-10" id="global-header">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-black text-xs">WC</div>
          <span className="font-black tracking-tighter text-xl uppercase flex items-center gap-2">
            Smart Stadiums <span className="text-white/40 italic font-light">& Tournament Operations</span>
            <span className="hidden sm:inline bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded tracking-widest ml-1 uppercase">
              Azteca 2026
            </span>
          </span>
        </div>
        
        <div className="flex gap-4 md:gap-8 items-center">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">LA Arena Local Time</span>
            <span className="font-mono text-sm text-slate-300 font-bold">{currentTime || "09:03:05 CDT"}</span>
          </div>
          
          <button 
            onClick={() => fetchStadiumState(true)}
            className="p-2 border border-white/10 rounded hover:bg-white/5 active:scale-95 transition-all flex items-center gap-1.5 text-xs text-slate-300"
            title="Sync live tournament twin state"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">Sync Twin</span>
          </button>

          <div className="h-8 w-px bg-white/15"></div>
          <div className="px-3 py-1 border border-emerald-500/30 rounded-full flex items-center gap-2 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Live</span>
          </div>
        </div>
      </header>

      {/* SUB-HEADER USER MODE TOGGLE */}
      <div className="bg-[#0b0b0b] border-b border-white/10 px-4 md:px-8 py-2.5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Active Workspace:</span>
          <button
            onClick={() => setActiveMode("staff")}
            className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest transition-all border ${
              activeMode === "staff"
                ? "bg-white text-black border-white"
                : "bg-transparent text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            🏟️ Stadium Command Center (Organizer)
          </button>
          <button
            onClick={() => {
              setActiveMode("fan");
              // Pick North Zone as default for fan view inspection
              if (!selectedZoneId) setSelectedZoneId("zone-a");
            }}
            className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest transition-all border ${
              activeMode === "fan"
                ? "bg-white text-black border-white"
                : "bg-transparent text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            ⚽ Tournament Fan Companion
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>GenAI Translation Enabled</span>
        </div>
      </div>

      {/* MAIN INTERFACE: SPLIT GRID */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        
        {/* LEFT NAV ICON BAR (Aesthetic matching provided template design) */}
        <nav className="hidden lg:flex w-16 border-r border-white/10 flex-col items-center py-8 gap-8 bg-black shrink-0">
          <button 
            onClick={() => setActiveMode("staff")}
            className={`p-3 rounded-lg transition-all ${activeMode === "staff" ? "text-white bg-white/10" : "text-white/40 hover:text-white"}`}
            title="Command Center"
          >
            <Activity className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveMode("fan")}
            className={`p-3 rounded-lg transition-all ${activeMode === "fan" ? "text-white bg-white/10" : "text-white/40 hover:text-white"}`}
            title="Fan Companion"
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById("stadium-map-card");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="p-3 text-white/40 hover:text-white transition-all"
            title="Digital Twin Map"
          >
            <Map className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById("operations-tactical-report");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="p-3 text-white/40 hover:text-white transition-all"
            title="AURA Strategic Tactics"
          >
            <Sparkles className="w-5 h-5 text-blue-400" />
          </button>

          <div className="mt-auto flex flex-col items-center gap-6">
            <span className="text-[9px] text-white/40 uppercase [writing-mode:vertical-lr] tracking-[0.3em] font-black">Azteca 26</span>
            <div className="w-8 h-8 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-500/20 text-xs font-bold text-emerald-400">
              LA
            </div>
          </div>
        </nav>

        {/* WORKSPACE COLUMN SPLIT */}
        <div className="flex-1 p-4 md:p-8 bg-[#0a0a0a] overflow-y-auto space-y-8">
          
          {/* ========================================================== */}
          {/* STAFF COMMAND CENTER VIEW                                 */}
          {/* ========================================================== */}
          {activeMode === "staff" && (
            <div className="space-y-8">
              
              {/* DISPLAY TYPOGRAPHY HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                <div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white">
                    {stadiumState.stats.totalActiveFans.toLocaleString()}
                  </h1>
                  <p className="text-sm text-emerald-400 font-mono tracking-widest uppercase mt-2">
                    Current Occupancy — {Math.round((stadiumState.stats.totalActiveFans / 70000) * 100)}% Max Capacity
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 md:gap-8 bg-black/40 border border-white/5 p-4 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Active Tickets</span>
                    <span className="text-2xl font-bold font-mono text-amber-500">
                      {stadiumState.incidents.filter((i) => i.status !== "resolved").length}
                    </span>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Volunteers Duty</span>
                    <span className="text-2xl font-bold font-mono text-sky-400">
                      {stadiumState.stats.totalVolunteersOnDuty}
                    </span>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Green Score</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      {stadiumState.stats.sustainabilityScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* TWIN MAP + ZONE SPECS GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Visual Map Digital Twin */}
                <div className="h-full">
                  <StadiumMap
                    zones={stadiumState.stadiumZones}
                    activeIncidents={stadiumState.incidents.filter((i) => i.status !== "resolved")}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
                  />
                </div>

                {/* Tactical Live Actions & Transport Controller */}
                <div className="space-y-6">
                  
                  {/* Strategic Tactical Report Section */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative" id="operations-tactical-report">
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={handleGenerateTactics}
                        disabled={isGeneratingTactics}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-black font-black text-xs uppercase tracking-widest rounded flex items-center gap-1.5 transition-all"
                      >
                        {isGeneratingTactics ? (
                          <RefreshCw className="h-3 w-3 animate-spin text-black" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-black fill-black" />
                        )}
                        {isGeneratingTactics ? "Generating..." : "Regen Strategy"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                      <h3 className="text-md font-black uppercase tracking-wider text-blue-400">
                        AURA Live Strategic Command
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Generative AI tactical support analyzing crowd bottlenecks, transit schedules, and language services to deliver instant World Cup dispatch decisions.
                    </p>

                    {aiTactics ? (
                      <div className="space-y-4 text-xs">
                        <div className="border-l-2 border-emerald-500 pl-3 py-1">
                          <h4 className="font-black uppercase text-emerald-400 tracking-wider mb-0.5">
                            Crowd Management Protocol
                          </h4>
                          <p className="text-slate-300 leading-relaxed">{aiTactics.crowdSafety}</p>
                        </div>

                        <div className="border-l-2 border-amber-500 pl-3 py-1">
                          <h4 className="font-black uppercase text-amber-400 tracking-wider mb-0.5">
                            Transit Optimization
                          </h4>
                          <p className="text-slate-300 leading-relaxed">{aiTactics.transitOptimization}</p>
                        </div>

                        <div className="border-l-2 border-sky-500 pl-3 py-1">
                          <h4 className="font-black uppercase text-sky-400 tracking-wider mb-0.5">
                            Accessibility & Zero-Waste
                          </h4>
                          <p className="text-slate-300 leading-relaxed">{aiTactics.accessibilityWaste}</p>
                        </div>

                        <div className="border-l-2 border-purple-500 pl-3 py-1">
                          <h4 className="font-black uppercase text-purple-400 tracking-wider mb-0.5">
                            Smart Volunteer Allocation
                          </h4>
                          <p className="text-slate-300 leading-relaxed">{aiTactics.volunteerAllocation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        Failed to load real-time AI tactics. Click 'Regen Strategy' to refresh.
                      </div>
                    )}
                  </div>

                  {/* Transit Control Simulation Desk */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Bus className="h-4 w-4 text-emerald-400" />
                      Dynamic Transit Command Desk
                    </h3>
                    
                    <form onSubmit={handleUpdateTransport} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Target Line</label>
                        <select
                          value={simulatedTransitUpdate.id}
                          onChange={(e) => {
                            const found = stadiumState.transportStatuses.find(t => t.id === e.target.value);
                            if (found) {
                              setSimulatedTransitUpdate({
                                id: found.id,
                                waitTimeMinutes: found.waitTimeMinutes,
                                status: found.status,
                                alertText: found.alertText || ""
                              });
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                          {stadiumState.transportStatuses.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.mode} - {t.line}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Wait Time (Mins)</label>
                        <input
                          type="number"
                          value={simulatedTransitUpdate.waitTimeMinutes}
                          onChange={(e) => setSimulatedTransitUpdate(prev => ({ ...prev, waitTimeMinutes: Number(e.target.value) }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white focus:outline-none focus:border-emerald-500"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Status Level</label>
                        <select
                          value={simulatedTransitUpdate.status}
                          onChange={(e) => setSimulatedTransitUpdate(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Crowded">Crowded</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-3">
                        <label className="text-slate-400 block mb-1">Operations Bulletin Alert (Optional)</label>
                        <input
                          type="text"
                          value={simulatedTransitUpdate.alertText}
                          onChange={(e) => setSimulatedTransitUpdate(prev => ({ ...prev, alertText: e.target.value }))}
                          placeholder="e.g. Extreme queue at Metro Platform. Adding 2 additional trainsets."
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="col-span-1 sm:col-span-3 mt-1 w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest py-2 rounded text-xs transition-all"
                      >
                        Deploy Transit Alert
                      </button>
                    </form>
                  </div>

                </div>

              </div>

              {/* ACTIVE INCIDENT RESPONSE FEED */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left side: Incident Logger Desk Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl xl:col-span-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <PlusCircle className="h-4 w-4 text-emerald-400" />
                    Report Live Incident
                  </h3>

                  <form onSubmit={handleCreateIncident} className="space-y-4 text-xs text-slate-300">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Incident Title</label>
                      <input
                        type="text"
                        value={newIncident.title}
                        onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Scanners frozen at Gate 8"
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-bold">Category</label>
                        <select
                          value={newIncident.category}
                          onChange={(e) => setNewIncident(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                        >
                          <option value="crowd">Crowd Control</option>
                          <option value="medical">Medical Alert</option>
                          <option value="facility">Facility/Tech</option>
                          <option value="security">Security</option>
                          <option value="accessibility">Accessibility</option>
                          <option value="sustainability">Sustainability</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-bold">Severity</label>
                        <select
                          value={newIncident.severity}
                          onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as any }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-bold">Zone</label>
                        <select
                          value={newIncident.zone}
                          onChange={(e) => setNewIncident(prev => ({ ...prev, zone: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                        >
                          {stadiumState.stadiumZones.map((z) => (
                            <option key={z.id} value={z.name}>
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-bold">Exact Location</label>
                        <input
                          type="text"
                          value={newIncident.location}
                          onChange={(e) => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Row G, near scanner 3A"
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Incident Description</label>
                      <textarea
                        value={newIncident.description}
                        onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide details about the crowd volume, tech glitch, medical requirements, or language assistance needed."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isReportingIncident}
                      className="w-full bg-white hover:bg-slate-200 text-black font-black uppercase tracking-wider py-2.5 rounded text-xs transition-all flex items-center justify-center gap-2"
                    >
                      {isReportingIncident ? (
                        <>
                          <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                          Analyzing and Loging...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4.5 w-4.5 text-black" />
                          Analyze & Create Ticket
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right side: Real-time Incident List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl xl:col-span-2 flex flex-col h-[520px]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3 mb-4" id="incident-logs-header">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <ShieldAlert className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                        Incident Log & Live Dispatch Dispatcher
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Dispatch available volunteers and update incident states.
                      </p>
                    </div>

                    {/* Quick filter tabs */}
                    <div className="flex gap-1 text-[10px] border border-white/10 rounded p-1 bg-black">
                      {(["all", "reported", "dispatched", "resolved"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setIncidentFilter(tab)}
                          className={`px-2.5 py-1 rounded capitalize ${
                            incidentFilter === tab
                              ? "bg-white text-black font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Incident Feed list scrolling */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {activeIncidentsFiltered.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
                        No incidents matching "{incidentFilter}" category.
                      </div>
                    ) : (
                      activeIncidentsFiltered.map((inc) => {
                        const isCritical = inc.severity === "high" || inc.severity === "critical";
                        const assignedStaff = stadiumState.volunteers.find(v => v.id === inc.assignedStaffId);

                        return (
                          <div
                            key={inc.id}
                            className={`p-4 rounded-lg bg-slate-950 border transition-all ${
                              inc.status === "resolved"
                                ? "border-emerald-500/20 bg-emerald-950/5"
                                : isCritical
                                ? "border-rose-500/30"
                                : "border-slate-800"
                            }`}
                          >
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">
                                  Ticket {inc.id}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded border ${
                                  isCritical 
                                    ? "bg-rose-950/50 text-rose-400 border-rose-500/30 animate-pulse"
                                    : "bg-slate-900 text-slate-300 border-slate-700"
                                }`}>
                                  {inc.severity} priority
                                </span>
                                <span className="text-slate-400 text-xs font-semibold">•</span>
                                <span className="text-slate-300 text-xs font-semibold">{inc.category.toUpperCase()}</span>
                              </div>

                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(inc.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-white mb-1">{inc.title}</h4>
                            <p className="text-xs text-slate-400 mb-2">{inc.description}</p>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-[11px] bg-black/40 p-2 rounded border border-white/5">
                              <div>
                                <span className="text-slate-500">Zone: </span>
                                <span className="text-slate-300 font-semibold">{inc.zone}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Location: </span>
                                <span className="text-slate-300 font-semibold">{inc.location}</span>
                              </div>
                              <div className="col-span-2 border-t border-white/5 mt-1 pt-1">
                                <span className="text-slate-500 block mb-0.5">Assigned Staff:</span>
                                {assignedStaff ? (
                                  <div className="flex items-center justify-between text-slate-200">
                                    <span className="font-bold flex items-center gap-1">
                                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                                      {assignedStaff.name} ({assignedStaff.role} • {assignedStaff.languages.join("/")})
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{assignedStaff.contact}</span>
                                  </div>
                                ) : (
                                  <span className="text-amber-500 font-black uppercase tracking-wider text-[10px]">
                                    ⚠️ UNASSIGNED - Awaiting Volunteer Dispatch
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* GenAI Specific Dispatch Recommendation */}
                            {inc.aiRecommendation && (
                              <div className="bg-blue-950/20 border border-blue-500/20 rounded p-2.5 mb-3 text-[11px] text-slate-300 space-y-1">
                                <span className="font-bold text-blue-400 flex items-center gap-1 mb-0.5 uppercase tracking-widest text-[10px]">
                                  <Sparkles className="h-3 w-3 fill-blue-400 text-blue-400" />
                                  Gemini Dispatch Safety Protocol:
                                </span>
                                <p className="whitespace-pre-line text-slate-300 leading-relaxed font-sans">{inc.aiRecommendation}</p>
                              </div>
                            )}

                            {/* Action Buttons for dispatch */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-[10px] uppercase font-bold">Quick Dispatch:</span>
                                <div className="flex flex-wrap gap-1">
                                  {stadiumState.volunteers
                                    .filter(v => v.status === "Available" || v.id === inc.assignedStaffId)
                                    .slice(0, 3)
                                    .map((v) => (
                                      <button
                                        key={v.id}
                                        onClick={() => handleUpdateIncident(inc.id, "dispatched", v.id)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                                          inc.assignedStaffId === v.id
                                            ? "bg-sky-500 text-black border-sky-400"
                                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                                        }`}
                                      >
                                        Assign {v.name.split(" ")[0]} ({v.languages[0]})
                                      </button>
                                    ))}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {inc.status !== "resolved" ? (
                                  <button
                                    onClick={() => handleUpdateIncident(inc.id, "resolved")}
                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-wider text-[10px] rounded transition-all"
                                  >
                                    Resolve Ticket
                                  </button>
                                ) : (
                                  <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5" /> Resolved
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TOURNAMENT FAN COMPANION VIEW                             */}
          {/* ========================================================== */}
          {activeMode === "fan" && (
            <div className="space-y-8">
              
              {/* DISPLAY TYPOGRAPHY HEADER */}
              <div className="flex flex-col border-b border-white/10 pb-6">
                <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase font-mono mb-2">
                  🏟️ Los Angeles Stadium Fan Companion
                </span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white uppercase">
                  WORLD CUP <span className="text-emerald-500 italic">EXPERIENCE</span>
                </h1>
                <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
                  Interactive real-time guide designed for spectating fans. Discover short-queue entrance gates, concessions, live transit intervals, and instant multilingual guide support.
                </p>
              </div>

              {/* THREE DYNAMIC FAN CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Gate Queue times card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Entry Gate Wait Times
                  </h3>
                  
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[220px] pr-1">
                    {Object.entries(stadiumState.stats.gateQueueTimes).map(([gate, rawMins]) => {
                      const mins = rawMins as number;
                      let delayColor = "bg-emerald-500";
                      let textColor = "text-emerald-400";
                      if (mins > 15) {
                        delayColor = "bg-amber-500";
                        textColor = "text-amber-400";
                      }
                      if (mins > 28) {
                        delayColor = "bg-rose-500";
                        textColor = "text-rose-400";
                      }

                      return (
                        <div key={gate} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-bold">{gate}</span>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-16 rounded overflow-hidden bg-slate-950 inline-block`}>
                              <span className={`h-full block ${delayColor}`} style={{ width: `${Math.min(mins * 2.5, 100)}%` }}></span>
                            </span>
                            <span className={`font-mono font-bold ${textColor}`}>{mins} Mins</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-400 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-blue-400" />
                    Arrive at Gates 10, 11 or 12 to bypass ticket lines.
                  </div>
                </div>

                {/* 2. Live Public Transit Intervals Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Bus className="h-4 w-4 text-sky-400" />
                    Post-Match Transit Connections
                  </h3>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                    {stadiumState.transportStatuses.map((t) => {
                      const isDelayed = t.status === "Delayed" || t.status === "Crowded";
                      return (
                        <div key={t.id} className="text-xs bg-slate-950 p-2 rounded border border-white/5">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="font-bold text-slate-200">{t.mode} • {t.line}</span>
                              <span className="text-[10px] text-slate-500 block">To: {t.destination}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              t.status === "Normal" 
                                ? "bg-emerald-950 text-emerald-400"
                                : t.status === "Crowded"
                                ? "bg-amber-950 text-amber-400"
                                : "bg-rose-950 text-rose-400"
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                            <span>Every {t.frequencyMinutes > 0 ? `${t.frequencyMinutes}m` : "On-Demand"}</span>
                            <span className="font-bold text-slate-200">Est. Wait: {t.waitTimeMinutes}m</span>
                          </div>

                          {t.alertText && (
                            <p className="text-[10px] text-amber-400 mt-1 bg-amber-950/20 p-1 rounded border border-amber-500/10">
                              ⚠️ {t.alertText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Sustainability tracker card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                    Fan Green Impact Counter
                  </h3>

                  <div className="space-y-3 text-xs flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-slate-300 leading-relaxed">
                        Los Angeles Arena is a certified Zero-Waste venue for FIFA 2026. Keep track of how your sustainable actions contribute:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-slate-950 p-3 rounded border border-white/5">
                          <span className="text-[10px] text-slate-400 uppercase font-black block">Total Carbon Saved</span>
                          <span className="text-lg font-mono font-bold text-emerald-400">
                            {stadiumState.stats.carbonSavedKg.toLocaleString()} KG CO₂
                          </span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-white/5">
                          <span className="text-[10px] text-slate-400 uppercase font-black block">Recycling Rate</span>
                          <span className="text-lg font-mono font-bold text-emerald-400">
                            {stadiumState.stats.sustainabilityScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2 rounded border border-emerald-500/20 text-[10px] text-slate-300 flex items-start gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>GenAI Tip:</strong> Drop your drink containers at the Smart Bins near Section 108. Volunteers are distributing commemorative pins for every 3 items recycled!
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* STADIUM DIGITAL TWIN INSPECTOR FOR FANS */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Left side: Interactive Map */}
                <div className="h-full">
                  <StadiumMap
                    zones={stadiumState.stadiumZones}
                    activeIncidents={stadiumState.incidents.filter((i) => i.status !== "resolved")}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
                  />
                </div>

                {/* Right side: Dynamic Food and concession tracker */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
                  
                  <div className="border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-md font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <ShoppingBag className="h-4.5 w-4.5 text-emerald-400" />
                      Food Courts & Concession Locator
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Check which foods and souvenirs are available in your selected zone. Filter to avoid long lines!
                    </p>
                  </div>

                  {/* Filters search bar */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-4 text-xs">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={fanFoodSearch}
                        onChange={(e) => setFanFoodSearch(e.target.value)}
                        placeholder="Search tacos, burgers, gelato, beer..."
                        className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-2 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex gap-1 text-[11px] bg-slate-950 border border-slate-800 p-1 rounded">
                      {(["all", "meals", "drinks", "sweets"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFanFoodFilter(cat)}
                          className={`px-3 py-1 rounded capitalize ${
                            fanFoodFilter === cat
                              ? "bg-emerald-500 text-black font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Concession Zone List Cards */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[350px]">
                    {stadiumState.stadiumZones.map((zone) => {
                      const matchedFoods = filteredConcessionsList(zone);
                      const isSelected = selectedZoneId === zone.id;

                      if (matchedFoods.length === 0) return null;

                      return (
                        <div
                          key={zone.id}
                          onClick={() => setSelectedZoneId(zone.id)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-950 border-emerald-500/40"
                              : "bg-black/30 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-xs text-slate-200">{zone.name}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              zone.densityStatus === "Optimal"
                                ? "text-emerald-400"
                                : zone.densityStatus === "Moderate"
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}>
                              Zone Density: {zone.densityStatus}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {matchedFoods.map((food, i) => (
                              <span
                                key={i}
                                className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-sans"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400">
                    * Tap a zone card above to highlight its location on the stadium digital twin twin map.
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT PANEL: GENAI COPILOT CHATBOT (AURA / CO-PILOT) */}
        <aside className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-black shrink-0 h-[600px] lg:h-auto">
          
          {/* AI Header */}
          <div className="p-4 md:p-6 border-b border-white/10 bg-[#070707] flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-500">Stadium Copilot</span>
              </div>
              <p className="text-white/60 text-[11px] italic font-serif">FIFA World Cup Real-time Support</p>
            </div>

            {/* Quick Language Switcher */}
            <div className="flex items-center gap-1.5">
              <Languages className="h-4 w-4 text-slate-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-950 border border-white/15 rounded text-[10px] px-1.5 py-1 text-white font-mono focus:outline-none"
              >
                {languagesAvailable.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Pre-baked Prompts based on selected mode */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-white/5 flex flex-wrap gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block w-full mb-1">
              Tap Quick Queries ({selectedLanguage}):
            </span>
            {activeMode === "staff" ? (
              <>
                <button
                  onClick={() => handleSendChatMessage("What is the protocol for Gate 3 congestion?")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/5 text-left"
                >
                  "Gate 3 Protocol"
                </button>
                <button
                  onClick={() => handleSendChatMessage("Give me a volunteer summary shift report.")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/5 text-left"
                >
                  "Shift Report"
                </button>
                <button
                  onClick={() => handleSendChatMessage("Are there any Spanish translation staff in South Concourse?")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/5 text-left"
                >
                  "Spanish staff Zone C?"
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendChatMessage("Where can I find vegetarian burgers and short queues?")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/5 text-left"
                >
                  "Vegetarian Food"
                </button>
                <button
                  onClick={() => handleSendChatMessage("How do I take public transportation to LAX airport?")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/5 text-left"
                >
                  "Route to LAX"
                </button>
                <button
                  onClick={() => handleSendChatMessage("Where is the nearest first aid center and elevator?")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/5 text-left"
                >
                  "First Aid / Elevator"
                </button>
              </>
            )}
          </div>

          {/* Chat History Messages Scroll */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black">
            {chatHistory.map((msg) => {
              const isAi = msg.sender === "ai";
              const isStaffMode = msg.sender === "staff";
              return (
                <div key={msg.id} className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                      isAi ? "text-blue-400" : isStaffMode ? "text-slate-400" : "text-emerald-400"
                    }`}>
                      {msg.senderName}
                    </span>
                    <span className="text-[8px] text-slate-600 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                    isAi
                      ? "bg-slate-900 text-slate-200 border border-white/5 rounded-tl-none"
                      : "bg-white text-black font-medium rounded-tr-none"
                  }`}>
                    <p className="whitespace-pre-wrap font-sans">{msg.text}</p>

                    {/* Translation block if present */}
                    {msg.translation && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block not-italic mb-0.5">
                          🌐 English Translation:
                        </span>
                        {msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSendingChat && (
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider mb-1 animate-pulse">
                  Stadium Copilot is typing...
                </span>
                <div className="bg-slate-900 border border-white/5 p-3 rounded-xl rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* AI INPUT BAR */}
          <div className="p-4 border-t border-white/10 bg-[#070707]">
            <div className="relative">
              <input
                type="text"
                placeholder={`Ask Copilot in ${selectedLanguage}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChatMessage();
                }}
                disabled={isSendingChat}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-3 pr-10 text-xs font-medium focus:outline-none focus:border-blue-500/50"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={isSendingChat}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-black p-1 rounded transition-all"
              >
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
            
            <p className="text-[8px] uppercase tracking-tighter text-white/30 mt-3.5 text-center font-bold italic">
              Multilingual GenAI Layer Enabled: [EN, ES, FR, AR, DE, JA, PT, HI]
            </p>
          </div>

        </aside>

      </main>

    </div>
  );
}
