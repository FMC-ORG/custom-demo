import { hasText, hasRichText } from '@/lib/field-utils';

describe('meaningful authorable content', () => {
  test.each([undefined, null, '', ' ', '\n\t', '\u00a0'])('plain text %p is empty', (value) => {
    expect(hasText(value)).toBe(false);
  });
  test.each(['0', 'Hello', ' &nbsp; literal '])('plain text %p is meaningful', (value) => {
    expect(hasText(value)).toBe(true);
  });
  test.each([
    '',
    ' ',
    '<p></p>',
    '<p><strong> &nbsp; </strong><br /></p>',
    '<p>&#160;&#xA0;</p>',
    '<!-- comment -->',
    '<script>hidden()</script>',
    '<style>body{}</style>',
  ])('Rich Text %p is empty', (value) => {
    expect(hasRichText(value)).toBe(false);
  });
  test.each([
    '<p>Hello</p>',
    '<p>&amp;</p>',
    '<img src="/photo.png" alt="" />',
    '<video src="/movie.mp4"></video>',
    '<iframe src="/embed"></iframe>',
    '<svg><path d="M0 0" /></svg>',
  ])('Rich Text %p is meaningful', (value) => {
    expect(hasRichText(value)).toBe(true);
  });
});
