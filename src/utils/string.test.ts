import { removeDiacritics } from './string';

describe('String Util', () => {
  test('Should remove diacritics from the string', () => {
    expect(removeDiacritics('Élève')).toBe('Eleve');
    expect(removeDiacritics('Átletico de Madrid')).toBe('Atletico de Madrid');
    expect(removeDiacritics('à la mode')).toBe('a la mode');
  });

  test('Should return the original string if no diacritics are present', () => {
    expect(removeDiacritics('hello')).toBe('hello');
    expect(removeDiacritics('world')).toBe('world');
  });

  test('Should handle empty strings', () => {
    expect(removeDiacritics('')).toBe('');
  });

  test('Should show an unhandled characater as it is', () => {
    expect(removeDiacritics('�')).toBe('�');
  });
});
