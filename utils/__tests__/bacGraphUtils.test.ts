import { generateBacDataPoints, generateDrinkHistoryData } from '../bacGraphUtils';

describe('Graph Utilities', () => {
  const maleUser = { height: 180, weight: 80, age: 30, sex: 'Male' as const };

  describe('generateBacDataPoints', () => {
    test('returns empty array if no drinks provided', () => {
      const points = generateBacDataPoints([], maleUser.height, maleUser.weight, maleUser.age, maleUser.sex);
      expect(points).toEqual([]);
    });

    test('generates multiple data points at 30-minute intervals', () => {
      const now = Date.now();
      const twoHoursAgo = new Date(now - 2 * 3600000).toISOString();
      const drinks = [{ sizeMl: 500, abv: 10, count: 1, time: twoHoursAgo }];

      const points = generateBacDataPoints(drinks, maleUser.height, maleUser.weight, maleUser.age, maleUser.sex);
      
      // Should have points for 2 hours + whatever time until BAC hits 0
      // 2 hours at 30 min intervals = at least 4-5 points
      expect(points.length).toBeGreaterThan(4);
      
      // First point is the 0 baseline
      expect(points[0].value).toBe(0);

      // Second point should be the immediate gain from the first drink
      expect(points[1].value).toBeGreaterThan(0);
      
      // Last point (or one near the end) should be 0
      const lastPoint = points[points.length - 1];
      expect(lastPoint.value).toBe(0);
    });
  });

  describe('generateDrinkHistoryData', () => {
    test('groups drinks correctly by hour', () => {
      const today = new Date();
      today.setHours(14, 0, 0, 0); // 2:00 PM
      const time1 = today.toISOString();
      
      const time2 = new Date(today);
      time2.setHours(15); // 3:00 PM
      const time2Str = time2.toISOString();

      const drinks = [
        { count: 1, time: time1 },
        { count: 2, time: time1 }, // Total 3 drinks at 14:00
        { count: 1, time: time2Str } // 1 drink at 15:00
      ];

      const history = generateDrinkHistoryData(drinks);
      
      const point14 = history.find(p => p.label === '14:00');
      const point15 = history.find(p => p.label === '15:00');

      expect(point14?.value).toBe(3);
      expect(point15?.value).toBe(1);
    });

    test('returns empty array for empty input', () => {
      expect(generateDrinkHistoryData([])).toEqual([]);
    });
  });
});