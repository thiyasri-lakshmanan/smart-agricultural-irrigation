
public class Reservoir {
   
    private final String nodeId;
    private final long capacityLitres;
    private long availableLitres;

    
    public Reservoir(String nodeId, long capacityLitres, long availableLitres) {
        if (capacityLitres <= 0) {
            throw new IllegalArgumentException("Capacity must be positive.");
        }
        if (availableLitres < 0 || availableLitres > capacityLitres) {
            throw new IllegalArgumentException("Initial water level cannot exceed capacity.");
        }
        this.nodeId = nodeId;
        this.capacityLitres = capacityLitres;
        this.availableLitres = availableLitres;
    }

    
    public String getNodeId() { 
        return nodeId; 
    }
    
    public long getCapacityLitres() { 
        return capacityLitres; 
    }
    
    public long getAvailableLitres() { 
        return availableLitres; 
    }

   
    public long getAvailableWater() {
        return availableLitres;
    }

    
    public long releaseWater(long requestedLitres) {
        if (requestedLitres <= 0) {
            throw new IllegalArgumentException("Requested litres must be positive.");
        }
        long reserved = Math.min(requestedLitres, availableLitres);
        availableLitres -= reserved;
        return reserved;
    }

    
    public long reserveWater(long requestedLitres) {
        return releaseWater(requestedLitres);
    }

   
    public void addWater(long litres) {
        if (litres <= 0 || availableLitres + litres > capacityLitres) {
            throw new IllegalArgumentException("Invalid refill quantity: exceeds capacity or non-positive.");
        }
        availableLitres += litres;
    }

    
    public void refill(long litres) {
        addWater(litres);
    }
}
