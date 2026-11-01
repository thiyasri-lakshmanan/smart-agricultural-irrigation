public class CropProfile {
    private final String cropType;
    private final int cropPriority;

    public CropProfile(String cropType, int cropPriority) {
        this.cropType = cropType;
        this.cropPriority = cropPriority;
    }

    public String getCropType() { return cropType; }
    public int getCropPriority() { return cropPriority; }
}
