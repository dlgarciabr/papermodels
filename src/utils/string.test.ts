import { removeDiacritics, shortenTextWithEllipsis, jsEscape } from './string';

describe('String Util - removeDiacritics', () => {
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

describe('String Util - shortenTextWithEllipsis', () => {
  test('should return the original value when it is shorter than the limit', () => {
    const result = shortenTextWithEllipsis('short text', 20);
    expect(result).toEqual('short text');
  });

  test('should shorten the value with ellipsis when it is longer than the limit', () => {
    const result = shortenTextWithEllipsis('very long text to shorten with ellipsis', 20);
    expect(result).toEqual('very long text to sh...');
  });

  test('should return an empty string when the input value is empty', () => {
    const result = shortenTextWithEllipsis('', 10);
    expect(result).toEqual('');
  });

  test('should return null when the input value is null', () => {
    const result = shortenTextWithEllipsis(null, 10);
    expect(result).toEqual(null);
  });

  test('should return undefined when the input value is undefined', () => {
    const result = shortenTextWithEllipsis(undefined, 10);
    expect(result).toEqual(undefined);
  });

  test('should handle negative limit value by returning the original value', () => {
    const result = shortenTextWithEllipsis('very long text to shorten with ellipsis', -5);
    expect(result).toEqual('very long text to shorten with ellipsis');
  });
});

describe('String Util - jsEscape', () => {
  test('escapes double quotes', () => {
    expect(jsEscape('"hello"')).toEqual('\\"hello\\"');
  });

  test('escapes single quotes', () => {
    expect(jsEscape("'hello'")).toEqual("\\'hello\\'");
  });

  test('escapes backslashes', () => {
    expect(jsEscape('\\hello\\')).toEqual('\\\\hello\\\\');
  });

  test('escapes newlines', () => {
    expect(jsEscape('hello\nworld')).toEqual('hello\\nworld');
  });

  test('escapes carriage returns', () => {
    expect(jsEscape('hello\rworld')).toEqual('hello\\rworld');
  });

  test('escapes unicode line separator', () => {
    expect(jsEscape('hello\u2028world')).toEqual('hello\\u2028world');
  });

  test('escapes unicode paragraph separator', () => {
    expect(jsEscape('hello\u2029world')).toEqual('hello\\u2029world');
  });
});
