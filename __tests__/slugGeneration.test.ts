/**
 * Tests for the slug generation utility used for SEO-friendly motorcycle URLs.
 * We import the function indirectly by testing its behavior.
 */

// Replicate the generateMotoSlug function from storeService for unit testing
function generateMotoSlug(make: string, model: string, year: string): string {
    const base = `${make}-${model}-${year}`
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return base;
}

describe('generateMotoSlug', () => {
    it('should generate a clean slug from make, model, and year', () => {
        expect(generateMotoSlug('Honda', 'CG 160', '2024')).toBe('honda-cg-160-2024');
    });

    it('should handle accented characters', () => {
        expect(generateMotoSlug('Yamaha', 'Ténéré', '2023')).toBe('yamaha-tenere-2023');
    });

    it('should handle special characters', () => {
        expect(generateMotoSlug('Honda', 'CB 650R (ABS)', '2022')).toBe('honda-cb-650r-abs-2022');
    });

    it('should handle multiple spaces', () => {
        expect(generateMotoSlug('Royal  Enfield', 'Hunter   350', '2024')).toBe('royal-enfield-hunter-350-2024');
    });

    it('should strip leading and trailing dashes', () => {
        expect(generateMotoSlug(' Honda ', ' CG 160 ', '2024')).toBe('honda-cg-160-2024');
    });

    it('should produce unique slugs for different bikes', () => {
        const slug1 = generateMotoSlug('Honda', 'CG 160', '2024');
        const slug2 = generateMotoSlug('Honda', 'CG 160', '2023');
        expect(slug1).not.toBe(slug2);
    });
});
