public class Field {
    private final String fieldId;
    private final String farmerName;
    private final CropProfile cropProfile;
    private double soilMoisture;

    public Field(String fieldId, String farmerName,
                 CropProfile cropProfile, double soilMoisture) {
        this.fieldId = fieldId;
        this.farmerName = farmerName;
        this.cropProfile = cropProfile;
        updateSoilMoisture(soilMoisture);
    }

    public String getFieldId() { return fieldId; }
    public String getFarmerName() { return farmerName; }
    public CropProfile getCropProfile() { return cropProfile; }
    public double getSoilMoisture() { return soilMoisture; }

    public void updateSoilMoisture(double value) {
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException("Moisture must be from 0 to 100.");
        }
        soilMoisture = value;
    }
}
