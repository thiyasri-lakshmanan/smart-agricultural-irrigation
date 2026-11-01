
public class RoutineRequest extends IrrigationRequest {

    public RoutineRequest(String requestId, String fieldId,
                          int cropPriority, double soilMoisture,
                          long requestedLitres, long arrivalOrder) {
        super(requestId, fieldId, cropPriority,
              soilMoisture, requestedLitres, arrivalOrder);
    }

    @Override
    public int calculatePriority() {
        return getCropPriority();
    }

    @Override
    public int priorityClass() {
        return calculatePriority();
    }

    @Override
    public String requestType() {
        return "Routine";
    }
}
