const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = file => './assets/' + file.split('/').map(encodeURIComponent).join('/');
let clipSequence = 0;

export function validDisplayCrop(image) {
  const c = image.displayCrop;
  if (!c || ![image.width,image.height,c.x,c.y,c.width,c.height].every(Number.isFinite)) return null;
  if (c.x < 0 || c.y < 0 || c.width <= 0 || c.height <= 0 || c.x+c.width > image.width || c.y+c.height > image.height) return null;
  if ((c.sourceWidth && c.sourceWidth !== image.width) || (c.sourceHeight && c.sourceHeight !== image.height)) return null;
  return c;
}

// Crop only the displayed viewport. The source photograph stays unchanged.
export function photoMarkup(image, alt, loading = 'lazy', className = '') {
  const crop = validDisplayCrop(image);
  const classes = className ? ` class="${escape(className)}"` : '';
  const source = url(image.file)+(image.assetVersion?'?v='+encodeURIComponent(image.assetVersion):'');
  if (!crop) return `<img src="${source}" alt="${escape(alt)}" loading="${loading==='eager'?'eager':'lazy'}"${classes}>`;
  const id = `photo-clip-${++clipSequence}`;
  return `<svg class="cropped-photo${className?' '+escape(className):''}" viewBox="0 0 ${crop.width} ${crop.height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escape(alt)}"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><rect width="${crop.width}" height="${crop.height}"/></clipPath></defs><image href="${source}" x="${-crop.x}" y="${-crop.y}" width="${image.width}" height="${image.height}" clip-path="url(#${id})"/></svg>`;
}
