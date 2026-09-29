// @ts-nocheck
// LinkedIn fold engine, copied from the vault tool projects/linkedin_post_preview/web (metrics.js, engine.js, measure.js).
// Every number was measured off real LinkedIn screenshots; see RULES.md there. Edit the vault copy, then re-copy.
// LinkedIn feed geometry, MEASURED off the five screenshots in source_of_truth/.
// Method and the per-post evidence are in ../RULES.md. Numbers here are the only
// place any of it lives; the engine and the tests both read this file.
//
// Both platforms render the post body in the SAME face at the SAME size: the
// screenshots agree to within 0.2% once each is divided by its own capture
// scale (desktop 1.80x, mobile 3x). Only the column width differs.

export const FONT_SIZE = 14;
export const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const FONT = `${FONT_SIZE}px ${FONT_FAMILY}`;

// Lines of body text shown before the post is cut. A blank line produced by a
// double newline is one of them.
export const MAX_LINES = 3;

export const DESKTOP = {
  id: 'desktop',
  label: 'Desktop',
  cardWidth: 555,          // LinkedIn's feed column
  padding: 16,             // side padding on the body text
  textWidth: 555 - 32,     // 523. Constraint interval from the data: [495.3, 541.1)
  lineHeight: 20,
  // The cut marker is an ellipsis welded to the last word, then a space, then
  // the grey "more" button, all on the same line.
  marker: 'inline',
  ellipsis: '…',
  moreLabel: 'more',
  moreGap: ' ',
};

// Mobile is the iOS app. The screenshots are 1320px wide at 3x = 440pt, an
// iPhone 16 Pro Max. Column = 440 - 12 - 12.
export const MOBILE_WIDTHS = [
  { w: 375, label: 'iPhone SE / 12 mini' },
  { w: 390, label: 'iPhone 13 / 14' },
  { w: 393, label: 'iPhone 15 / 16 Pro' },
  { w: 412, label: 'Android (Pixel)' },
  { w: 430, label: 'iPhone 15 / 16 Plus' },
  { w: 440, label: 'iPhone 16 Pro Max' },
];

export const MOBILE = {
  id: 'mobile',
  label: 'Mobile',
  cardWidth: 440,
  padding: 12,
  textWidth: 440 - 24,     // 416. Constraint interval from the data: [405.9, 441.4)
  lineHeight: 17,
  // "...more" is NOT inline on mobile: it is parked in a fixed slot at the right
  // end of the last visible line, and the text is cut short of it. In all five
  // screenshots that block sits at exactly the same x.
  marker: 'reserved',
  ellipsis: '…',
  moreLabel: 'more',
  moreGap: '',
  // Width taken out of the LAST line only. Constraint interval: (49.9, 58.1].
  reserve: 54,
};

export function mobileAt(width) {
  return { ...MOBILE, cardWidth: width, textWidth: width - MOBILE.padding * 2 };
}

// A single image is laid into a box the full width of the card.
//
// TALL art is CONTAINED, not cropped: post 4's 9:16 photo is whole in both
// screenshots with white bars down its sides, and post 1's ordinary 3:4 phone
// photo gets them too, which is the part nobody expects. LinkedIn's own help
// page says a photo past 4:5 is "centered and cropped to fit the max ratio"
// (linkedin.com/help/lms/answer/a527229). The screenshots say otherwise, so the
// screenshots win.
//
// WIDE art past 3:1 is the one case with no measurement behind it. The same
// help page gives 3:1 as the ceiling, so it is cropped there, and that branch
// is marked unverified wherever it is used.
export const IMAGE = {
  maxHeightRatio: 1.25,   // height <= 1.25 * width   (4:5) -- MEASURED
  maxWidthRatio: 3,       // width  <= 3 * height     (3:1) -- from LinkedIn help
};

// LinkedIn refuses a post longer than this.
export const MAX_POST_CHARS = 3000;
// The rules, derived from source_of_truth/. Nothing here counts characters.
//
// LinkedIn shows the first MAX_LINES rendered lines of a post and hangs a cut
// marker off the last one. A line is what the column produces, so a blank line
// from a double newline spends one of the three, and how many words survive
// depends on how wide those words are, not how many letters they have.
//
// The two platforms differ in exactly two ways: the column is narrower on the
// phone, and the marker sits in a fixed slot at the right end of the last line
// there instead of running on inline after the text.


// ---------------------------------------------------------------------------
// Line breaking, the way `white-space: pre-wrap; overflow-wrap: break-word`
// breaks: hard at every newline, soft at spaces, and inside a word only when
// that one word is wider than the whole column.
//
// `tail` is an atomic run welded to the last line (the desktop "… more"): it
// never splits, and if it does not fit it takes a line of its own.
// ---------------------------------------------------------------------------
export function wrap(text, width, measure, tail = null) {
  const tailW = tail ? tail.width : 0;
  const lines = [];
  let line = '';
  // A space that lands at a wrap point hangs off the edge and paints nothing,
  // so it is not part of the line that is shown or of its width.
  const push = () => { lines.push(line.replace(/[ \t]+$/, '')); line = ''; };

  // How many characters of `word` fit in `width`, found by halving rather than
  // by stepping: a 3,000-character paste is one word, and stepping measures it
  // once per character per line.
  const fitCount = (word) => {
    let lo = 1, hi = word.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (measure(word.slice(0, mid)) <= width) lo = mid; else hi = mid - 1;
    }
    return lo;
  };
  // One word wider than the whole column: `overflow-wrap: break-word` splits it
  // between characters. Leaves the remainder on the current line.
  const breakWord = (word) => {
    let rest = word;
    while (measure(rest) > width) {
      line = rest.slice(0, fitCount(rest));
      rest = rest.slice(line.length);
      push();
    }
    line = rest;
  };

  text.split('\n').forEach((para, pi, paras) => {
    const isLast = pi === paras.length - 1;
    // Words and the runs of breakable whitespace between them, both kept.
    const parts = para.length ? para.match(/[^ \t]+|[ \t]+/g) : [];

    for (let pj = 0; pj < parts.length; pj++) {
      const part = parts[pj];
      if (part[0] === ' ' || part[0] === '\t') { line += part; continue; }
      // Compared by INDEX, never by value: a paragraph whose last word also
      // appears earlier would otherwise reserve the marker's width at the
      // earlier one and wrap a line too soon.
      const room = width - (isLast && pj === parts.length - 1 ? tailW : 0);

      if (line !== '' && measure(line + part) > room) push();
      if (measure(part) > width) breakWord(part);
      else line += part;
    }
    push();
  });

  // The tail did not fit beside the last line, so it takes its own.
  if (tail && measure(lines[lines.length - 1]) + tailW > width) lines.push('');
  return lines;
}

const lastWidth = (lines, measure) => measure(lines[lines.length - 1]);

// Space, tab, newline. Deliberately not \s: U+00A0 and friends do not break.
const BREAKS = /[ \t\n]/;

// Places a cut may land: immediately before any whitespace, so the hidden half
// always starts with the whitespace that separated it. Post 5 proves this is
// real -- "Even vitamin b… more" fitted the desktop column and LinkedIn showed
// "Even vitamin" instead, so a word is never shown in half.
function boundaries(text) {
  const out = [];
  // The SAME break set wrap() uses, and no wider. \s also matches a
  // non-breaking space, which is what a paste out of Word, Docs or Notion is
  // full of and which no browser breaks at: offering it as a cut point predicts
  // a fold the real feed cannot produce, inside what is really one word.
  for (let i = 1; i < text.length; i++) if (BREAKS.test(text[i])) out.push(i);
  return out;
}

/**
 * What LinkedIn shows for `text`, and what it hides behind "…more".
 * @returns {{lines: string[], truncated: boolean, shown: string, hidden: string}}
 */
export function preview(text, platform, measure) {
  const W = platform.textWidth;
  const marker = platform.ellipsis + platform.moreGap + platform.moreLabel;
  const tail = platform.marker === 'inline'
    ? { text: marker, width: measure(marker) }
    : null;

  const whole = wrap(text, W, measure);
  if (whole.length <= MAX_LINES) {
    return { lines: whole, truncated: false, shown: text, hidden: '' };
  }

  // Two conditions. `withinLines` only ever goes from true to false as the
  // prefix grows, so it can be binary searched. `lastLineHasRoom` can flip back
  // on (a longer prefix starts a fresh, short third line), so it is walked down
  // from the answer instead of searched.
  const withinLines = (p) => wrap(p, W, measure, tail).length <= MAX_LINES;
  const lastLineHasRoom = (p) =>
    platform.marker === 'inline' ||
    lastWidth(wrap(p, W, measure), measure) <= W - platform.reserve;

  let cuts = boundaries(text);
  if (!cuts.length || !withinLines(text.slice(0, cuts[0]))) {
    // Nothing breaks at a space early enough -- one enormous word. Fall back to
    // cutting between characters so the preview still shows something.
    cuts = Array.from({ length: text.length }, (_, i) => i + 1);
  }

  let lo = 0, hi = cuts.length - 1, best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (withinLines(text.slice(0, cuts[mid]))) { best = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  while (best >= 0 && !lastLineHasRoom(text.slice(0, cuts[best]))) best--;

  const i = best >= 0 ? cuts[best] : 0;
  const shown = text.slice(0, i);
  return {
    lines: wrap(shown, W, measure),
    truncated: true,
    shown,
    hidden: text.slice(i),
  };
}

/**
 * The box a single image is drawn in. Its own shape is kept: LinkedIn contains
 * it rather than cropping it, so a photo taller than 4:5 gets bars down the
 * sides. Wider than 3:1 is the one branch with no measurement behind it.
 */
export function imageBox(naturalW, naturalH, containerWidth) {
  const ratio = naturalW / naturalH;
  let width = containerWidth;
  let height = width / ratio;

  const maxHeight = containerWidth * IMAGE.maxHeightRatio;
  if (height > maxHeight) {          // taller than 4:5 -- letterboxed. MEASURED.
    height = maxHeight;
    width = height * ratio;
    return { width, height, letterboxed: true, cropped: false };
  }
  const minHeight = containerWidth / IMAGE.maxWidthRatio;
  if (height < minHeight) {          // wider than 3:1 -- cropped. UNVERIFIED.
    return { width: containerWidth, height: minHeight, letterboxed: false, cropped: true };
  }
  return { width, height, letterboxed: false, cropped: false };
}
// Text width, measured by the browser's own layout engine.
//
// A rule stated in characters is wrong for one of them: at 14px SF Pro a
// capital W is 12.5px and a lowercase l is 3.9px, so 60 W is 748px and 60 l is
// 233px, and only one of those fits a LinkedIn column. Everything here goes
// through measureText.


export function makeMeasurer(font = FONT) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = font;
  const cache = new Map();
  const measure = (s) => {
    if (s === '') return 0;
    let v = cache.get(s);
    if (v === undefined) {
      v = ctx.measureText(s).width;
      if (cache.size > 20000) cache.clear();
      cache.set(s, v);
    }
    return v;
  };
  measure.font = font;
  // Called when the face may have changed under us; every cached width was
  // measured in the old one.
  measure.reset = () => cache.clear();
  return measure;
}
