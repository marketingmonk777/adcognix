// Browser helpers: SVG → PNG download, small image resize, CSV download.
import { svgDataUrl } from './templates';
export function svgToPng(svg: string, W: number, H: number): Promise<Blob> {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d')!; x.drawImage(img, 0, 0, W, H); c.toBlob(b => (b ? res(b) : rej(new Error('Could not render'))), 'image/png'); };
    img.onerror = () => rej(new Error('Could not render image')); img.src = svgDataUrl(svg);
  });
}
export function downloadBlob(b: Blob, name: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
export function downloadCsv(rows: (string | number | undefined | null)[][], name: string) {
  const s = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(new Blob(['\ufeff' + s], { type: 'text/csv;charset=utf-8' }), name);
}
export function resizeImage(file: File, max = 256): Promise<string> {
  return new Promise((res, rej) => {
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) return rej(new Error('Use a PNG, JPG, WebP or SVG image'));
    if (file.size > 3e6) return rej(new Error('Image must be under 3 MB'));
    const r = new FileReader(); r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k) || max; c.height = Math.round(img.height * k) || max; c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/png')); }; img.onerror = () => rej(new Error('Could not read image')); img.src = String(r.result); };
    r.onerror = () => rej(new Error('Could not read file')); r.readAsDataURL(file);
  });
}
