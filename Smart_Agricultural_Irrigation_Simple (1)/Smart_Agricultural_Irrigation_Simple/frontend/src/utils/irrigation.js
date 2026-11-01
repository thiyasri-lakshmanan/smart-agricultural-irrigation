
export const cropDemand = {
  Rice: 20000,
  Sugarcane: 18000,
  Banana: 16000,
  Cotton: 10000,
  Maize: 8000,
  Wheat: 7000,
  Groundnut: 6000,
  Vegetables: 12000
};

export function calculateWater(acres, moisture, crop) {
  const area = Number(acres);
  const soil = Number(moisture);
  const demand = cropDemand[crop];

  if (
    !Number.isFinite(area) ||
    !Number.isFinite(soil) ||
    area <= 0 ||
    soil < 0 ||
    soil > 100 ||
    !demand
  ) {
    return 0;
  }

  const moistureFactor = (100 - soil) / 100;

  return Math.round(area * demand * moistureFactor);
}
