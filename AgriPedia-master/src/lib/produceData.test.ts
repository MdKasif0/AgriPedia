import {
  getAllProduce,
  getProduceByCommonName,
  searchProduce,
  ProduceInfo,
} from './produceData';

describe('produceData tests', () => {
  describe('getAllProduce', () => {
    it('should return a non-empty array of produce', () => {
      const allProduce = getAllProduce();
      expect(allProduce).toBeDefined();
      expect(Array.isArray(allProduce)).toBe(true);
      expect(allProduce.length).toBeGreaterThan(0);
    });

    it('should return 77 items (38 fruits + 39 vegetables)', () => {
      const allProduce = getAllProduce();
      expect(allProduce.length).toBe(77);
    });
  });

  describe('getProduceByCommonName', () => {
    it('should retrieve a fruit by its common name', () => {
      const fruit = getProduceByCommonName('Apple');
      expect(fruit).toBeDefined();
      if (fruit) {
        expect(fruit.commonName).toBe('Apple');
        expect(fruit.id).toBe('apple');
      }
    });

    it('should retrieve a vegetable by its common name', () => {
      const vegetable = getProduceByCommonName('Carrot');
      expect(vegetable).toBeDefined();
      if (vegetable) {
        expect(vegetable.commonName).toBe('Carrot');
        expect(vegetable.id).toBe('carrot');
      }
    });

    it('should retrieve a fruit by its id', () => {
      const fruit = getProduceByCommonName('apple');
      expect(fruit).toBeDefined();
      if (fruit) {
        expect(fruit.commonName).toBe('Apple');
        expect(fruit.id).toBe('apple');
      }
    });

    it('should retrieve a vegetable by its id', () => {
      const vegetable = getProduceByCommonName('carrot');
      expect(vegetable).toBeDefined();
      if (vegetable) {
        expect(vegetable.commonName).toBe('Carrot');
        expect(vegetable.id).toBe('carrot');
      }
    });

    it('should be case-insensitive for common name', () => {
      const fruit = getProduceByCommonName('aPpLe');
      expect(fruit).toBeDefined();
      if (fruit) {
        expect(fruit.commonName).toBe('Apple');
      }
    });

    it('should return undefined for a non-existent produce item', () => {
      const produce = getProduceByCommonName('NonExistentProduce');
      expect(produce).toBeUndefined();
    });
  });

  describe('searchProduce', () => {
    it('should find items containing the search query "berry"', () => {
      const results = searchProduce('berry');
      expect(results.length).toBeGreaterThanOrEqual(2);

      const hasStrawberry = results.some(p => p.commonName === 'Strawberry' || p.id === 'strawberry');
      const hasBlueberry = results.some(p => p.commonName === 'Blueberry' || p.id === 'blueberry');
      
      expect(hasStrawberry).toBe(true);
      expect(hasBlueberry).toBe(true);
    });

    it('should return an empty array for a query that matches no produce', () => {
      const results = searchProduce('NonExistentQueryString');
      expect(results.length).toBe(0);
    });

    it('should filter by region', () => {
      const results = searchProduce('', { region: 'India' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.regions).toContain('India');
      });
    });

    it('should filter by season', () => {
      const results = searchProduce('', { season: 'Summer' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.seasons).toContain('Summer');
      });
    });
    
    it('should filter by query and region', () => {
      const results = searchProduce('apple', { region: 'India' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.commonName.toLowerCase().includes('apple') || r.id.toLowerCase().includes('apple')).toBe(true);
        expect(r.regions).toContain('India');
      });
    });

    it('should filter by query and season', () => {
        const results = searchProduce('apple', { season: 'Autumn' });
        expect(results.length).toBeGreaterThan(0);
        results.forEach(r => {
          expect(r.commonName.toLowerCase().includes('apple') || r.id.toLowerCase().includes('apple')).toBe(true);
          expect(r.seasons).toContain('Autumn');
        });
      });

    it('should filter by query, region and season', () => {
      const results = searchProduce('apple', { region: 'India', season: 'Autumn' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.commonName.toLowerCase().includes('apple') || r.id.toLowerCase().includes('apple')).toBe(true);
        expect(r.regions).toContain('India');
        expect(r.seasons).toContain('Autumn');
      });
    });
  });
});
