// utils/bacCalculator.ts

export const calculateGramsOfEthanol = (volumeMl: number, abv: number): number => {
  return volumeMl * (abv / 100) * 0.789;
};

/**
 * Calculates Total Body Water (TBW) in Liters using the clinical Watson formulas.
 */
export const calculateWatsonTBW = (heightCm: number, weightKg: number, age: number, sex: 'Male' | 'Female'): number => {
  if (sex === 'Male') {
    return 2.447 - (0.09156 * age) + (0.1074 * heightCm) + (0.3362 * weightKg);
  } else {
    return -2.097 + (0.1069 * heightCm) + (0.2466 * weightKg);
  }
};

/**
 * Calculates current active BAC using Watson TBW.
 */
export const calculateBAC = (
  drinks: any[], 
  heightCm: number,
  weightKg: number,
  age: number,
  sex: 'Male' | 'Female'
): number => {
  if (!drinks || drinks.length === 0 || !heightCm || !weightKg || !age) return 0.000;

  const tbwLiters = calculateWatsonTBW(heightCm, weightKg, age, sex);
  
  // Blood is approximately 80% water. This factor converts the alcohol in the 
  // total body water to the concentration specifically in the blood.
  const bloodWaterFraction = 0.8; 

  let totalAlcoholGrams = 0;
  const firstDrinkTime = new Date(drinks[0].time).getTime();
  const currentTime = new Date().getTime();

  drinks.forEach(drink => {
    const pureEthanol = calculateGramsOfEthanol(drink.sizeMl, drink.abv) * drink.count;
    totalAlcoholGrams += pureEthanol;
  });

  // Calculate BAC percentage (g/100mL)
  // Formula: (Alcohol_grams * bloodWaterFraction) / (TBW_liters * 10)
  const rawBac = (totalAlcoholGrams * bloodWaterFraction) / (tbwLiters * 10);

  // Apply metabolic elimination (0.015% per hour)
  const hoursElapsed = (currentTime - firstDrinkTime) / (1000 * 60 * 60);
  const currentBac = rawBac - (hoursElapsed * 0.015);

  return parseFloat(Math.max(0, currentBac).toFixed(3));
};