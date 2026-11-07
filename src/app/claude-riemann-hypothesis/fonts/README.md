# Riemann guide fonts

These are unmodified original TTF files from the official [Google Fonts repository](https://github.com/google/fonts), bundled on 2026-11-07. Only the Nunito filename was simplified; the font bytes are unchanged. The complete accompanying SIL Open Font License 1.1 files are retained here.

Nunito's variable upright font supplies the route's existing 600, 800 and 900 weights. Comic Neue Bold supplies the existing upright 700 weight. `layout.tsx` retains both CSS variables, `display: "swap"`, `preload: false`, and the existing `FontKickoff` calls. The root Wix Madefor fonts are unaffected.

Bundling avoids a production failure in Next 15's Google loader when a returned remote font URL has no trailing extension. No generated cache asset, font conversion, subsetting or outline modification is involved.

## Pinned sources and SHA-256

- [Nunito-Variable.ttf](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/nunito/Nunito%5Bwght%5D.ttf)
  - SHA-256: `bb55a5ca5c2042335b3991af27c4d0705d0ef41cac6164ac737fd8f2a1e85207`
- [Nunito-OFL.txt](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/nunito/OFL.txt)
  - SHA-256: `580df76c95a1ec5ab878ceb25bb3d85c6a076804e9c970c8c6972aea775fdf65`
- [ComicNeue-Bold.ttf](https://raw.githubusercontent.com/google/fonts/3dd78844021e948ceb633d1dcee3f7885561b5d9/ofl/comicneue/ComicNeue-Bold.ttf)
  - SHA-256: `3e7e5fccfd7e0788f317b43312151c1bd5cf058c9697a8d83eac3939050bd61e`
- [ComicNeue-OFL.txt](https://raw.githubusercontent.com/google/fonts/3dd78844021e948ceb633d1dcee3f7885561b5d9/ofl/comicneue/OFL.txt)
  - SHA-256: `7c38a22e5878e60fe423360553e63dd7be23d29f1f60336034935dbfc96e8320`
