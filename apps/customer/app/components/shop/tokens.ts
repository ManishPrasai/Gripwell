/* ── Shop design system ───────────────────────────────────────────────────
   The Find Tyres / Find Wheels / Cart / Warranty designs share one visual
   language, distinct from the homepage's: DM Sans 800 uppercase headings
   rather than Bebas Neue, a hotter orange, and near-square corners.

   Kept here as one set of values so the four pages can't drift apart, and so
   a future decision to fold them into the homepage system is a single edit.
──────────────────────────────────────────────────────────────────────── */

export const C = {
  orange:      '#FF6A1A',
  orangeDark:  '#E55A0E',
  orangeSoft:  '#FFF3EB',
  green:       '#2A2E36',
  greenDark:   '#054A24',
  greenSoft:   '#EAF3ED',
  greenInk:    '#04331B',
  greenLine:   '#B9D4C3',
  ink:         '#1B1C1E',
  ink2:        '#2B2B28',
  ink3:        '#5B5A55',
  muted:       '#6B6A64',
  muted2:      '#8D8B85',
  muted3:      '#9C9A93',
  line:        '#E4E4E1',
  line2:       '#E9E9E7',
  line3:       '#CCCCC8',
  wash:        '#F4F4F3',
  onDark:      '#D1D5DB',
  onDarkWarm:  '#FFB07A',
  onDarkMuted: '#9DBBA8',
} as const

export const FONT = "'DM Sans', system-ui, sans-serif"

/** Outer padding shared by every section on these pages. */
export const SECTION_PAD = 'clamp(36px,5vw,64px) clamp(16px,3vw,64px)'

/** These pages run wider than the homepage's 1180px shell. */
export const CONTAINER: React.CSSProperties = {
  maxWidth: '1600px',
  margin:   '0 auto',
}

/** Small orange all-caps label that sits above a section heading. */
export const KICKER: React.CSSProperties = {
  fontSize:      '12px',
  fontWeight:    800,
  letterSpacing: '1.6px',
  textTransform: 'uppercase',
  color:         C.orange,
  marginBottom:  '5px',
}

export const H2: React.CSSProperties = {
  font:          `800 clamp(26px,3.2vw,38px) ${FONT}`,
  color:         C.ink,
  margin:        0,
  textTransform: 'uppercase',
  letterSpacing: '.4px',
}

/** Field label above a select ("1. Width"). */
export const FIELD_LABEL: React.CSSProperties = {
  fontSize:      '12px',
  fontWeight:    700,
  color:         C.ink3,
  textTransform: 'uppercase',
  letterSpacing: '.6px',
}

export const SELECT: React.CSSProperties = {
  width:        '100%',
  marginTop:    '6px',
  padding:      '13px 10px',
  border:       `1.5px solid ${C.line3}`,
  borderRadius: '3px',
  fontSize:     '16px',
  fontWeight:   700,
  color:        C.ink,
  background:   '#fff',
  fontFamily:   FONT,
}

/** Primary orange action. */
export const CTA: React.CSSProperties = {
  textAlign:      'center',
  background:     C.orange,
  border:         'none',
  borderRadius:   '3px',
  padding:        '15px 22px',
  font:           `700 15px ${FONT}`,
  letterSpacing:  '.7px',
  textTransform:  'uppercase',
  color:          '#fff',
  textDecoration: 'none',
  cursor:         'pointer',
}

/** Secondary outlined green action. */
export const CTA_GHOST: React.CSSProperties = {
  display:        'inline-block',
  textAlign:      'center',
  border:         `1.5px solid ${C.green}`,
  borderRadius:   '3px',
  padding:        '13px 30px',
  font:           `700 14px ${FONT}`,
  letterSpacing:  '.7px',
  textTransform:  'uppercase',
  color:          C.green,
  textDecoration: 'none',
  background:     'transparent',
  cursor:         'pointer',
}

export const CARD: React.CSSProperties = {
  background:   '#fff',
  border:       `1px solid ${C.line}`,
  borderRadius: '4px',
}
