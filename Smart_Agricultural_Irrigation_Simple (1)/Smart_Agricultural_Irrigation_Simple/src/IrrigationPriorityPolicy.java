import java.util.Comparator;

public class IrrigationPriorityPolicy
        implements Comparator<IrrigationRequest> {

    @Override
    public int compare(IrrigationRequest first,
                       IrrigationRequest second) {
        int result = Integer.compare(first.priorityClass(),
                                     second.priorityClass());
        if (result != 0) return result;

        result = Double.compare(first.getSoilMoisture(),
                                second.getSoilMoisture());
        if (result != 0) return result;

        result = Long.compare(first.getArrivalOrder(),
                              second.getArrivalOrder());
        if (result != 0) return result;

        return first.getRequestId().compareTo(second.getRequestId());
    }
}
