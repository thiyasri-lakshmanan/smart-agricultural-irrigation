
public class Main {
    public static void main(String[] args) {
        System.out.println("========================================================================================");
        System.out.println("             SMART AGRICULTURAL IRRIGATION AND WATER ALLOCATION SYSTEM");
        System.out.println("========================================================================================");
        System.out.println();

     
        Reservoir reservoir = new Reservoir("RES", 40000, 18000);
        IrrigationNetwork network = new IrrigationNetwork();
        IrrigationSystem system = new IrrigationSystem(reservoir, network);

      
        system.addField(new Field("F1", "Anbu", new CropProfile("Paddy", 1), 18));
        system.addField(new Field("F2", "Bala", new CropProfile("Banana", 1), 24));
        system.addField(new Field("F3", "Chitra", new CropProfile("Turmeric", 2), 30));
        system.addField(new Field("F4", "Devi", new CropProfile("Cotton", 2), 30));
        system.addField(new Field("F5", "Elango", new CropProfile("Maize", 3), 35));
        system.addField(new Field("F6", "Farida", new CropProfile("Vegetables", 2), 20));
        system.addField(new Field("F7", "Gopal", new CropProfile("Millet", 3), 40));
        system.addField(new Field("F8", "Hema", new CropProfile("Sugarcane", 2), 16));

       
        network.addLink(new CanalLink("L1", "RES", "J1", true));
        network.addLink(new CanalLink("L2", "J1", "J2", true));
        network.addLink(new CanalLink("L3", "J1", "J3", true));
        network.addLink(new CanalLink("L4", "J2", "F1", true));
        network.addLink(new CanalLink("L5", "J2", "F2", true));
        network.addLink(new CanalLink("L6", "J2", "F3", true));
        network.addLink(new CanalLink("L7", "J3", "F4", true));
        network.addLink(new CanalLink("L8", "J3", "F5", true));
        network.addLink(new CanalLink("L9", "J3", "J4", true));
        network.addLink(new CanalLink("L10", "J4", "F6", true));
        network.addLink(new CanalLink("L11", "J4", "F7", true));
        network.addLink(new CanalLink("L12", "J4", "F8", false)); // L12 initially blocked

        
        system.displaySystemInitialization();


        system.addRequest(new RoutineRequest("R1", "F1", 1, 18, 5000, 1));
        system.addRequest(new RoutineRequest("R2", "F8", 2, 16, 6000, 2));
        system.addRequest(new RoutineRequest("R3", "F3", 2, 30, 5000, 3));
        system.addRequest(new RoutineRequest("R4", "F4", 2, 30, 5000, 4));
        system.addRequest(new DroughtReliefRequest("R5", "F6", 2, 20, 7000, 5));

        
        for (int i = 1; i <= 8; i++) {
            system.recordEvent("Manual moisture reading received for F" + i + ".");
        }
        system.recordEvent("Weather label: SUNNY.");
        system.recordEvent("Weather label: CLOUDY.");
        system.recordEvent("Weather label: LIGHT RAIN.");
        system.recordEvent("Weather label: DRY WEEK.");
        for (int i = 1; i <= 8; i++) {
            system.recordEvent("Canal inspection update " + i + " recorded.");
        }

        
        System.out.println();
        system.displayRequestsAndPriorityOrder();

        
        System.out.println();
        System.out.println("========================================================================================");
        System.out.println("SECTION 3 - WATER ALLOCATION PROCESS");
        System.out.println("========================================================================================");
        System.out.println();
        system.allocateWater();

        // SECTION 4 - WEATHER AND REQUEST UPDATES
        System.out.println();
        System.out.println("========================================================================================");
        System.out.println("SECTION 4 - WEATHER AND REQUEST UPDATES");
        System.out.println("========================================================================================");
        System.out.println();
        system.reviseRequest("R2", 38, 3500, "LIGHT RAIN");
        System.out.println();
        System.out.println("[RE-EVALUATED PENDING REQUESTS IN PRIORITY QUEUE]");
        system.showPriorityQueue();

        // SECTION 5 - CANAL REPAIR AND WATER REFILL
        System.out.println();
        System.out.println("========================================================================================");
        System.out.println("SECTION 5 - CANAL REPAIR AND WATER REFILL");
        System.out.println("========================================================================================");
        System.out.println();
        system.updateCanal("L12", true);
        System.out.println();
        system.refillReservoir(15000);

        // SECTION 6 - REALLOCATION
        System.out.println();
        System.out.println("========================================================================================");
        System.out.println("SECTION 6 - REALLOCATION");
        System.out.println("========================================================================================");
        System.out.println();
        system.allocateWater();

        // SECTION 7 - FINAL SYSTEM STATUS
        System.out.println();
        system.displayFinalSystemStatus();
    }
}
