import { apiUrl } from './api-url';

describe('apiUrl', () => {
  it('returns relative path in dev', () => {
    expect(apiUrl('/api/health')).toBe('/api/health');
  });

  it('returns absolute path unchanged', () => {
    expect(apiUrl('https://cdn.example/img.png')).toBe('https://cdn.example/img.png');
  });
});
