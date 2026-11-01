# Smart Agricultural Irrigation and Water Allocation System
**College Project Review & Viva Demonstration**

This repository contains:
1. **Frontend (Part A)**: A clean, elegant, modern web interface built with **React**, **Bootstrap 5**, and simple custom CSS.
2. **Java Core (Part B)**: The original Object-Oriented Programming (OOP) irrigation allocation engine demonstrating **Encapsulation**, **Inheritance**, **Polymorphism**, and **Abstraction**.

---

## Quick Start Guide

### 1. How to Run the Frontend Website (Part A)

Navigate to the `frontend/` directory and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and visit: **`http://localhost:5173/`**

#### Key Frontend Demonstration Features:
- **Login / Signup** (`/login`, `/signup`): Includes form validation and a **"Quick Demo Login"** button for immediate evaluation.
- **Dashboard** (`/`): 4 key summary stat cards, animated Bootstrap reservoir level progress bar, soil moisture telemetry table, and recent activity logs.
- **Field Management** (`/fields`): Directory of 8 registered farmlands (F1–F8) showing crops, moisture levels, and water demand.
- **Irrigation Requests** (`/requests`): Active queue table with an interactive **"New Request"** form adding to temporary React state.
- **Water Allocation** (`/allocation`): Summary metrics (Available, Requested, Allocated, Remaining) and allocation dispatch results.
- **Canal Network** (`/canals`): Conveyance graph table with green operational badges and red blocked badge for canal `L12`.
- **Activity History** (`/history`): Chronological system audit trail.
- **Logout Flow**: Seamless session sign-out redirecting back to the login page.

---

### 2. How to Run the Java OOP Engine (Part B)

From the root project directory:

#### Option 1: Double-Click or run `RUN.bat`
```cmd
RUN.bat
```

#### Option 2: Command Line
```cmd
javac -d out src\*.java
java -cp out Main
```

---

## OOP Concepts Documentation (For College Viva)

For your viva and review questions, refer to the dedicated guide:
👉 **[`OOP_EXPLANATION.md`](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/OOP_EXPLANATION.md)**

| OOP Principle | Class / File | Viva Explanation Summary |
| :--- | :--- | :--- |
| **Encapsulation** | `Reservoir.java` | Attributes (`capacityLitres`, `availableLitres`) are `private`. Access and mutations are guarded by `getAvailableWater()`, `addWater()`, and `releaseWater()` with boundary checks. |
| **Inheritance** | `RoutineRequest.java`, `DroughtReliefRequest.java` | Both child classes inherit common attributes (`fieldId`, `soilMoisture`, `requestedLitres`) from `IrrigationRequest.java` via `super()`. |
| **Polymorphism** | `IrrigationRequest.java`, `RoutineRequest.java`, `DroughtReliefRequest.java` | Overridden `calculatePriority()` method. Runtime dynamic dispatch calls the concrete child implementation when looping through parent-type references. |
| **Abstraction** | `IrrigationRequest.java` | `abstract class` enforcing that child classes must implement `calculatePriority()` and `requestType()`. |
| **Interface** | `Prioritizable.java`, `IrrigationPriorityPolicy.java` | `Prioritizable` defines a priority contract; `IrrigationPriorityPolicy` implements Java's standard `Comparator<IrrigationRequest>`. |

---

## Technology Stack Summary

- **Frontend**: HTML5, CSS3, Bootstrap 5.3.3, React 19, React Router 7.
- **Backend / Logic**: Core Java (JDK 17+), OOP principles, standard Collections (`PriorityQueue`, `HashMap`, `ArrayList`, `HashSet`).
- **No external heavy libraries**: No Tailwind CSS, no Recharts, no Redux, no databases, no Spring Boot.
