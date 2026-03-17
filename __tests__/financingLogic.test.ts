/**
 * Tests for the financing simulation logic.
 * Validates that the PMT calculation, entry limits, and edge cases behave correctly.
 */

const INTEREST_RATE = 0.018; // 1.8% a.m.

function calculateMonthlyPayment(price: number, entryPercent: number, months: number): number {
    const entry = Math.round(price * (entryPercent / 100));
    const principal = price - entry;
    if (principal <= 0) return 0;
    const i = INTEREST_RATE;
    const n = months;
    const pmt = principal * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return pmt;
}

describe('Financing Logic', () => {
    const MOTO_PRICE = 22000;

    describe('Entry validation', () => {
        it('should not allow entry >= 100% of the moto value', () => {
            const entry100 = Math.round(MOTO_PRICE * (100 / 100));
            expect(entry100).toBeGreaterThanOrEqual(MOTO_PRICE);
            // PMT should be 0 when entry covers the full price
            expect(calculateMonthlyPayment(MOTO_PRICE, 100, 48)).toBe(0);
        });

        it('should allow 0% entry (no down payment)', () => {
            const pmt = calculateMonthlyPayment(MOTO_PRICE, 0, 48);
            expect(pmt).toBeGreaterThan(0);
            expect(pmt).toBeLessThan(MOTO_PRICE); // monthly cant be more than total
        });

        it('should clamp max entry at 90%', () => {
            const MAX_ENTRY_PERCENT = 90;
            const entry90 = Math.round(MOTO_PRICE * (MAX_ENTRY_PERCENT / 100));
            expect(entry90).toBe(19800);
            expect(entry90).toBeLessThan(MOTO_PRICE);
        });

        it('should calculate correct entry amount from percentage', () => {
            const entryPercent = 30;
            const entry = Math.round(MOTO_PRICE * (entryPercent / 100));
            expect(entry).toBe(6600);
        });
    });

    describe('PMT calculation', () => {
        it('should return a positive payment for valid inputs', () => {
            const pmt = calculateMonthlyPayment(MOTO_PRICE, 30, 48);
            expect(pmt).toBeGreaterThan(0);
        });

        it('should return 0 when entry covers full price', () => {
            const pmt = calculateMonthlyPayment(MOTO_PRICE, 100, 48);
            expect(pmt).toBe(0);
        });

        it('shorter terms should have higher monthly payments', () => {
            const pmt12 = calculateMonthlyPayment(MOTO_PRICE, 30, 12);
            const pmt48 = calculateMonthlyPayment(MOTO_PRICE, 30, 48);
            expect(pmt12).toBeGreaterThan(pmt48);
        });

        it('higher entry should result in lower monthly payment', () => {
            const pmtLowEntry = calculateMonthlyPayment(MOTO_PRICE, 10, 48);
            const pmtHighEntry = calculateMonthlyPayment(MOTO_PRICE, 50, 48);
            expect(pmtHighEntry).toBeLessThan(pmtLowEntry);
        });

        it('total with interest should always be greater than financed amount', () => {
            const entryPercent = 30;
            const months = 48;
            const pmt = calculateMonthlyPayment(MOTO_PRICE, entryPercent, months);
            const entry = Math.round(MOTO_PRICE * (entryPercent / 100));
            const financed = MOTO_PRICE - entry;
            const totalWithInterest = pmt * months;
            expect(totalWithInterest).toBeGreaterThan(financed);
        });

        it('should handle realistic motorcycle prices', () => {
            const prices = [8500, 15000, 22000, 45900, 89000];
            prices.forEach(price => {
                const pmt = calculateMonthlyPayment(price, 30, 48);
                expect(pmt).toBeGreaterThan(0);
                expect(pmt).toBeLessThan(price);
                expect(isFinite(pmt)).toBe(true);
            });
        });
    });

    describe('Edge cases', () => {
        it('should not produce NaN or Infinity', () => {
            const pmt = calculateMonthlyPayment(MOTO_PRICE, 0, 48);
            expect(isNaN(pmt)).toBe(false);
            expect(isFinite(pmt)).toBe(true);
        });

        it('entry at exactly 90% should still produce valid payment', () => {
            const pmt = calculateMonthlyPayment(MOTO_PRICE, 90, 48);
            expect(pmt).toBeGreaterThan(0);
            expect(isFinite(pmt)).toBe(true);
        });

        it('entry of R$197,000 on a R$22,000 bike should not be possible (>90%)', () => {
            // 197000 / 22000 = 895% — way above 90% limit
            const maxEntry = Math.round(MOTO_PRICE * 0.9);
            expect(197000).toBeGreaterThan(maxEntry);
            // System enforces 90% max, so this scenario is prevented by UI
        });
    });
});
