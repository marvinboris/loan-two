import { cn, formatPhoneNumber, buildFormData } from './utils.js';

describe('utils', () => {
  it('should work', () => {
    expect(cn('text-red', 'bg-blue')).toEqual('text-red bg-blue');
  });

  it('formatPhoneNumber should work', () => {
    expect(formatPhoneNumber('+1 234 567 890')).toEqual('+1234567890');
  });

  it('buildFormData should work', () => {
    const formData = buildFormData({ name: 'John', age: 30 });
    expect(formData.get('name')).toEqual('John');
    expect(formData.get('age')).toEqual('30');
  });
});
