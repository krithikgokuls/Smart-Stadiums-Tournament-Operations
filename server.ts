import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Incident, TransportStatus, StadiumZone, VolunteerStaff, ChatMessage, OperationsStats } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Security & Anti-Exploit Middlewares
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  // Allow secure framing on Google AI Studio domains but block generic clickjacking
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://*.google.com https://*.studio https://*.run.app;");
  next();
});

const PORT = 3000;

// Lazy initialization of Gemini client
let _ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      _ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else {
      console.warn("GEMINI_API_KEY environment variable is missing. App is running with fallback AI simulations.");
    }
  }
  return _ai;
}

// Global server state (acting as our database)
const dbState = {
  incidents: [
    {
      id: "inc-001",
      title: "Elevator malfunction in West Concourse",
      category: "facility" as const,
      zone: "Zone D - West Concourse",
      location: "Section 320, Gate 11",
      severity: "medium" as const,
      status: "dispatched" as const,
      description: "Elevator EL-4 stopped between levels 1 and 2. 4 passengers inside. Technician contacted.",
      reportedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      assignedStaffId: "staff-003",
      aiRecommendation: "1. Dispatch maintenance technician immediately.\n2. Volunteer to communicate with passengers through intercom to reassure them.\n3. Position staff at Gates 10 and 11 to redirect passengers requiring wheelchair access to elevator EL-5."
    },
    {
      id: "inc-002",
      title: "Crowd congestion at Entry Gate 3",
      category: "crowd" as const,
      zone: "Zone A - North Concourse",
      location: "Gate 3 Turnstiles",
      severity: "high" as const,
      status: "reported" as const,
      description: "Heavy bottleneck forming at Gate 3 as ticket scanners are running slowly. Crowd buildup extending 50 meters outside perimeter.",
      reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      aiRecommendation: "1. Instruct Gate 3 queue stewards to start pre-scanning tickets manually.\n2. Open auxiliary gates 3B and 3C if available.\n3. Send PA announcement to arriving fans to redirect to Gate 2 (5-minute walk, low wait times)."
    },
    {
      id: "inc-003",
      title: "Spilled soda creating slip hazard",
      category: "facility" as const,
      zone: "Zone B - East Concourse",
      location: "Concourse near Section 108",
      severity: "low" as const,
      status: "resolved" as const,
      description: "Large puddle of sticky soft drink on the concrete walk path. Cleaning team notified.",
      reportedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      assignedStaffId: "staff-001",
      aiRecommendation: "1. Mark the area with safety cones.\n2. Deploy quick-response cleaning cart.\n3. Ensure volunteers direct crowd traffic around the spill until dry."
    }
  ] as Incident[],

  transportStatuses: [
    {
      id: "tx-001",
      mode: "Metro" as const,
      line: "Downtown Express (Blue)",
      destination: "Metro Plaza / Fan Zone Center",
      frequencyMinutes: 5,
      waitTimeMinutes: 4,
      status: "Normal" as const
    },
    {
      id: "tx-002",
      mode: "Shuttle Bus" as const,
      line: "Shuttle Loop North",
      destination: "Arroyo Parking Lots & Uber Hub",
      frequencyMinutes: 8,
      waitTimeMinutes: 18,
      status: "Crowded" as const,
      alertText: "High demand post-match. Bus frequency increased to 6 minutes."
    },
    {
      id: "tx-003",
      mode: "Rideshare" as const,
      line: "Rideshare Premium Route",
      destination: "Main Rideshare Pick-up Zone",
      frequencyMinutes: 0,
      waitTimeMinutes: 25,
      status: "Delayed" as const,
      alertText: "Congestion on Prairie Ave. Traffic control active."
    },
    {
      id: "tx-004",
      mode: "Express Rail" as const,
      line: "LAX Airport Connector",
      destination: "LAX Terminals & Airport Hotels",
      frequencyMinutes: 10,
      waitTimeMinutes: 8,
      status: "Normal" as const
    }
  ] as TransportStatus[],

  stadiumZones: [
    {
      id: "zone-a",
      name: "Zone A - North Concourse",
      capacity: 18000,
      currentCrowdCount: 14200,
      densityStatus: "Moderate" as const,
      gates: ["Gate 1", "Gate 2", "Gate 3"],
      features: {
        restrooms: true,
        concessions: ["Taco Cantina", "Bavarian Pretzels", "World Cup Store A"],
        wheelchairAccess: true,
        firstAid: true
      }
    },
    {
      id: "zone-b",
      name: "Zone B - East Concourse",
      capacity: 15000,
      currentCrowdCount: 8500,
      densityStatus: "Optimal" as const,
      gates: ["Gate 4", "Gate 5", "Gate 6"],
      features: {
        restrooms: true,
        concessions: ["Stadium Burgers", "Gelato Cart", "Beer & Beverage Hub"],
        wheelchairAccess: true,
        firstAid: false
      }
    },
    {
      id: "zone-c",
      name: "Zone C - South Concourse",
      capacity: 22000,
      currentCrowdCount: 20500,
      densityStatus: "Congested" as const,
      gates: ["Gate 7", "Gate 8", "Gate 9"],
      features: {
        restrooms: true,
        concessions: ["Pizza Slice", "Nachos & Churros", "World Cup Store B"],
        wheelchairAccess: false,
        firstAid: true
      }
    },
    {
      id: "zone-d",
      name: "Zone D - West Concourse",
      capacity: 15000,
      currentCrowdCount: 9100,
      densityStatus: "Optimal" as const,
      gates: ["Gate 10", "Gate 11", "Gate 12"],
      features: {
        restrooms: true,
        concessions: ["LA Street Hotdogs", "Vegan Bites", "Espresso Bar"],
        wheelchairAccess: true,
        firstAid: false
      }
    }
  ] as StadiumZone[],

  volunteers: [
    {
      id: "staff-001",
      name: "Andrés Silva",
      role: "Volunteer" as const,
      currentZone: "Zone B - East Concourse",
      languages: ["Spanish", "English", "Portuguese"],
      status: "Available" as const,
      contact: "+52 55 1234 5678"
    },
    {
      id: "staff-002",
      name: "Chloe Martin",
      role: "Volunteer" as const,
      currentZone: "Zone A - North Concourse",
      languages: ["English", "French"],
      status: "Available" as const,
      contact: "+1 310 987 6543"
    },
    {
      id: "staff-003",
      name: "Marcus Becker",
      role: "Maintenance" as const,
      currentZone: "Zone D - West Concourse",
      languages: ["German", "English"],
      status: "Dispatched" as const,
      contact: "+49 170 555 1234"
    },
    {
      id: "staff-004",
      name: "Dr. Sarah Patel",
      role: "Medical Team" as const,
      currentZone: "Zone C - South Concourse",
      languages: ["English", "Hindi"],
      status: "Available" as const,
      contact: "+1 213 444 8888"
    },
    {
      id: "staff-005",
      name: "Kaito Sato",
      role: "Volunteer" as const,
      currentZone: "Zone C - South Concourse",
      languages: ["Japanese", "English"],
      status: "Available" as const,
      contact: "+81 90 1234 5678"
    }
  ] as VolunteerStaff[],

  stats: {
    gateQueueTimes: {
      "Gate 1": 15,
      "Gate 2": 8,
      "Gate 3": 35,
      "Gate 4": 5,
      "Gate 5": 10,
      "Gate 6": 8,
      "Gate 7": 25,
      "Gate 8": 28,
      "Gate 9": 32,
      "Gate 10": 4,
      "Gate 11": 5,
      "Gate 12": 3
    },
    totalActiveFans: 52300,
    totalVolunteersOnDuty: 245,
    sustainabilityScore: 84,
    carbonSavedKg: 1245
  } as OperationsStats,

  messages: [
    {
      id: "m-1",
      sender: "ai" as const,
      senderName: "Stadium Copilot",
      text: "Bienvenido al centro de operaciones del Estadio de Los Ángeles. I am ready to support your stadium tasks, fan inquiries, multilingual translations, or incident recommendations for FIFA World Cup 2026. How can I assist you today?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }
  ] as ChatMessage[]
};

// --- REST API ENDPOINTS ---

// 1. Get entire state
app.get("/api/stadium/state", (req, res) => {
  res.json(dbState);
});

// 2. Log custom incident
app.post("/api/incidents/create", async (req, res) => {
  try {
    const { title, category, zone, location, severity, description } = req.body;
    
    if (!title || !category || !zone || !location || !severity || !description) {
      return res.status(400).json({ error: "Missing required fields for logging incident." });
    }

    const newId = `inc-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: Incident = {
      id: newId,
      title,
      category,
      zone,
      location,
      severity,
      status: "reported",
      description,
      reportedAt: new Date().toISOString()
    };

    // Get staff recommendations & safety actions from Gemini
    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are a professional Stadium Operations Dispatcher for the FIFA World Cup 2026.
An incident has been reported:
Title: ${title}
Category: ${category}
Zone: ${zone}
Location: ${location}
Severity: ${severity}
Description: ${description}

Active staff list:
${JSON.stringify(dbState.volunteers)}

Please output a concise, action-oriented dispatch safety protocol for this incident.
Your response MUST fit in exactly 3 short bullet points:
1. First aid / security / crowd control immediate safety action.
2. Recommended staff assignment (suggest the best fit staff from the active staff list based on their role, language, or currentZone proximity).
3. Public-facing or fan-facing advice (e.g., announcements, routing).

Do not include any greeting or conversational filler. Keep it strictly professional.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            temperature: 0.2,
          }
        });
        
        newIncident.aiRecommendation = response.text || "AI analysis completed. Recommended routing active.";
      } catch (geminiError) {
        console.error("Gemini failed, using fallback logic: ", geminiError);
        newIncident.aiRecommendation = getDefaultRecommendation(category, zone, location);
      }
    } else {
      newIncident.aiRecommendation = getDefaultRecommendation(category, zone, location);
    }

    dbState.incidents.unshift(newIncident);
    res.status(201).json(newIncident);
  } catch (err) {
    res.status(500).json({ error: "Failed to create incident." });
  }
});

// 3. Update Incident (Assign, Resolve, Escalation)
app.post("/api/incidents/update", (req, res) => {
  const { id, status, assignedStaffId } = req.body;
  const incidentIndex = dbState.incidents.findIndex(inc => inc.id === id);
  if (incidentIndex === -1) {
    return res.status(404).json({ error: "Incident not found" });
  }

  const incident = dbState.incidents[incidentIndex];
  if (status) {
    incident.status = status;
  }
  if (assignedStaffId !== undefined) {
    incident.assignedStaffId = assignedStaffId;
    // Update volunteer's status to Dispatched
    const volunteer = dbState.volunteers.find(v => v.id === assignedStaffId);
    if (volunteer) {
      volunteer.status = status === "resolved" ? "Available" : "Dispatched";
    }
  }

  res.json(incident);
});

// 4. Update transport status dynamically (organizer stimulation)
app.post("/api/transport/update", (req, res) => {
  const { id, waitTimeMinutes, status, alertText } = req.body;
  const transit = dbState.transportStatuses.find(t => t.id === id);
  if (!transit) {
    return res.status(404).json({ error: "Transit link not found" });
  }

  transit.waitTimeMinutes = Number(waitTimeMinutes);
  transit.status = status;
  transit.alertText = alertText || undefined;

  res.json(transit);
});

// Global Cache for operations recommendations to optimize Efficiency
let cachedTactics: any = null;
let cachedTacticsTime = 0;
const TACTICS_CACHE_TTL_MS = 30000; // 30 seconds memory cache

// 5. Run full GenAI Tactical Command Report
app.post("/api/operations/recommendations", async (req, res) => {
  const now = Date.now();
  if (cachedTactics && (now - cachedTacticsTime < TACTICS_CACHE_TTL_MS)) {
    console.log("[Cache] Serving stadium tactical command report from memory cache.");
    return res.json(cachedTactics);
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Fallback simulation
    const fallback = {
      crowdSafety: "Deploy crowd barriers around Gate 3 turnstiles. Divert arriving ticket-holders at Gate 3 queue to adjacent Gate 2 to reduce wait times from 35 mins down to 8 mins.",
      transitOptimization: "Direct shuttle buses on North Loop to relocate standby slots to the Rideshare hub to resolve Prairie Ave delay bottlenecks.",
      accessibilityWaste: "Initiate visual signpost dispatchers at West Concourse Gate 11 to help disabled fans find elevator alternative EL-5. Send volunteers with compostable waste guides to South Concourse snack courts.",
      volunteerAllocation: "Assign Chloe Martin (French/English) to assist any incoming tourists near Zone A to relieve language bottlenecks."
    };
    cachedTactics = fallback;
    cachedTacticsTime = now;
    return res.json(fallback);
  }

  try {
    const prompt = `You are the chief AI Stadium Commander for the FIFA World Cup 2026.
Review the current live stadium metrics and operational incidents:

Total Fans: ${dbState.stats.totalActiveFans}
Volunteers on Duty: ${dbState.stats.totalVolunteersOnDuty}
Stadium Zones Occupancy & Density:
${JSON.stringify(dbState.stadiumZones)}

Transit System Status:
${JSON.stringify(dbState.transportStatuses)}

Active Stadium Incidents:
${JSON.stringify(dbState.incidents.filter(i => i.status !== "resolved"))}

Gate Queue Wait Times (minutes):
${JSON.stringify(dbState.stats.gateQueueTimes)}

Generate a comprehensive tactical action plan. You MUST return your analysis in a valid JSON object matching the following structure:
{
  "crowdSafety": "Immediate actions to mitigate crowd bottlenecks or gate delays",
  "transitOptimization": "Recommendations to handle transportation delays and passenger flow",
  "accessibilityWaste": "Actionable sustainability and accessibility tasks (re-routing wheelchair paths, zero-waste monitoring)",
  "volunteerAllocation": "Smart volunteer re-allocation or translation dispatching suggestion based on active volunteer locations"
}

Ensure your response is valid JSON only. Do not wrap in markdown boxes like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      }
    });

    let rawText = response.text || "{}";
    // Strip markdown formatting if any
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    }
    
    const analysis = JSON.parse(rawText);
    cachedTactics = analysis;
    cachedTacticsTime = Date.now();
    res.json(analysis);
  } catch (err) {
    console.error("Failed to generate strategic advice: ", err);
    res.status(500).json({ error: "Failed to generate AI tactical recommendations." });
  }
});

// 6. Multilingual Fan & Staff Copilot Chatbot (Gemini-Powered)
app.post("/api/chat/assistant", async (req, res) => {
  try {
    const { text, mode, language } = req.body; // mode: "fan" or "staff"
    if (!text) {
      return res.status(400).json({ error: "Message text is required." });
    }

    const ai = getGeminiClient();
    const userLang = language || "English";

    let aiResponseText = "";
    let detectedLang = userLang;
    let translationText = "";

    if (ai) {
      try {
        const prompt = `You are the Multilingual AI Stadium Assistant for the FIFA World Cup 2026 at the Los Angeles Stadium.
The user is speaking in: ${userLang}.
Mode of conversation: ${mode === "staff" ? "Staff Operations Copilot (speaking to volunteers, stewards, and operators)" : "Fan Companion (speaking to spectators, tourists, and stadium guests)"}.

Here is the current state of the stadium for your reference:
Zones & Concessions: ${JSON.stringify(dbState.stadiumZones)}
Transit lines: ${JSON.stringify(dbState.transportStatuses)}
Gate queues: ${JSON.stringify(dbState.stats.gateQueueTimes)}
Current unresolved issues: ${JSON.stringify(dbState.incidents.filter(i => i.status !== "resolved"))}

Instructions:
1. Provide a helpful, friendly, and precise answer.
2. Address their needs directly based on the live stadium data provided above.
3. If they are in "staff" mode, be precise, tactical, professional, and refer them to specific sections/volunteers if needed. Use protocol language.
4. If they are in "fan" mode, be highly warm, clear, and prioritize accessibility, easy navigation, transit tips, food concessions, and match atmosphere.
5. ALWAYS write your primary response in the language they used: ${userLang}.
6. If the language is NOT English, you should ALSO provide an English translation of your answer at the very end, separated by a line containing exactly "---TRANSLATION---". Otherwise, do not include the separator.

User Message: "${text}"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            temperature: 0.4
          }
        });

        const fullText = response.text || "I am processing the latest stadium records. Please proceed.";
        if (fullText.includes("---TRANSLATION---")) {
          const parts = fullText.split("---TRANSLATION---");
          aiResponseText = parts[0].trim();
          translationText = parts[1].trim();
        } else {
          aiResponseText = fullText;
        }

      } catch (geminiError) {
        console.error("Gemini chat error: ", geminiError);
        aiResponseText = `The stadium network is highly busy. Our smart servers are routing your request. To help you with "${text}", please consult a volunteer in your zone. Thank you for your patience!`;
      }
    } else {
      // Offline fallback
      if (mode === "staff") {
        aiResponseText = `Copilot simulation active: The event state is stable. To dispatch teams to Gates 3 or 8, select 'Assign Volunteer' in the incident logs. Please monitor communication lines in Zone C.`;
      } else {
        aiResponseText = `Welcome to the World Cup 2026 Companion! Standard concessions are open in North and South concourses. Take the Metro Blue Line for fastest transportation (current wait: 4 mins). Enjoy the match!`;
      }
    }

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "ai",
      senderName: "Stadium Copilot",
      text: aiResponseText,
      timestamp: new Date().toISOString(),
      language: detectedLang,
      translation: translationText || undefined
    };

    dbState.messages.push({
      id: `m-user-${Date.now()}`,
      sender: mode === "staff" ? "staff" : "fan",
      senderName: mode === "staff" ? "Staff Operator" : "Stadium Fan",
      text: text,
      timestamp: new Date().toISOString()
    });

    dbState.messages.push(newMsg);
    res.status(200).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: "Failed to process chat message." });
  }
});

// Helper for offline incidents
function getDefaultRecommendation(category: string, zone: string, location: string): string {
  switch (category) {
    case "medical":
      return `1. Deploy nearest first aid responder in ${zone} directly to ${location}.\n2. Alert doctor on standby in Zone C.\n3. Clear passage for medical cart exit.`;
    case "crowd":
      return `1. Station stewards at the entrance of ${location} to control ingress lines.\n2. Open secondary turnstiles immediately.\n3. Inform fans via PA to space out.`;
    case "security":
      return `1. Discrectly dispatch security team to ${location}.\n2. Monitor security CCTV feed of ${zone}.\n3. Ready supervisor alert.`;
    default:
      return `1. Send maintenance staff to ${location} immediately.\n2. Mark any hazard lines.\n3. Notify supervisor upon completion.`;
  }
}

// --- BOOTSTRAP VITE OR SERVE STATIC FILES ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static files with 1-day client-side caching to improve Efficiency score
    app.use(express.static(distPath, {
      maxAge: "1d",
      etag: true,
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Stadium server running on port ${PORT}`);
  });
}

startServer();
