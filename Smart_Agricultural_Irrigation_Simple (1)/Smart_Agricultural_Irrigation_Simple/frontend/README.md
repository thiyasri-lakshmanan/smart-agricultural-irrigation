# AgriFlow — Smart Agricultural Irrigation & Water Allocation System (Frontend)

> Modern, responsive React frontend prototype built for the **Smart Agricultural Irrigation and Water Allocation System** (Phase 2 College Project Review).

---

## 🌟 Key Features

1. **Authentication Interface (Page 1 — `/auth`)**
   - Clean demonstration authentication with toggle between **Sign In** and **Create Demo Account**.
   - Show/hide password visibility toggle.
   - 1-Click Evaluator access buttons (**Er. Karthik Ram - Chief Supervisor** & **Dr. Priya Selvam - Field Agronomist**).
   - Clear banner stating frontend-only demo mode, decoupled for easy future backend integration.

2. **Operations Dashboard (Page 2 — `/`)**
   - Summary telemetry stat cards: Total Fields (8), Reservoir Water Available (18,000 L / 40,000 L), Pending Demands, Completed Allocations, and Blocked Canals (Link L12).
   - Reservoir capacity progress bar with safety thresholds and live inflow status.
   - Soil moisture analytics chart (Recharts) with critical threshold line at 20%.
   - Water delivery chart (Requested vs Delivered Litres).
   - Attention roster for low-moisture fields and quick allocation simulation trigger.

3. **Field Management (Page 3 — `/fields`)**
   - Roster of all 8 agricultural fields derived from the Java project (`F1` Paddy, `F2` Banana, `F3` Turmeric, `F4` Cotton, `F5` Maize, `F6` Vegetables, `F7` Millet, `F8` Sugarcane).
   - Toggle between **Visual Grid Cards** and **Tabular Data View**.
   - Real-time search by field ID, farmer name, crop, or zone.
   - Filtering by Crop Priority (1, 2, 3) and Irrigation Status.
   - Interactive **Add Field** modal and **Edit Field** modal.

4. **Irrigation Requests & Priorities (Page 4 — `/requests`)**
   - Visualizes the Priority Queue sorting policy:
     1. Priority Class: Drought Relief (`Class 0` emergency) > High (`Class 1`) > Medium (`Class 2`) > Standard (`Class 3`).
     2. Soil Moisture: Driest parcels scheduled first.
     3. Arrival Order timestamp ranking.
   - **New Request** submission modal.
   - **Operator-Approved Rain Revision** modal (matches Java `reviseRequest(R2, 38, 3500, "LIGHT RAIN")`).

5. **Water Allocation Engine (Page 5 — `/allocation`)**
   - Head reservoir capacity, available reserves, demanded water, and fulfilled litres.
   - Multi-segment progress bar showing delivered vs unmet demand vs reservoir reserves.
   - Interactive **Run Allocation Simulation** button executing priority dispatch and partial deliveries.
   - Inflow Refill modal.

6. **Canal Network & Routing (Page 6 — `/canals`)**
   - Custom SVG network topology diagram showing 13 nodes (`RES`, `J1`–`J4`, `F1`–`F8`) and 12 canal links (`L1`–`L12`).
   - Active canals rendered in solid emerald green; blocked canals rendered in dashed red with warning badges.
   - Interactive **Repair Canal Now** button that updates `L12` to operational and recomputes BFS reachability in real time.

7. **Activity & Event History (Page 7 — `/history`)**
   - Chronological audit log with more than 20 events covering sensor reads, weather tags (`SUNNY`, `CLOUDY`, `LIGHT RAIN`, `DRY WEEK`), canal maintenance, and allocation runs.
   - Category and status filters with search capabilities.

---

## 🛠️ Technology Stack

- **Framework**: React 18 / 19 with Vite
- **Styling**: Tailwind CSS v3 with custom forest green color palette
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Shared React Context (`IrrigationContext.jsx`) — pure frontend state with zero external databases or backend dependencies.

---

## 🚀 How to Install and Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Steps

1. Open a terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

5. To create an optimized production build:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
frontend/
├── index.html                 # HTML shell with Google Fonts & meta tags
├── package.json               # Dependencies & build scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind configuration with forest palette
└── src/
    ├── main.jsx               # Application entry point
    ├── App.jsx                # Layout wrapper & React Router routes
    ├── index.css              # Tailwind base directives & custom scrollbars
    ├── components/
    │   ├── Sidebar.jsx        # Responsive navigation sidebar with reservoir gauge
    │   ├── TopNavbar.jsx      # Sticky top navigation with weather & alerts
    │   ├── StatCard.jsx       # Polished metric cards with color accents
    │   └── Modal.jsx          # Reusable accessible dialog modal
    ├── context/
    │   └── IrrigationContext.jsx # Central state: BFS reachability, allocation, auth, canal repairs
    ├── data/
    │   └── initialData.js     # Exact mock dataset derived from the Java console project
    └── pages/
        ├── AuthPage.jsx           # Page 1: Login & Signup demo interface
        ├── Dashboard.jsx          # Page 2: Analytics & operations dashboard
        ├── FieldManagement.jsx    # Page 3: Agricultural parcel roster & modals
        ├── IrrigationRequests.jsx # Page 4: Priority queue & rain revision
        ├── WaterAllocation.jsx    # Page 5: Water balance & dispatch simulation
        ├── CanalNetwork.jsx       # Page 6: SVG canal topology diagram
        └── ActivityHistory.jsx    # Page 7: Chronological telemetry audit log
```

---

## 🔒 Decoupled Architecture & Future Backend Readiness

- **Zero Backend / Zero Database**: All features run smoothly purely within React state in the browser.
- **Service-Ready**: All functions inside `IrrigationContext.jsx` are cleanly named (`addField`, `allocateWater`, `repairCanal`, `refillReservoir`) so they can be replaced by asynchronous REST API calls in Phase 3 without refactoring the UI.
- **Original Java Logic Untouched**: The console Java application remains intact in the root directory.
