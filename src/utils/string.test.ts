import { removeDiacritics } from './string';

describe('String Util', () => {
  it('should remove diacritics from the string', () => {
    expect(removeDiacritics('Élève')).toBe('Eleve');
    expect(removeDiacritics('Átletico de Madrid')).toBe('Atletico de Madrid');
    expect(removeDiacritics('à la mode')).toBe('a la mode');
  });

  it('should return the original string if no diacritics are present', () => {
    expect(removeDiacritics('hello')).toBe('hello');
    expect(removeDiacritics('world')).toBe('world');
  });

  it('should handle empty strings', () => {
    expect(removeDiacritics('')).toBe('');
  });
});
