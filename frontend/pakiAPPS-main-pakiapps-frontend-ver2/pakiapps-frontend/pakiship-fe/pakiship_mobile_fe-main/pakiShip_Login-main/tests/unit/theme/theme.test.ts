/// <reference types="jest" />
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { typography } from '../../../src/theme/typography';

describe('Theme tokens', () => {
  describe('colors', () => {
    it('should export primary color', () => {
      expect(colors.primary).toBe('#39B5A8');
    });

    it('should export background color', () => {
      expect(colors.background).toBeDefined();
    });

    it('should export dark color', () => {
      expect(colors.dark).toBeDefined();
    });

    it('should have gray shades', () => {
      expect(colors.gray[100]).toBeDefined();
      expect(colors.gray[500]).toBeDefined();
    });
  });

  describe('spacing', () => {
    it('should export xs spacing', () => {
      expect(spacing.xs).toBe(4);
    });

    it('should export md spacing', () => {
      expect(spacing.md).toBe(16);
    });

    it('should export all scale keys', () => {
      const keys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];
      keys.forEach((key) => {
        expect(spacing[key as keyof typeof spacing]).toBeDefined();
      });
    });
  });

  describe('typography', () => {
    it('should export fontSize tokens', () => {
      expect(typography.fontSize.base).toBe(14);
      expect(typography.fontSize.xl).toBe(32);
    });

    it('should export fontWeight tokens', () => {
      expect(typography.fontWeight.bold).toBe('700');
      expect(typography.fontWeight.extraBold).toBe('800');
    });
  });
});
