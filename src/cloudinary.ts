/*
  Cloudinary image transformations support
  - Compatible with Cloudinary's official Node.js syntax
  - Full support for transformations hasn't been implemented
  - Full official api documentation: https://cloudinary.com/documentation/image_transformations
*/

export interface CloudinaryImageTransformations {
  width?: number;
  height?: number;
  crop?: 'fit' | 'fill' | 'limit' | null;
}

export function makeImageTransformationString(transformations: CloudinaryImageTransformations) {
  let commands = [];
  const {width, height, crop} = transformations;
  if(width !== undefined) {
    commands.push(`w_${width}`);
  }
  if(height !== undefined) {
    commands.push(`h_${height}`);
  }
  switch(crop) {
    case 'fit': commands.push('c_fit'); break;
    case 'fill': commands.push('c_fill'); break;
    case 'limit': commands.push('c_limit'); break;
  }
  return commands.join(',');
}
