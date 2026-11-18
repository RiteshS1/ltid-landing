/**
 * Fetches a Google Font subset (only the glyphs in `text`) as TTF for next/og.
 * Returns null on any failure so image generation still succeeds with the default font.
 */
export async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}
