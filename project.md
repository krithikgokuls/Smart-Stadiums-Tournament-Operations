# Smart Stadiums & Tournament Operations
### FIFA World Cup 2026™ Tactical Command & Fan Companion

**Smart Stadiums & Tournament Operations** is a premium, GenAI-enabled full-stack application built for organizers, stewards, and fans attending matches during the FIFA World Cup 2026. The solution leverages Google Gemini (via the `@google/genai` SDK) to coordinate stadium operations, dispatch volunteers, analyze safety incidents, and deliver seamless multilingual fan support.

---

## 🎨 Visual Theme & Identity
The application implements a high-contrast **Bold Typography & Slate Dark** theme that mirrors elite modern tournament dashboards:
- **Display Typography**: Large, heavy headers with condensed tracking that deliver critical metrics immediately.
- **Micro-interactions**: Pulse elements indicating live incidents, crisp hover feedback, and real-time state synchronization.
- **Layout Architecture**: 
  - **Left Navigation Rail**: For instant context switches.
  - **Stadium Digital Twin**: Interactive SVG-based map of the arena showing live zone crowd density levels (Optimal, Moderate, Congested) and coordinates of reported incidents.
  - **AURA Intelligence Feeds**: Generative AI recommendation side-drawers for both staff and spectators.

---

## 🚀 Core Features & Workspaces

### 1. 🏟️ Stadium Command Center (Organizer / Staff Mode)
- **Interactive Arena Digital Twin**: Monitors Zone occupancy, entry-gate bottlenecks, and restrooms/first-aid layers.
- **AURA Live Strategic Command**: A GenAI operations engine that analyzes active gates, transit statuses, and reported incidents to generate instant tactical dispatch plans.
- **Incident Log & Volunteer Dispatch**: Log safety incidents (medical, crowd, facility, security) and leverage Gemini to generate unique safety protocols and assign optimal bilingual volunteers based on proximity and role.
- **Transit Control Desk**: Real-time simulation of shuttle, rail, and rideshare loop status.

### 2. ⚽ Tournament Fan Companion (Fan Mode)
- **Live Entry Gate Queues**: Displays active wait times across all stadium gates so fans can divert to short-queue entrances.
- **Concessions & Amenities Finder**: Food, beverage, and accessibility filters customized per zone.
- **Multilingual Fan Copilot**: Speak directly to the AI Assistant in 8 languages (Spanish, English, French, Portuguese, German, Arabic, Hindi, Japanese). It instantly answers questions regarding arena locations, concessions, transit updates, and security details.

---

## 🏗️ Technical Architecture & Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: `lucide-react`
- **Map & Layout**: Interactive inline SVG Digital Twin with CSS transitions.

### Backend & GenAI
- **Server**: Express (running on Node.js)
- **Integration**: `@google/genai` SDK (Gemini 3.5 Flash)
- **Routing**: API routes proxying Gemini calls to hide API keys from client-side inspectors.
- **Environment Management**: Robust environment detection mapping local systems vs. production Cloud Run containers.

---

## 📦 How to Export to GitHub
As an AI coding assistant, I run entirely within your sandboxed AI Studio developer environment. You can easily export this entire workspace (including all components, styles, configurations, and backend files) directly to GitHub:

1. Locate the **Settings / Export** menu in the top-right corner of the **Google AI Studio** user interface.
2. Click **Export to GitHub** or **Download ZIP**.
3. Authenticate with your GitHub account to initialize a brand new repository or download the source code locally!
