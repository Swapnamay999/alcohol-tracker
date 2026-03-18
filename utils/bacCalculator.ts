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
 * Calculates current active BAC using Watson TBW and a time-aware simulation.
 * This ensures parity with the graph visualization.
 */
export const calculateBAC = (
  drinks: any[], 
  heightCm: number,
  weightKg: number,
  age: number,
  sex: 'Male' | 'Female'
): number => {
  if (!drinks || drinks.length === 0 || !heightCm || !weightKg || !age) return 0.000;

  // Sort drinks by time to process them chronologically
  const sortedDrinks = [...drinks].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  
  const tbwLiters = calculateWatsonTBW(heightCm, weightKg, age, sex);
  const bloodWaterFraction = 0.8; 
  const eliminationRatePerHour = 0.015;

  let currentBac = 0;
  const firstDrinkTime = new Date(sortedDrinks[0].time).getTime();
  const currentTime = new Date().getTime();
  
  // We simulate from the first drink to now
  let lastProcessedTime = firstDrinkTime;

  // Process drinks and elimination in order
  sortedDrinks.forEach((drink, index) => {
    const drinkTime = new Date(drink.time).getTime();
    
    // Only process drinks that have already been "consumed" (not in the future)
    if (drinkTime <= currentTime) {
      // 1. Calculate elimination from the last drink (or first drink) until this drink
      const hoursElapsedSinceLast = Math.max(0, (drinkTime - lastProcessedTime) / (1000 * 60 * 60));
      currentBac = Math.max(0, currentBac - (hoursElapsedSinceLast * eliminationRatePerHour));

      // 2. Add the alcohol from this drink
      const pureEthanol = calculateGramsOfEthanol(drink.sizeMl, drink.abv) * (drink.count || 1);
      const bacGain = (pureEthanol * bloodWaterFraction) / (tbwLiters * 10);
      currentBac += bacGain;

      lastProcessedTime = drinkTime;
    }
  });

  // 3. Final elimination from the last drink time until the current time
  const finalHoursElapsed = Math.max(0, (currentTime - lastProcessedTime) / (1000 * 60 * 60));
  currentBac = Math.max(0, currentBac - (finalHoursElapsed * eliminationRatePerHour));

  return parseFloat(Math.max(0, currentBac).toFixed(3));
};