/**
 * Start the web font downloads from inside <body>, where they cannot hold up
 * the first paint.
 *
 * Chrome treats a `<link rel=preload as=font>` in <head> as render-blocking:
 * it waits up to ~100 ms for the file before painting anything, `font-display:
 * swap` or not. Measured 2026-10-23 on a 4G phone (70 ms RTT, 2x CPU): first
 * paint 152-196 ms with next/font's head preloads, 64-72 ms with the same
 * preloads issued from the body, and the fonts landed at the same moment
 * either way. So every next/font call on the site sets `preload: false` and
 * this asks for the files instead, as the first thing in <body>. Text paints
 * at once in the metric-matched fallback next/font generates, then swaps when
 * the file lands: the next frame on a fast connection, and on a slow one the
 * fallback was going to show for that long anyway, after a blank screen.
 *
 * Pass CSS font shorthands built from next/font's own family names, e.g.
 * `600 1em ${display.style.fontFamily}`, one per weight the page draws, so each
 * @font-face it uses is loading before the text that needs it is laid out.
 */
export function FontKickoff({ fonts }: { fonts: string[] }) {
  const loads = fonts.map((font) => `f.load(${JSON.stringify(font)})`).join(";");
  return (
    <script
      // document.fonts is in every browser this site supports; the guard keeps
      // an old one from throwing on the first line of the body.
      dangerouslySetInnerHTML={{ __html: `(function(f){if(f&&f.load){${loads}}})(document.fonts)` }}
    />
  );
}
