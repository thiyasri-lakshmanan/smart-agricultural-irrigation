
public class DroughtReliefRequest extends IrrigationRequest {

    public DroughtReliefRequest(String requestId, String fieldId,
                                int cropPriority, double soilMoisture,
                                long requestedLitres, long arrivalOrder) {
        super(requestId, fieldId, cropPriority,
              soilMoisture, requestedLitres, arrivalOrder);
    }

    @Override
    public int calculatePriority() {
        return 0;
    }

    @Override
    public int priorityClass() {
        return calculatePriority();
    }

    @Override
    public String requestType() {
        return "Drought Relief";
    }
}
