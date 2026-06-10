import { SourceLabelPipe } from './source-label.pipe';

describe('SourceLabelPipe', () => {
  const pipe = new SourceLabelPipe();

  it('maps known sources', () => {
    expect(pipe.transform('wildberries')).toBe('Wildberries');
    expect(pipe.transform('fusion')).toBe('Гибрид');
  });

  it('returns raw value for unknown source', () => {
    expect(pipe.transform('unknown' as never)).toBe('unknown');
  });
});
