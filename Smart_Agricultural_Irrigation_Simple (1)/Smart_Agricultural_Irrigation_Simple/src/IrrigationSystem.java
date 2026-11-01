import java.util.*;

public class IrrigationSystem {
    private final Reservoir reservoir;
    private final IrrigationNetwork network;
    private final Map<String, Field> fields = new LinkedHashMap<>();
    private final Map<String, IrrigationRequest> requests = new LinkedHashMap<>();
    private final PriorityQueue<IrrigationRequest> waitingRequests;
    private final ArrayList<String> allocationHistory = new ArrayList<>();
    private final ArrayList<String> eventHistory = new ArrayList<>();

    public IrrigationSystem(Reservoir reservoir,
                            IrrigationNetwork network) {
        this.reservoir = reservoir;
        this.network = network;
        waitingRequests = new PriorityQueue<>(new IrrigationPriorityPolicy());
    }

    public void addField(Field field) {
        fields.put(field.getFieldId(), field);
    }

    public void addRequest(IrrigationRequest request) {
        requests.put(request.getRequestId(), request);
        waitingRequests.offer(request);
    }

    public void recordEvent(String event) {
        eventHistory.add("Event " + (eventHistory.size() + 1) + ": " + event);
    }

    public void reviseRequest(String requestId, double moisture,
                              long revisedLitres, String weatherLabel) {
        IrrigationRequest request = requests.get(requestId);
        if (request == null) throw new IllegalArgumentException("Unknown request.");

        Field field = fields.get(request.getFieldId());
        double prevMoisture = request.getSoilMoisture();
        long prevRequirement = request.getRequestedLitres();

        waitingRequests.remove(request);
        request.reviseRequest(moisture, revisedLitres);
        if (field != null) {
            field.updateSoilMoisture(moisture);
        }
        if (request.getUnmetLitres() > 0) {
            waitingRequests.offer(request);
        }
        recordEvent("Operator approved " + weatherLabel
                + " revision for " + requestId + ".");

        System.out.println("Weather Update Triggered    : " + weatherLabel);
        System.out.println("Field ID                    : " + request.getFieldId() 
                + (field != null ? " (" + field.getFarmerName() + " - " + field.getCropProfile().getCropType() + ")" : ""));
        System.out.printf("Previous Soil Moisture      : %.1f%%%n", prevMoisture);
        System.out.printf("Updated Soil Moisture       : %.1f%%%n", moisture);
        System.out.printf("Previous Water Requirement  : %d L%n", prevRequirement);
        System.out.printf("Revised Water Requirement   : %d L%n", revisedLitres);
        System.out.printf("Updated Pending Request Status: %s (Unmet: %d L)%n", request.getStatus(), request.getUnmetLitres());
    }

    public void updateCanal(String linkId, boolean working) {
        CanalLink link = network.getLink(linkId);
        boolean prevStatus = (link != null) && link.isWorking();
        network.updateLink(linkId, working);
        recordEvent(linkId + " changed to "
                + (working ? "WORKING" : "BLOCKED") + ".");

        System.out.println("Canal ID Being Repaired     : " + linkId 
                + (link != null ? " (" + link.getFromNode() + " -> " + link.getToNode() + ")" : ""));
        System.out.println("Previous Canal Status       : " + (prevStatus ? "OPERATIONAL" : "BLOCKED"));
        System.out.println("Updated Canal Status        : " + (working ? "OPERATIONAL" : "BLOCKED"));
    }

    public void refillReservoir(long litres) {
        long balanceBefore = reservoir.getAvailableLitres();
        reservoir.refill(litres);
        long balanceAfter = reservoir.getAvailableLitres();
        recordEvent("Reservoir refilled by " + litres + " L.");

        System.out.println("Reservoir ID                : " + reservoir.getNodeId());
        System.out.printf("Reservoir Balance Before Refill: %d L%n", balanceBefore);
        System.out.printf("Quantity Added              : %d L%n", litres);
        System.out.printf("Reservoir Balance After Refill : %d L%n", balanceAfter);
    }

    public void showPriorityQueue() {
        if (waitingRequests.isEmpty()) {
            System.out.println("No pending requests in queue.");
            return;
        }
        System.out.println("--------------------------------------------------------------------------------------------------------------");
        System.out.printf("%-11s | %-11s | %-9s | %-16s | %-15s | %-14s | %-16s%n",
                "Queue Rank", "Request ID", "Field ID", "Type", "Priority Class", "Soil Moisture", "Unmet Demand");
        System.out.println("--------------------------------------------------------------------------------------------------------------");
        PriorityQueue<IrrigationRequest> copy = new PriorityQueue<>(waitingRequests);
        int rank = 1;
        while (!copy.isEmpty()) {
            IrrigationRequest req = copy.poll();
            String moistureStr = String.format("%.1f%%", req.getSoilMoisture());
            System.out.printf("%-11d | %-11s | %-9s | %-16s | %-15d | %-14s | %-16s%n",
                    rank++, req.getRequestId(), req.getFieldId(), req.requestType(),
                    req.calculatePriority(), moistureStr, req.getUnmetLitres() + " L");
        }
        System.out.println("--------------------------------------------------------------------------------------------------------------");
    }

    public void allocateWater() {
        ArrayList<IrrigationRequest> pending = new ArrayList<>();

        while (!waitingRequests.isEmpty()
                && reservoir.getAvailableLitres() > 0) {
            IrrigationRequest request = waitingRequests.poll();
            long requestedQty = request.getUnmetLitres();
            long availableQty = reservoir.getAvailableLitres();

            System.out.println("Processing Request " + request.getRequestId());
            System.out.println("Field: " + request.getFieldId());
            System.out.println("Type: " + request.requestType());
            System.out.println("Water Requested: " + requestedQty + " L");
            System.out.println("Available Water: " + availableQty + " L");
            System.out.println();

            System.out.println("Checking Canal Connectivity...");
            if (!network.isReachable(reservoir.getNodeId(), request.getFieldId())) {
                System.out.println("Result: FIELD UNREACHABLE");
                System.out.println("Reason: No operational canal path currently connects the reservoir to this field.");
                System.out.println();
                System.out.println("Water Delivered: 0 L");
                System.out.println("Remaining Request: " + requestedQty + " L");
                System.out.println("Updated Reservoir Balance: " + availableQty + " L");
                System.out.println("Status: PENDING");
                System.out.println("--------------------------------------------------");

                String result = request.getRequestId() + " | "
                        + request.getFieldId()
                        + " | UNREACHABLE | pending="
                        + request.getUnmetLitres() + " L";
                allocationHistory.add(result);
                pending.add(request);
                continue;
            }

            System.out.println("Result: FIELD REACHABLE");
            System.out.println();

            System.out.println("Checking Reservoir Availability...");
            if (availableQty >= requestedQty) {
                System.out.println("Result: SUFFICIENT WATER");
            } else {
                System.out.println("Result: INSUFFICIENT WATER");
            }
            System.out.println();

            System.out.println("Allocating Water...");
            long delivered = reservoir.reserveWater(requestedQty);
            request.confirmDelivery(delivered);
            long unmet = request.getUnmetLitres();
            long updatedBalance = reservoir.getAvailableLitres();

            System.out.println("Water Delivered: " + delivered + " L");
            System.out.println("Remaining Request: " + unmet + " L");
            System.out.println("Updated Reservoir Balance: " + updatedBalance + " L");

            String status = (unmet == 0) ? "COMPLETED" : "PARTIALLY COMPLETED";
            System.out.println("Status: " + status);
            System.out.println("--------------------------------------------------");

            String result = request.getRequestId() + " | "
                    + request.getFieldId() + " | delivered=" + delivered
                    + " L | unmet=" + unmet + " L";
            allocationHistory.add(result);

            if (unmet > 0) {
                pending.add(request);
            }
        }

        waitingRequests.addAll(pending);
        System.out.println("Current Reservoir Balance: "
                + reservoir.getAvailableLitres() + " L");
    }

    public void displaySystemInitialization() {
        System.out.println("========================================================================================");
        System.out.println("SECTION 1 - SYSTEM INITIALIZATION");
        System.out.println("========================================================================================");
        System.out.println();
        System.out.println("[RESERVOIR METRICS]");
        System.out.println("Reservoir ID             : " + reservoir.getNodeId());
        System.out.println("Total Storage Capacity   : " + reservoir.getCapacityLitres() + " L");
        System.out.println("Initially Available Water: " + reservoir.getAvailableLitres() + " L");
        System.out.println();
        System.out.println("[NETWORK SUMMARY]");
        System.out.println("Number of Registered Fields: " + fields.size());
        System.out.println("Number of Canal Connections: " + network.getLinks().size());
        System.out.println();

        System.out.println("[REGISTERED AGRICULTURAL FIELDS]");
        System.out.println("-------------------------------------------------------------------------");
        System.out.printf("%-8s | %-14s | %-12s | %-14s | %-14s%n",
                "Field ID", "Farmer Name", "Crop", "Soil Moisture", "Crop Priority");
        System.out.println("-------------------------------------------------------------------------");
        for (Field f : fields.values()) {
            String priorityDesc = f.getCropProfile().getCropPriority() == 1 ? "1 (High)" :
                    (f.getCropProfile().getCropPriority() == 2 ? "2 (Medium)" : "3 (Low)");
            String moistureStr = String.format("%.1f%%", f.getSoilMoisture());
            System.out.printf("%-8s | %-14s | %-12s | %-14s | %-14s%n",
                    f.getFieldId(), f.getFarmerName(),
                    f.getCropProfile().getCropType(),
                    moistureStr,
                    priorityDesc);
        }
        System.out.println("-------------------------------------------------------------------------");
        System.out.println();

        System.out.println("[CANAL INFRASTRUCTURE CONNECTIONS]");
        System.out.println("---------------------------------------------------");
        System.out.printf("%-8s | %-10s | %-10s | %-14s%n",
                "Link ID", "From Node", "To Node", "Status");
        System.out.println("---------------------------------------------------");
        for (CanalLink link : network.getLinks().values()) {
            String status = link.isWorking() ? "OPERATIONAL" : "BLOCKED";
            System.out.printf("%-8s | %-10s | %-10s | %-14s%n",
                    link.getLinkId(), link.getFromNode(), link.getToNode(), status);
        }
        System.out.println("---------------------------------------------------");
    }

    public void displayRequestsAndPriorityOrder() {
        System.out.println("========================================================================================");
        System.out.println("SECTION 2 - IRRIGATION REQUESTS");
        System.out.println("========================================================================================");
        System.out.println();
        System.out.println("[SUBMITTED IRRIGATION REQUESTS]");
        System.out.println("------------------------------------------------------------------------------------------");
        System.out.printf("%-11s | %-9s | %-16s | %-16s | %-14s | %-10s%n",
                "Request ID", "Field ID", "Type", "Water Requested", "Soil Moisture", "Priority");
        System.out.println("------------------------------------------------------------------------------------------");
        for (IrrigationRequest req : requests.values()) {
            String moistureStr = String.format("%.1f%%", req.getSoilMoisture());
            System.out.printf("%-11s | %-9s | %-16s | %-16s | %-14s | %-10d%n",
                    req.getRequestId(), req.getFieldId(), req.requestType(),
                    req.getRequestedLitres() + " L", moistureStr, req.calculatePriority());
        }
        System.out.println("------------------------------------------------------------------------------------------");
        System.out.println();

        System.out.println("[PRIORITY EVALUATION ORDER]");
        System.out.println("(Determined by IrrigationPriorityPolicy: Class -> Soil Moisture -> Arrival Order)");
        System.out.println("--------------------------------------------------------------------------------------------------------------");
        System.out.printf("%-11s | %-11s | %-9s | %-16s | %-15s | %-14s | %-16s%n",
                "Queue Rank", "Request ID", "Field ID", "Type", "Priority Class", "Soil Moisture", "Water Requested");
        System.out.println("--------------------------------------------------------------------------------------------------------------");
        PriorityQueue<IrrigationRequest> copy = new PriorityQueue<>(waitingRequests);
        int rank = 1;
        while (!copy.isEmpty()) {
            IrrigationRequest req = copy.poll();
            String classDesc = req.calculatePriority() == 0 ? "0 (Emergency)" : String.valueOf(req.calculatePriority());
            String moistureStr = String.format("%.1f%%", req.getSoilMoisture());
            System.out.printf("%-11d | %-11s | %-9s | %-16s | %-15s | %-14s | %-16s%n",
                    rank++, req.getRequestId(), req.getFieldId(), req.requestType(),
                    classDesc, moistureStr, req.getRequestedLitres() + " L");
        }
        System.out.println("--------------------------------------------------------------------------------------------------------------");
    }

    public void displayFinalSystemStatus() {
        int totalRequests = requests.size();
        int fullySatisfied = 0;
        int partiallySatisfied = 0;
        int pending = 0;
        long totalDelivered = 0;

        for (IrrigationRequest req : requests.values()) {
            totalDelivered += req.getDeliveredLitres();
            if (req.getUnmetLitres() == 0 && req.getDeliveredLitres() > 0) {
                fullySatisfied++;
            } else if (req.getDeliveredLitres() > 0 && req.getUnmetLitres() > 0) {
                partiallySatisfied++;
            } else {
                pending++;
            }
        }

        int operationalCanals = 0;
        int blockedCanals = 0;
        for (CanalLink link : network.getLinks().values()) {
            if (link.isWorking()) {
                operationalCanals++;
            } else {
                blockedCanals++;
            }
        }

        System.out.println("========================================================================================");
        System.out.println("SECTION 7 - FINAL SYSTEM STATUS");
        System.out.println("========================================================================================");
        System.out.println();
        System.out.println("[SYSTEM ALLOCATION METRICS]");
        System.out.println("Total Number of Requests       : " + totalRequests);
        System.out.println("Fully Satisfied Requests       : " + fullySatisfied);
        System.out.println("Partially Satisfied Requests   : " + partiallySatisfied);
        System.out.println("Pending Requests               : " + pending);
        System.out.println("Total Water Delivered          : " + totalDelivered + " L");
        System.out.println("Final Reservoir Balance        : " + reservoir.getAvailableLitres() + " L");
        System.out.println("Operational Canals             : " + operationalCanals);
        System.out.println("Blocked Canals                 : " + blockedCanals);
        System.out.println();

        System.out.println("[REQUEST COMPLETION SUMMARY]");
        System.out.println("--------------------------------------------------------------------------------------------------");
        System.out.printf("%-11s | %-9s | %-12s | %-11s | %-11s | %-11s | %-18s%n",
                "Request ID", "Field ID", "Crop", "Requested", "Delivered", "Unmet", "Status");
        System.out.println("--------------------------------------------------------------------------------------------------");
        for (IrrigationRequest req : requests.values()) {
            Field f = fields.get(req.getFieldId());
            String crop = (f != null) ? f.getCropProfile().getCropType() : "Unknown";
            System.out.printf("%-11s | %-9s | %-12s | %-11s | %-11s | %-11s | %-18s%n",
                    req.getRequestId(), req.getFieldId(), crop,
                    req.getRequestedLitres() + " L",
                    req.getDeliveredLitres() + " L",
                    req.getUnmetLitres() + " L",
                    req.getStatus());
        }
        System.out.println("--------------------------------------------------------------------------------------------------");
        System.out.println();

        System.out.println("[FINAL ALLOCATION HISTORY]");
        System.out.println("--------------------------------------------------------------------------------------------------");
        for (String record : allocationHistory) {
            System.out.println(record);
        }
        System.out.println("--------------------------------------------------------------------------------------------------");
        System.out.println();

        System.out.println("[IMPORTANT SYSTEM EVENTS]");
        System.out.println("--------------------------------------------------------------------------------------------------");
        for (String event : eventHistory) {
            System.out.println(event);
        }
        System.out.println("Total Documented Events: " + eventHistory.size());
        System.out.println("========================================================================================");
    }

    public Reservoir getReservoir() { return reservoir; }
    public IrrigationNetwork getNetwork() { return network; }
    public Map<String, Field> getFields() { return fields; }
    public Map<String, IrrigationRequest> getRequests() { return requests; }
    public PriorityQueue<IrrigationRequest> getWaitingRequests() { return waitingRequests; }
    public int getWaitingCount() { return waitingRequests.size(); }

    public void showAllocationHistory() {
        for (String record : allocationHistory) System.out.println(record);
    }

    public void showEventHistory() {
        for (String event : eventHistory) System.out.println(event);
        System.out.println("Total documented events: " + eventHistory.size());
    }
}
