import { makeImageTransformationString } from './cloudinary';

describe('makeImageTransformationString', () => {
  test('returns empty string with no transformations', () => {
    const command = makeImageTransformationString({});

    expect(command).toBe('');
  });

  test('supports with, height and cropping transforms', () => {
    const command = makeImageTransformationString({
      crop: 'fit',
      width: 320,
      height: 200
    });

    expect(command).toBe('w_320,h_200,c_fit');
  });
});
