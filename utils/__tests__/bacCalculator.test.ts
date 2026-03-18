import { calculateWatsonTBW, calculateGramsOfEthanol, calculateBAC } from '../bacCalculator';

describe('Physiological Engine (Watson Formula)', () => {
  
  describe('calculateWatsonTBW', () => {
    test('calculates TBW correctly for a 180cm, 80kg, 30yr Male', () => {
      // Watson Male: 2.447 - (0.09156 * age) + (0.1074 * height) + (0.3362 * weight)
      // 2.447 - 2.7468 + 19.332 + 26.896 = 45.9282
      const tbw = calculateWatsonTBW(180, 80, 30, 'Male');
      expect(tbw).toBeCloseTo(45.928, 2);
    });

    test('calculates TBW correctly for a 165cm, 60kg, 30yr Female', () => {
      // Watson Female: -2.097 + (0.1069 * height) + (0.2466 * weight)
      // -2.097 + 17.6385 + 14.796 = 30.3375
      const tbw = calculateWatsonTBW(165, 60, 30, 'Female');
      expect(tbw).toBeCloseTo(30.338, 2);
    });
  });

  describe('calculateGramsOfEthanol', () => {
    test('calculates pure ethanol grams correctly (500ml @ 5% ABV)', () => {
      // 500 * 0.05 * 0.789 = 19.725g
      const grams = calculateGramsOfEthanol(500, 5);
      expect(grams).toBe(19.725);
    });
  });

  describe('calculateBAC', () => {
    const maleUser = { height: 180, weight: 80, age: 30, sex: 'Male' as const };
    
    test('returns 0.000 for no drinks', () => {
      const bac = calculateBAC([], maleUser.height, maleUser.weight, maleUser.age, maleUser.sex);
      expect(bac).toBe(0);
    });

    test('calculates BAC correctly for a single drink consumed now', () => {
      const now = new Date().toISOString();
      const drinks = [{ sizeMl: 500, abv: 5, count: 1, time: now }];
      
      // TBW: ~45.928
      // Grams: 19.725
      // Raw BAC: (19.725 * 0.8) / (45.928 * 10) = 15.78 / 459.28 = 0.0343
      const bac = calculateBAC(drinks, maleUser.height, maleUser.weight, maleUser.age, maleUser.sex);
      expect(bac).toBe(0.034);
    });

    test('applies metabolic decay correctly after 1 hour', () => {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const drinks = [{ sizeMl: 500, abv: 5, count: 1, time: oneHourAgo }];
      
      // BAC was 0.0343. 1 hour decay = 0.015. 
      // 0.0343 - 0.015 = 0.0193
      const bac = calculateBAC(drinks, maleUser.height, maleUser.weight, maleUser.age, maleUser.sex);
      expect(bac).toBe(0.019);
    });

    test('handles multiple drinks at different times correctly (Simulation parity)', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
      const oneHourAgo = new Date(Date.now() - 1 * 3600000).toISOString();
      
      const drinks = [
        { sizeMl: 500, abv: 5, count: 1, time: twoHoursAgo },
        { sizeMl: 500, abv: 5, count: 1, time: oneHourAgo }
      ];

      // Step 1: Drink 1 consumed 2 hours ago. BAC = 0.0343.
      // Step 2: 1 hour passes. BAC = 0.0343 - 0.015 = 0.0193.
      // Step 3: Drink 2 consumed 1 hour ago. BAC = 0.0193 + 0.0343 = 0.0536.
      // Step 4: 1 hour passes (until now). BAC = 0.0536 - 0.015 = 0.0386.
      
      const bac = calculateBAC(drinks, maleUser.height, maleUser.weight, maleUser.age, maleUser.sex);
      expect(bac).toBe(0.039);
    });

    test('returns 0.000 if elimination exceeds alcohol consumed', () => {
      const tenHoursAgo = new Date(Date.now() - 10 * 3600000).toISOString();
      const drinks = [{ sizeMl: 330, abv: 4, count: 1, time: tenHoursAgo }];
      
      const bac = calculateBAC(drinks, maleUser.height, maleUser.weight, maleUser.age, maleUser.sex);
      expect(bac).toBe(0);
    });
  });
});