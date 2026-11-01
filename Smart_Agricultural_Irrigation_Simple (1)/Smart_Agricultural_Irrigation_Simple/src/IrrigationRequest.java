
public abstract class IrrigationRequest implements Prioritizable {
    private final String requestId;
    private final String fieldId;
    private final int cropPriority;
    private final long arrivalOrder;
    private double soilMoisture;
    private long requestedLitres;
    private long deliveredLitres;

    public IrrigationRequest(String requestId, String fieldId,
                             int cropPriority, double soilMoisture,
                             long requestedLitres, long arrivalOrder) {
        this.requestId = requestId;
        this.fieldId = fieldId;
        this.cropPriority = cropPriority;
        this.soilMoisture = soilMoisture;
        this.requestedLitres = requestedLitres;
        this.arrivalOrder = arrivalOrder;
        this.deliveredLitres = 0;
    }

   
    @Override
    public abstract int calculatePriority();

    public abstract String requestType();

    public int priorityClass() {
        return calculatePriority();
    }

    // ENCAPSULATION: Public getters for read-only access to private fields
    public String getRequestId() { return requestId; }
    public String getFieldId() { return fieldId; }
    public int getCropPriority() { return cropPriority; }
    public double getSoilMoisture() { return soilMoisture; }
    public long getArrivalOrder() { return arrivalOrder; }
    public long getRequestedLitres() { return requestedLitres; }
    public long getDeliveredLitres() { return deliveredLitres; }
    public long getUnmetLitres() { return requestedLitres - deliveredLitres; }

    public String getStatus() {
        if (deliveredLitres == 0) {
            return "PENDING";
        } else if (getUnmetLitres() == 0) {
            return "COMPLETED";
        } else {
            return "PARTIALLY COMPLETED";
        }
    }

    // Controlled mutation methods with business validation
    public void confirmDelivery(long litres) {
        if (litres <= 0 || litres > getUnmetLitres()) {
            throw new IllegalArgumentException("Invalid delivery quantity.");
        }
        deliveredLitres += litres;
    }

    public void reviseRequest(double newMoisture, long newRequestedLitres) {
        if (newMoisture < 0 || newMoisture > 100) {
            throw new IllegalArgumentException("Invalid moisture value.");
        }
        if (newRequestedLitres < deliveredLitres) {
            throw new IllegalArgumentException("Revision is below delivered water.");
        }
        soilMoisture = newMoisture;
        requestedLitres = newRequestedLitres;
    }

    @Override
    public String toString() {
        return requestId + " | " + fieldId + " | " + requestType()
                + " | class=" + calculatePriority()
                + " | moisture=" + soilMoisture + "%"
                + " | unmet=" + getUnmetLitres() + " L"
                + " | arrival=" + arrivalOrder;
    }
}
