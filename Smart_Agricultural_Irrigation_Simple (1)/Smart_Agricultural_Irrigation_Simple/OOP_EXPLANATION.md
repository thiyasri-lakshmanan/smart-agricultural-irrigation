# Object-Oriented Programming (OOP) Principles Guide
## Smart Agricultural Irrigation and Water Allocation System

This document provides a clear, beginner-friendly guide for your college project review and viva examination. It details how the four core OOP principles (and supporting concepts) are implemented in your Java source code.

---

### Summary Table: OOP Concepts in the Java Codebase

| OOP Concept | Java Class / Interface | Key Feature Demonstrated |
| :--- | :--- | :--- |
| **Encapsulation** | `Reservoir.java`, `Field.java` | `private` variables with controlled `public` methods (`getAvailableWater`, `addWater`, `releaseWater`) and validation |
| **Inheritance** | `RoutineRequest.java`, `DroughtReliefRequest.java` | Subclasses extend the parent class `IrrigationRequest.java` using `super()` |
| **Polymorphism** | `IrrigationRequest.java`, `RoutineRequest.java`, `DroughtReliefRequest.java` | Method overriding of `calculatePriority()` and runtime dynamic dispatch |
| **Abstraction** | `IrrigationRequest.java` | `abstract class` with abstract methods `calculatePriority()` and `requestType()` |
| **Interface** | `Prioritizable.java`, `IrrigationPriorityPolicy.java` | Contract definition (`Prioritizable`) and standard library interface implementation (`Comparator<IrrigationRequest>`) |
| **Constructors & Objects** | All classes (e.g., `Field.java`, `Reservoir.java`) | Parameterized constructors ensuring valid object instantiation |

---

### 1. Encapsulation

#### What is Encapsulation?
Encapsulation is bundling data (attributes) and the methods that operate on that data into a single unit (class), while restricting direct access to internal state using the `private` access modifier. Modifications must go through public methods that validate business rules.

#### Exact Class:
[Reservoir.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/Reservoir.java)

#### Code Example:
```java
public class Reservoir {
    // 1. Private fields prevent direct external modification
    private final String nodeId;
    private final long capacityLitres;
    private long availableLitres;

    // 2. Controlled read access via getter
    public long getAvailableWater() {
        return availableLitres;
    }

    // 3. Controlled write access with validation logic
    public long releaseWater(long requestedLitres) {
        if (requestedLitres <= 0) {
            throw new IllegalArgumentException("Requested litres must be positive.");
        }
        long reserved = Math.min(requestedLitres, availableLitres);
        availableLitres -= reserved;
        return reserved;
    }

    public void addWater(long litres) {
        if (litres <= 0 || availableLitres + litres > capacityLitres) {
            throw new IllegalArgumentException("Invalid refill quantity: exceeds capacity or non-positive.");
        }
        availableLitres += litres;
    }
}
```

#### What to say in your Viva:
> *"In our project, `Reservoir` encapsulates water storage. The field `availableLitres` is marked `private` so that outside classes cannot corrupt the water balance. To consume or replenish water, callers must invoke `releaseWater()` or `addWater()`, which enforce rules such as ensuring water requests are positive and never exceeding capacity."*

---

### 2. Inheritance

#### What is Inheritance?
Inheritance is the mechanism where a new class (child/subclass) derives properties and behaviors from an existing class (parent/superclass) using the `extends` keyword. This promotes code reuse and establishes an "IS-A" relationship.

#### Exact Classes:
- Parent: [IrrigationRequest.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/IrrigationRequest.java)
- Children: [RoutineRequest.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/RoutineRequest.java), [DroughtReliefRequest.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/DroughtReliefRequest.java)

#### Code Example:
```java
// Parent class holds common fields (requestId, fieldId, requestedLitres, etc.)
public abstract class IrrigationRequest { ... }

// RoutineRequest IS-A IrrigationRequest
public class RoutineRequest extends IrrigationRequest {
    public RoutineRequest(String requestId, String fieldId,
                          int cropPriority, double soilMoisture,
                          long requestedLitres, long arrivalOrder) {
        // Calls the parent constructor to initialize shared fields
        super(requestId, fieldId, cropPriority, soilMoisture, requestedLitres, arrivalOrder);
    }
}

// DroughtReliefRequest IS-A IrrigationRequest
public class DroughtReliefRequest extends IrrigationRequest {
    public DroughtReliefRequest(String requestId, String fieldId,
                                int cropPriority, double soilMoisture,
                                long requestedLitres, long arrivalOrder) {
        super(requestId, fieldId, cropPriority, soilMoisture, requestedLitres, arrivalOrder);
    }
}
```

#### What to say in your Viva:
> *"We used inheritance between `IrrigationRequest` (parent) and `RoutineRequest` and `DroughtReliefRequest` (children). Both types of requests share common attributes like `fieldId`, `soilMoisture`, and `requestedLitres`. By inheriting from `IrrigationRequest`, we avoid code duplication and initialize common fields using `super()`."*

---

### 3. Polymorphism

#### What is Polymorphism?
Polymorphism ("many forms") allows objects of different subclasses to be treated through a reference to their parent class or interface. At runtime, the Java Virtual Machine dynamically determines and executes the overridden subclass method (Runtime Polymorphism / Dynamic Method Dispatch).

#### Exact Classes:
- [IrrigationRequest.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/IrrigationRequest.java) (declares method)
- [RoutineRequest.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/RoutineRequest.java) (overrides method)
- [DroughtReliefRequest.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/DroughtReliefRequest.java) (overrides method)
- [Main.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/Main.java#L110-L125) (invokes method polymorphically)

#### Code Example:
In subclasses:
```java
// RoutineRequest calculates priority based on the crop priority (1, 2, or 3)
@Override
public int calculatePriority() {
    return getCropPriority();
}

// DroughtReliefRequest always yields priority 0 (emergency top priority)
@Override
public int calculatePriority() {
    return 0;
}
```

In `Main.java` (demonstrating runtime polymorphism):
```java
List<IrrigationRequest> requests = new ArrayList<>();
requests.add(new RoutineRequest("R1", "F1", 1, 18.0, 5000, 1));
requests.add(new DroughtReliefRequest("R5", "F6", 2, 20.0, 7000, 2));

for (IrrigationRequest req : requests) {
    // Runtime Polymorphism: dynamically dispatches to the child implementation
    System.out.println(req.requestType() + " priority: " + req.calculatePriority());
}
```

#### What to say in your Viva:
> *"We demonstrate runtime polymorphism using the `calculatePriority()` method. Both `RoutineRequest` and `DroughtReliefRequest` override this method. Routine requests return the crop's priority (1 to 3), while emergency drought relief requests return 0 for top priority. When stored in a parent collection `List<IrrigationRequest>`, calling `req.calculatePriority()` invokes the correct subclass method automatically via dynamic method dispatch."*

---

### 4. Abstraction

#### What is Abstraction?
Abstraction means displaying only essential information and hiding implementation complexities. In Java, abstraction is achieved using **abstract classes** and **interfaces**. An abstract class cannot be instantiated directly and can define abstract methods that subclasses are required to implement.

#### Exact Class:
[IrrigationRequest.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/IrrigationRequest.java)

#### Code Example:
```java
public abstract class IrrigationRequest implements Prioritizable {
    // Concrete fields and methods shared by all requests
    private final String requestId;
    private final String fieldId;
    
    // Abstract method: specifies WHAT must be done, not HOW
    public abstract int calculatePriority();
    public abstract String requestType();

    public void confirmDelivery(long litres) {
        this.deliveredLitres += litres;
    }
}
```

#### What to say in your Viva:
> *"Abstraction is implemented via `abstract class IrrigationRequest`. Since a generic request cannot exist on its own without knowing whether it is a routine or emergency drought request, we make the class `abstract`. It declares the abstract method `calculatePriority()`, which guarantees that every concrete subclass must implement its own priority logic."*

---

### 5. Interfaces

#### What is an Interface?
An interface is a pure contract in Java that specifies a set of method signatures without implementation (or with default implementations). A class implements an interface to adhere to that contract.

#### Exact Interfaces in the Project:
1. [Prioritizable.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/Prioritizable.java):
   ```java
   public interface Prioritizable {
       int calculatePriority();
   }
   ```
   Implemented by `IrrigationRequest`.

2. [IrrigationPriorityPolicy.java](file:///d:/Projects/Smart_Agricultural_Irrigation_Simple/src/IrrigationPriorityPolicy.java):
   ```java
   public class IrrigationPriorityPolicy implements Comparator<IrrigationRequest> {
       @Override
       public int compare(IrrigationRequest first, IrrigationRequest second) { ... }
   }
   ```
   Implements Java's built-in `Comparator` interface for priority queue ordering.

#### What to say in your Viva:
> *"We use interfaces to define contracts. `Prioritizable` defines `calculatePriority()`, implemented by `IrrigationRequest`. Additionally, `IrrigationPriorityPolicy` implements Java's `Comparator<IrrigationRequest>` interface to order requests in a PriorityQueue according to priority class, soil moisture, and arrival timestamp."*

---

### How to Compile and Run the Java Program

From the root project directory:
```bash
# Option A: Run the batch file
RUN.bat

# Option B: Run commands in terminal
javac -d out src/*.java
java -cp out Main
```
