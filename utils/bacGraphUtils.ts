// utils/bacGraphUtils.ts
import { calculateGramsOfEthanol, calculateWatsonTBW } from './bacCalculator';

export interface GraphPoint {
  value: number; // BAC value
  label: string; // Time label (HH:mm)
  timeStamp: number; // Epoch for comparison
}

export const generateBacDataPoints = (
  drinks: any[],
  heightCm: number,
  weightKg: number,
  age: number,
  sex: 'Male' | 'Female'
): GraphPoint[] => {
  if (!drinks || drinks.length === 0 || !heightCm || !weightKg || !age) return [];

  // Sort drinks by time
  const sortedDrinks = [...drinks].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  
  const tbwLiters = calculateWatsonTBW(heightCm, weightKg, age, sex);
  const bloodWaterFraction = 0.8;
  const eliminationRatePerHour = 0.015;

  const points: GraphPoint[] = [];
  const firstDrinkTime = new Date(sortedDrinks[0].time).getTime();
  const currentTime = new Date().getTime();
  
  // We'll calculate points until current time, or until BAC hits 0 (plus a buffer)
  let simulationTime = firstDrinkTime;
  let currentBac = 0;
  let lastSimulationTime = firstDrinkTime;
  
  // Interval of 30 minutes for smooth graph without overcrowding labels
  const intervalMs = 30 * 60 * 1000;

  // Find the end time: either 6 hours from now, or when BAC hits zero, whichever is later
  // We'll simulate forward until BAC is zero or max 24 hours from first drink
  const maxSimulationTime = firstDrinkTime + (24 * 60 * 60 * 1000);

  while (simulationTime <= maxSimulationTime) {
    // 1. Calculate elimination since last point
    const hoursElapsed = (simulationTime - lastSimulationTime) / (1000 * 60 * 60);
    currentBac = Math.max(0, currentBac - (hoursElapsed * eliminationRatePerHour));

    // 2. Add drinks consumed in this interval
    sortedDrinks.forEach(drink => {
      const drinkTime = new Date(drink.time).getTime();
      // If the drink was consumed exactly at this time, or within the window since lastSimulationTime
      if (drinkTime > lastSimulationTime && drinkTime <= simulationTime) {
        const grams = calculateGramsOfEthanol(drink.sizeMl, drink.abv) * drink.count;
        const bacGain = (grams * bloodWaterFraction) / (tbwLiters * 10);
        currentBac += bacGain;
      }
    });

    // 3. Store point
    const date = new Date(simulationTime);
    points.push({
      value: parseFloat(currentBac.toFixed(4)),
      label: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      timeStamp: simulationTime
    });

    // 4. Update last time
    lastSimulationTime = simulationTime;

    // 5. If BAC is 0 and we are past current time, we can stop
    if (currentBac <= 0 && simulationTime > currentTime) break;

    simulationTime += intervalMs;
  }

  return points;
};

export interface DrinkBarData {
  value: number;
  label: string;
  frontColor: string;
}

/**
 * Groups drinks by hour to show consumption frequency.
 */
export const generateDrinkHistoryData = (drinks: any[]): DrinkBarData[] => {
  if (!drinks || drinks.length === 0) return [];

  const hourlyCounts: { [key: string]: number } = {};
  
  // Initialize last 6-8 hours or use the range of drinks
  const sorted = [...drinks].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const firstTime = new Date(sorted[0].time);
  const lastTime = new Date();
  
  // Fill in all hours between first drink and now
  let curr = new Date(firstTime);
  curr.setMinutes(0, 0, 0);
  
  const end = new Date(lastTime);
  end.setHours(end.getHours() + 1);
  
  while (curr <= end) {
    const hourLabel = `${curr.getHours().toString().padStart(2, '0')}:00`;
    hourlyCounts[hourLabel] = 0;
    curr.setHours(curr.getHours() + 1);
  }

  // Aggregate counts
  drinks.forEach(d => {
    const date = new Date(d.time);
    const hourLabel = `${date.getHours().toString().padStart(2, '0')}:00`;
    if (hourlyCounts[hourLabel] !== undefined) {
      hourlyCounts[hourLabel] += d.count;
    }
  });

  return Object.keys(hourlyCounts).map(hour => ({
    value: hourlyCounts[hour],
    label: hour,
    frontColor: hourlyCounts[hour] > 0 ? '#00FF00' : '#333',
  }));
};
