# Builds docs/design/comps/{a,b,c,d}/index.html: static comps of the Gripwell home page.
# Usage: python build_comps.py docs/design/comps [d ...]   (name comps to rebuild only those; A–C are signed off)
# Each file shows the page twice, side by side: a 1440px frame and a 390px frame
# (two srcdoc iframes, so each frame's media queries really fire at its width).
import json, html, os, sys

OUT = sys.argv[1]   # docs/design/comps
ONLY = sys.argv[2:]  # e.g. ['d']; empty = all

# ── Real data (local seed, board computed by lib/fitting-board at Fri 20 Nov 2026 08:10 London) ──
AS_OF = 'Fri 20 Nov · as of 08:10'
BRANCHES = [  # id, short, street, district, postcode, tel, lat, lng, rate, photo
  ('camden',      'Camden',      '14 Kentish Town Rd',   'Camden',         'NW1 9NX',  '020 7946 0101', 51.5417, -0.1428, 25, 'f25518196'),
  ('shoreditch',  'Shoreditch',  '82 Brick Lane',        'Shoreditch',     'E1 6RL',   '020 7946 0202', 51.5226, -0.0718, 28, 'f139298222'),
  ('brixton',     'Brixton',     '31 Atlantic Rd',       'Brixton',        'SW9 8HX',  '020 7946 0303', 51.4613, -0.1156, 27, 'f46001597'),
  ('hammersmith', 'Hammersmith', '5 King St',            'Hammersmith',    'W6 9HR',   '020 7946 0404', 51.4927, -0.2239, 32, 'f25505369'),
  ('islington',   'Islington',   '118 Upper St',         'Islington',      'N1 1QP',   '020 7946 0505', 51.5363, -0.1032, 30, 'f119721996'),
  ('greenwich',   'Greenwich',   '47 Greenwich High Rd', 'Greenwich',      'SE10 8JL', '020 7946 0606', 51.4769, -0.0004, 35, 'f43265954'),
  ('citycentre',  'City',        '9 Cheapside',          'City of London', 'EC2V 6AA', '020 7946 0707', 51.5138, -0.0934, 33, 'f18501769'),
]
B = {b[0]: b for b in BRANCHES}
# board order (soonest first): id, day, time, status, rank
BOARD = [
  ('camden',      None,       '09:30', '2 free',     1),
  ('shoreditch',  None,       '09:30', '1 free',     1),
  ('brixton',     None,       '10:00', '2 free',     2),
  ('hammersmith', None,       '11:00', '1 free',     3),
  ('islington',   None,       '12:00', '2 free',     3),
  ('greenwich',   None,       '15:00', 'Last bay',   3),
  ('citycentre',  'Tomorrow', '08:00', 'Full today', 4),
]
NEXT = {r[0]: r for r in BOARD}
TYRES = [  # brand, model, size, price (VAT incl.), image   (passenger tyres; Camden fits at £25)
  ('Kova',      'Ecoline 2',     '205/55 R16 V', 98.00,  'tyre-passenger.png'),
  ('Meridian',  'Citadel UX7',   '215/65 R16 H', 100.00, 'tyre-passenger.png'),
  ('Terrain X', 'Velo Sport 5',  '225/40 R18 Y', 145.00, 'tyre-passenger.png'),
  ('Corsaro',   'Strada Sport',  '245/45 R18 Y', 185.00, 'tyre-passenger.png'),
]
def money(v):
    return f'£{v:,.2f}'.replace('.00', '')
SET4 = lambda price: money(price * 4 + 25 * 4)
WIDTHS = [205, 215, 225, 245, 265, 275]
SWITCHBOARD = '020 7946 0800'
IMG = '../assets/img/'

esc = html.escape

# ── Shared CSS ──────────────────────────────────────────────────────────────
BASE_CSS = r"""
:root{
  --paper:#FAF8F4; --surface:#FFFFFF; --ink:#1E2128; --ink-2:#4A505B; --ink-3:#5C6370;
  --line:#E4E1DA; --line-2:#D6D2C9; --graphite:#2A2E36; --graphite-2:#1E2128;
  --orange:#FF6A1A; --orange-down:#E85A0E; --orange-ink:#1E2128;
  --board:#111317; --board-line:#2B2F37; --board-row:#191C21; --board-text:#F1F2F4; --board-muted:#A9B0BA;
  --amber:#FFB000; --amber-2:#E0A21E; --amber-3:#C68F1F;
  --muted-fg:#737373;
  --f:'Manrope',system-ui,sans-serif; --dots:'Doto','Manrope',monospace;
  --ease:cubic-bezier(.16,1,.3,1);
  --gut:20px; --max:1200px;
}
@media (min-width:1024px){ :root{ --gut:48px } }
*{box-sizing:border-box} html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:500 16px/1.55 var(--f);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit}
h1,h2,h3{font-family:var(--f);margin:0;text-wrap:balance}
p{margin:0}
.wrap{width:100%;max-width:calc(var(--max) + 2*var(--gut));margin:0 auto;padding:0 var(--gut)}
.kicker{display:block;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px}
.h2{font-size:clamp(28px,4.4vw,44px);font-weight:800;letter-spacing:-.025em;line-height:1.05}
.lead{font-size:17px;color:var(--ink-2);max-width:58ch}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 22px;border-radius:10px;border:0;font:800 16px/1 var(--f);text-decoration:none;cursor:pointer;transition:transform .15s var(--ease),background .2s}
.btn:hover{transform:translateY(-1px)} .btn:active{transform:translateY(1px) scale(.98)}
.btn-primary{background:var(--orange);color:var(--orange-ink)} .btn-primary:hover{background:var(--orange-down)}
.btn-dark{background:var(--graphite);color:#fff}
.btn-line{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}
.link{font-weight:800;text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat;transition:background-size .25s var(--ease)}
.link:hover{background-size:100% 2px}

/* top strip + header */
.strip{background:var(--graphite-2);color:#C9CED6;font-size:13px;font-weight:600}
.strip .wrap{display:flex;gap:18px;justify-content:center;min-height:34px;align-items:center;flex-wrap:wrap}
.strip b{color:#fff} .strip .tel{color:var(--orange);font-weight:800;text-decoration:none}
.strip .opt{display:none} @media (min-width:1024px){ .strip .opt{display:inline} }
.hdr{background:var(--graphite);color:#fff}
.hdr .wrap{display:flex;align-items:center;gap:28px;min-height:60px}
.hdr .logo img{height:24px;width:auto}
.hdr nav{display:none;gap:22px;font-size:15px;font-weight:700}
.hdr nav a{text-decoration:none;color:#E6E8EC} .hdr nav a:hover{color:#fff}
.hdr .sp{flex:1}
.hdr .basket{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border-radius:9px;background:var(--orange);color:var(--orange-ink);font-weight:800;font-size:14px;text-decoration:none}
.hdr .menu{width:44px;height:44px;display:grid;place-items:center;border-radius:9px;background:rgba(255,255,255,.08);border:0;color:#fff}
.hdr .acct{display:none;font-weight:700;font-size:14px;text-decoration:none;color:#E6E8EC}
@media (min-width:1024px){ .hdr nav{display:flex} .hdr .menu{display:none} .hdr .acct{display:inline} .hdr .logo img{height:28px} .hdr .wrap{min-height:68px} }

/* finder */
.modes{display:inline-flex;padding:3px;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1.5px var(--ink-3);margin:0 0 14px}
.mode{min-height:40px;padding:0 18px;display:inline-flex;align-items:center;border-radius:9px;font-size:15px;font-weight:800;color:var(--ink-2)}
.mode.on{background:var(--ink);color:var(--paper)}
.fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.field{display:grid;gap:6px;min-width:0}
.field label{font-size:13px;font-weight:800;color:var(--ink-2)}
.field select{appearance:none;width:100%;height:52px;padding:0 30px 0 12px;border:1.5px solid var(--ink-3);border-radius:10px;
  background:var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5l5-5' fill='none' stroke='%231E2128' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 11px center;
  font:800 17px/1 var(--f);color:var(--ink)}
.field select:disabled{background-color:#F1EFEA;border-color:var(--line);color:var(--ink-3);opacity:.55}
.hint{margin:12px 0 0;font-size:14px;color:var(--ink-2)}
.go{margin-top:14px;width:100%}
@media (min-width:1024px){ .go{width:auto} }

/* departure board */
.board{background:var(--board);color:var(--board-text);border-radius:14px;padding:4px 12px 8px;box-shadow:0 22px 48px -28px rgba(17,19,23,.6)}
.board table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.board caption{caption-side:top;text-align:left}
.board .cap{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;column-gap:12px;padding:13px 2px;border-bottom:1px solid var(--board-line)}
.board .ttl{font-size:15px;font-weight:800}
.board .meta{font-size:13px;font-weight:600;color:var(--board-muted)}
.board thead th{font-size:12px;font-weight:700;color:var(--board-muted);text-align:left;padding:10px 4px 6px}
.board thead .r{text-align:right}
.board tbody tr{border-top:1px solid var(--board-line);position:relative}
.board tbody tr:hover{background:var(--board-row)}
.board td,.board tbody th{padding:10px 4px;text-align:left;vertical-align:middle}
.board .t{white-space:nowrap;width:76px}
.board .dots{display:block;font:900 24px/1 var(--dots);letter-spacing:.02em}
.board .day{display:block;margin-top:3px;font-size:12px;font-weight:700;color:var(--board-muted)}
.board .br{font-weight:800;font-size:15px}
.board .br a{text-decoration:none}
.board .br a::after{content:'';position:absolute;inset:0}
.board .area{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--board-muted)}
.board .p{text-align:right;white-space:nowrap;font-size:15px;font-weight:800}
.board .u{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--board-muted)}
.board .s{text-align:right;white-space:nowrap;font-size:13px;font-weight:800;width:74px}
.board .k1 .dots{color:var(--amber)} .board .k2 .dots{color:var(--amber-2)} .board .k3 .dots{color:var(--amber-3)} .board .k4 .dots{color:var(--board-muted)}
.board .k1{font-size:1em} .board .k3 .br,.board .k4 .br{font-weight:700;color:var(--board-text)}
.board .last{color:var(--amber)} .board .full{color:var(--board-muted)}
@media (max-width:1023px){ .board{padding:4px 8px 6px} .board td,.board tbody th{padding:10px 3px} .board .t{width:62px} .board .dots{font-size:21px} .board .br{font-size:14px} .board .s{width:auto;font-size:12px} .board .u{font-size:11px} }
@media (min-width:1024px){ .board{padding:6px 18px 10px} .board .dots{font-size:28px} .board .t{width:96px} .board .s{width:96px} }

/* tyres */
.tyre{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:6px;text-decoration:none;transition:transform .2s var(--ease),box-shadow .2s}
.tyre:hover{transform:translateY(-2px);box-shadow:0 14px 30px -22px rgba(30,33,40,.5)}
.tyre .im{aspect-ratio:1;display:grid;place-items:center;background:#F3F1EC;border-radius:10px;margin-bottom:8px}
.tyre .im img{width:62%;height:auto}
.tyre .brand{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
.tyre .model{font-size:17px;font-weight:800}
.tyre .size{font-size:14px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.tyre .price{margin-top:auto;padding-top:10px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:2px}
.tyre .price b{font-size:20px;font-weight:800}
.tyre .price span{font-size:13px;color:var(--ink-2)}

/* map */
.map{width:100%;height:100%;min-height:300px;border-radius:14px;overflow:hidden;background:#E8E8E8;border:1px solid var(--line)}
.leaflet-container{font-family:var(--f)!important}
.pin svg{display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))}
.leaflet-tooltip.lbl{background:var(--graphite);color:#fff;border:0;border-radius:6px;font:800 12px/1 var(--f);padding:5px 7px;box-shadow:none}
.leaflet-tooltip.lbl::before{display:none}

/* hours */
.hero .grid>*{min-width:0}
.hrs{font-size:13px;color:var(--ink-2)}
.open{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800;color:#1E6B3A}
.open::before{content:'';width:8px;height:8px;border-radius:50%;background:#2E9E57}

/* newsletter */
.nl-form{display:flex;flex-direction:column;gap:10px;max-width:520px}
.nl-form input{height:52px;border-radius:10px;border:1.5px solid var(--ink-3);padding:0 14px;font:600 16px var(--f);background:var(--surface);color:var(--ink)}
.nl-note{font-size:13px;color:var(--ink-3);margin-top:8px}
@media (min-width:640px){ .nl-form{flex-direction:row} .nl-form input{flex:1} }

/* footer */
.ftr{background:var(--graphite);color:#C9CED6;font-size:14px}
.ftr a{text-decoration:none;color:#E6E8EC} .ftr a:hover{color:#fff}
.ftr .cols{display:grid;grid-template-columns:1fr 1fr;gap:28px 20px;padding:48px 0 36px}
.ftr h3{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:12px}
.ftr ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.ftr .about{grid-column:1/-1}
.ftr .about img{height:26px;width:auto;margin-bottom:12px}
.ftr .about p{max-width:36ch;color:#A9B0BA}
.ftr .base{border-top:1px solid rgba(255,255,255,.12);padding:18px 0 26px;display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;font-size:13px;color:#A9B0BA}
.ftr .soc{display:flex;gap:10px}
.ftr .soc a{width:36px;height:36px;border-radius:9px;background:#fff;display:grid;place-items:center;color:var(--muted-fg)}
.ftr .soc svg{width:16px;height:16px;fill:currentColor}
.ftr .credit{width:100%;font-size:12px;color:#8A919C}
@media (min-width:1024px){ .ftr .cols{grid-template-columns:1.6fr 1fr 1fr 1fr 1fr;padding:64px 0 44px} .ftr .about{grid-column:auto} }
"""

SOCIAL = ('<div class="soc">'
  '<a href="#" aria-label="Gripwell on LinkedIn"><svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.9 21h4.16V9.4H2.9V21Zm7.02 0h4.16v-6.3c0-1.66.6-2.66 2.02-2.66 1.32 0 1.86.94 1.86 2.7V21H22.1v-6.9c0-3.4-1.82-4.98-4.24-4.98-1.96 0-2.84 1.08-3.33 1.84V9.4H9.92c.06 1.16 0 11.6 0 11.6Z"/></svg></a>'
  '<a href="#" aria-label="Gripwell on Facebook"><svg viewBox="0 0 24 24"><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.3c0-.9.3-1.5 1.6-1.5h1.5V4.2C16.3 4.1 15.2 4 14 4c-2.5 0-4.2 1.5-4.2 4.3v2.2H7.3v3h2.5V21h3.7z"/></svg></a>'
  '<a href="#" aria-label="Gripwell on Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5" fill="none"/><circle cx="12" cy="12" r="4" fill="none"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>'
  '</div>')

_cr = json.load(open(f'{OUT}/assets/img/credits.json', encoding='utf-8'))['photos']
USED = 'f113443523 f201752795 f198617444 f165704163 f165703947 f25518196 f139298222 f46001597 f25505369 f119721996 f43265954 f18501769'.split()
CREDIT_LINE = ('Photographs from Wikimedia Commons: ' + '; '.join(
    dict.fromkeys(f"{c['by']} ({c['licence']})" for c in sorted(_cr, key=lambda c: c['by']) if c['id'] in USED)) +
    '. Full list in CREDITS.md. Map tiles © Esri, HERE, Garmin, © OpenStreetMap contributors.')

def strip():
    return (f'<div class="strip"><div class="wrap"><span>Fitting from <b>£25</b> per tyre fitted<span class="opt">, balancing and new valves included</span></span>'
            f'<span class="opt">7 branches across London</span><span>Call <a class="tel" href="tel:+442079460800">{SWITCHBOARD}</a></span></div></div>')

def header():
    return ('<header class="hdr"><div class="wrap">'
            '<a class="logo" href="#" aria-label="Gripwell home"><img src="../assets/brand/logo-horizontal-reversed.svg" alt="Gripwell"></a>'
            '<nav aria-label="Main"><a href="#">Tyres</a><a href="#">Wheels</a><a href="#">Fitting &amp; services</a><a href="#branches">Branches</a><a href="#">Warranty</a></nav>'
            '<span class="sp"></span><a class="acct" href="#">Account</a>'
            '<a class="basket" href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/></svg>Basket 0</a>'
            '<button class="menu" aria-label="Open menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'
            '</div></header>')

def finder(idp):
    opts = ''.join(f'<option>{w}</option>' for w in WIDTHS)
    return (f'<form class="finder" onsubmit="return false">'
            f'<div class="modes" role="radiogroup" aria-label="Search by"><span class="mode on" role="radio" aria-checked="true">Tyre size</span><span class="mode" role="radio" aria-checked="false">Car</span></div>'
            f'<div class="fields">'
            f'<div class="field"><label for="{idp}w">Width</label><select id="{idp}w"><option>–</option>{opts}</select></div>'
            f'<div class="field"><label for="{idp}p">Profile</label><select id="{idp}p" disabled><option>–</option></select></div>'
            f'<div class="field"><label for="{idp}r">Rim</label><select id="{idp}r" disabled><option>–</option></select></div>'
            f'</div>'
            f'<p class="hint">Your size is on the tyre&rsquo;s sidewall, for example 205/55 R16.</p>'
            f'<button class="btn btn-primary go" type="submit">Show tyres and prices</button></form>')

def board(title='Free bays today'):
    rows = ''
    for bid, day, time, status, rank in BOARD:
        b = B[bid]
        cls = 'last' if status == 'Last bay' else 'full' if status.startswith('Full') else ''
        rows += (f'<tr class="k{rank}"><td class="t"><span class="dots">{time}</span>'
                 + (f'<span class="day">{day}</span>' if day else '') +
                 f'</td><th scope="row" class="br"><a href="#">{b[1]}</a><span class="area">{b[4]}</span></th>'
                 f'<td class="p">£{b[8]}<span class="u">per tyre fitted</span></td>'
                 f'<td class="s {cls}">{status}</td></tr>')
    return (f'<div class="board"><table><caption><span class="cap"><span class="ttl">{title}</span><span class="meta">{AS_OF}</span></span></caption>'
            f'<thead><tr><th scope="col">Time</th><th scope="col">Branch</th><th scope="col" class="r">Fitting</th><th scope="col" class="r">Bays</th></tr></thead>'
            f'<tbody>{rows}</tbody></table></div>')

def tyre_cards():
    out = ''
    for brand, model, size, price, img in TYRES:
        out += (f'<a class="tyre" href="#"><span class="im"><img src="{IMG}{img}" alt="" loading="lazy"></span>'
                f'<span class="brand">{brand}</span><span class="model">{model}</span><span class="size">{size}</span>'
                f'<span class="price"><b>{money(price)}</b><span>per tyre<br>4 fitted at Camden: {SET4(price)}</span></span></a>')
    return out

def footer():
    names = ''.join(f'<li><a href="#">{b[1]}</a></li>' for b in BRANCHES)
    return (f'<footer class="ftr"><div class="wrap"><div class="cols">'
            f'<div class="about"><img src="../assets/brand/logo-horizontal-reversed.svg" alt="Gripwell"><p>Tyres and wheels for London drivers, fitted at seven branches. Prices include VAT. Demo project, not a real business.</p></div>'
            f'<div><h3>Shop</h3><ul><li><a href="#">Tyres by size</a></li><li><a href="#">Tyres by car</a></li><li><a href="#">Wheels</a></li><li><a href="#">Basket</a></li></ul></div>'
            f'<div><h3>Fitting</h3><ul><li><a href="#">Free bays</a></li><li><a href="#">Services</a></li><li><a href="#">Warranty claims</a></li><li><a href="tel:+442079460800">{SWITCHBOARD}</a></li></ul></div>'
            f'<div><h3>Branches</h3><ul>{names}</ul></div>'
            f'<div><h3>Legal</h3><ul><li><a href="#">Warranty &amp; returns</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>'
            f'</div><div class="base"><span>© 2026 Gripwell</span>{SOCIAL}<span class="credit">{CREDIT_LINE}</span></div></div></footer>')

def newsletter(heading='Fitting news, once a fortnight'):
    return (f'<h2 class="h2">{heading}</h2>'
            f'<p class="lead" style="margin:12px 0 22px">New stock in common sizes, branch opening hours over bank holidays, and when winter tyres come in. One email a fortnight.</p>'
            f'<form class="nl-form" onsubmit="return false"><label class="sr" for="nl" style="position:absolute;left:-9999px">Email address</label><input id="nl" type="email" placeholder="you@email.com" autocomplete="email"><button class="btn btn-dark" type="submit">Sign me up</button></form>'
            f'<p class="nl-note">We send a link to confirm first. Unsubscribe from any email.</p>')

def hours_line(b):
    return f'<span class="open">Open now</span> <span class="hrs">Today 08:00–17:30</span>'

MAP_JS = r"""
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  var PINS = %s;
  document.querySelectorAll('[data-map]').forEach(function(el){
    var m = L.map(el,{scrollWheelZoom:false,attributionControl:true,zoomSnap:0.25});
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {maxZoom:16,attribution:'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'}).addTo(m);
    var icon = L.divIcon({className:'pin',iconSize:[28,38],iconAnchor:[14,37],tooltipAnchor:[0,-30],
      html:'<svg width="28" height="38" viewBox="0 0 28 38"><path d="M14 1C7 1 1.5 6.5 1.5 13.4 1.5 22.6 14 37 14 37s12.5-14.4 12.5-23.6C26.5 6.5 21 1 14 1Z" fill="#FF6A1A" stroke="#fff" stroke-width="2"/><circle cx="14" cy="13.5" r="4.6" fill="#2A2E36"/></svg>'});
    var labels = el.hasAttribute('data-labels') && window.innerWidth >= 700;
    PINS.forEach(function(p){
      var mk = L.marker([p[1],p[2]],{icon:icon,title:p[0]}).addTo(m);
      if (labels) mk.bindTooltip(p[0],{permanent:true,direction:'top',className:'lbl'});
      else mk.bindPopup('<b>'+p[0]+'</b>');
    });
    m.fitBounds(PINS.map(function(p){return [p[1],p[2]]}),{padding:[36,36]});
  });
})();
</script>
""" % json.dumps([[b[1], b[6], b[7]] for b in BRANCHES])

# The child frame reports its height so the stage can size the iframe.
HEIGHT_JS = """<script>
(function(){var post=function(){parent.postMessage({gwFrame:window.name,h:document.documentElement.scrollHeight},'*')};
addEventListener('load',post);new ResizeObserver(post).observe(document.body);setTimeout(post,1500);})();
</script>"""

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Doto:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">')

def page(title, css, body, fonts=FONTS, base=BASE_CSS):
    return (f'<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{esc(title)}</title>{fonts}<style>{base}{css}</style></head><body>{body}{MAP_JS}{HEIGHT_JS}</body></html>')

# ── Stage: the file the user opens ──────────────────────────────────────────
STAGE = """<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>%(title)s</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet">
<style>
  body{margin:0;background:#D9D6CF;font:500 14px/1.4 Manrope,system-ui,sans-serif;color:#1E2128}
  .bar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:10px 24px;align-items:center;padding:12px 24px;background:#1E2128;color:#E6E8EC}
  .bar b{font-size:15px;color:#fff} .bar .note{color:#A9B0BA;flex:1;min-width:260px}
  .bar a{color:#E6E8EC;font-weight:800;text-decoration:none;padding:6px 10px;border-radius:7px} .bar a[aria-current]{background:#FF6A1A;color:#1E2128}
  .bar button{font:800 13px Manrope,sans-serif;border:0;border-radius:7px;padding:7px 12px;background:#3A3F49;color:#fff;cursor:pointer}
  .bar button[aria-pressed=true]{background:#fff;color:#1E2128}
  .outer{padding:28px 24px 60px;overflow-x:auto}
  .stage{display:flex;gap:56px;align-items:flex-start;transform-origin:0 0;width:max-content}
  .col{display:flex;flex-direction:column;gap:10px}
  .lbl{font-weight:800;font-size:15px;color:#1E2128}
  iframe{display:block;border:0;background:#fff;box-shadow:0 30px 60px -30px rgba(0,0,0,.45);border-radius:6px}
  #d{width:1440px;height:2000px} #m{width:390px;height:2000px;border-radius:28px}
</style></head><body>
<div class="bar"><b>%(title)s</b><span class="note">%(note)s</span>
  <nav>%(nav)s</nav>
  <button type="button" id="fit" aria-pressed="true">Fit to window</button><button type="button" id="full" aria-pressed="false">Actual size</button></div>
<div class="outer"><div class="stage" id="stage">
  <div class="col"><span class="lbl">Desktop · 1440px</span><iframe id="d" name="d" title="Desktop 1440px" srcdoc="%(doc)s"></iframe></div>
  <div class="col"><span class="lbl">Mobile · 390px (primary)</span><iframe id="m" name="m" title="Mobile 390px" srcdoc="%(doc)s"></iframe></div>
</div></div>
<script>
  var stage=document.getElementById('stage'),outer=document.querySelector('.outer'),fit=true;
  function scale(){var s=fit?Math.min(1,(outer.clientWidth-48)/stage.scrollWidth):1;
    stage.style.transform='scale('+s+')';stage.style.height='';outer.style.height=fit?(stage.scrollHeight*s+88)+'px':'';}
  addEventListener('message',function(e){var d=e.data;if(!d||!d.gwFrame)return;var f=document.getElementById(d.gwFrame);if(f){f.style.height=d.h+'px';scale();}});
  addEventListener('resize',scale);
  document.getElementById('fit').onclick=function(){fit=true;this.setAttribute('aria-pressed','true');document.getElementById('full').setAttribute('aria-pressed','false');scale()};
  document.getElementById('full').onclick=function(){fit=false;this.setAttribute('aria-pressed','true');document.getElementById('fit').setAttribute('aria-pressed','false');scale()};
  scale();
</script></body></html>"""

def comp_href(c):  # comps may have been renamed by hand (e.g. "a/index a.html"); link to what is there
    d = f'{OUT}/{c}'
    found = sorted(f for f in os.listdir(d) if f.endswith('.html')) if os.path.isdir(d) else []
    return f'../{c}/' + (found[0] if found else 'index.html').replace(' ', '%20')

def stage(comp, title, note, doc, comps='abc'):
    nav = ''.join(f'<a href="{comp_href(c)}"{" aria-current=page" if c == comp else ""}>Comp {c.upper()}</a>' for c in comps)
    return STAGE % {'title': esc(title), 'note': esc(note), 'nav': nav, 'doc': esc(doc, quote=True)}

def write(comp, title, note, css, body, comps='abc', **page_kw):
    if ONLY and comp not in ONLY:
        return
    os.makedirs(f'{OUT}/{comp}', exist_ok=True)
    doc = page(f'Gripwell · {title}', css, body, **page_kw)
    open(f'{OUT}/{comp}/index.html', 'w', encoding='utf-8').write(stage(comp, f'Comp {comp.upper()} · {title}', note, doc, comps))

def pic(pid, alt, sizes='100vw', big=False, cls='', eager=False):
    files = sorted(f for f in os.listdir(f'{OUT}/assets/img') if f.startswith(f'photo-{pid}'))
    def w(f):
        part = f[len(f'photo-{pid}'):-4]
        return int(part[1:]) if part else 1600
    srcset = ', '.join(f'{IMG}{f} {w(f)}w' for f in sorted(files, key=w) if w(f) <= 1300)
    best = sorted(files, key=w)[-1 if big else 0]
    return (f'<img class="{cls}" src="{IMG}{best}" srcset="{srcset}" sizes="{sizes}" alt="{esc(alt)}"'
            f'{"" if eager else " loading=\"lazy\""} data-source="stand-in">')

SERVICES = [  # from components/home/InStoreServices.tsx; nothing priced that the site does not price
  ('Fitting & balancing', 'From £25 per tyre fitted', 'Balancing, new valves and disposal of the old tyres included.'),
  ('Safety inspection', 'Free', 'Tread, pressures, brakes and lights: a 15-minute once-over.'),
  ('Pre-MOT check', 'Free', 'Know what needs fixing before the MOT test.'),
  ('Wheel alignment', 'Call to book', 'Computerised four-wheel alignment for even wear and straight steering.'),
  ('Puncture repair', 'Call to book', 'Repaired while you wait, where it is safe to do so.'),
  ('Manufacturer service', 'Call to book', 'Manufacturer-schedule servicing that keeps your new-car warranty.'),
]
WHY = [
  ('The price on the page is the price you pay', 'Every price includes VAT. Fitting is shown per tyre fitted for each branch, and the basket shows the full total before you pay.'),
  ('A time on the board is a free bay', 'The board reads each branch&rsquo;s opening hours and the fittings already booked, two bays per branch, an hour a set.'),
  ('Warranty claims online', 'Something wrong with a tyre we fitted? Send the claim form with photos from the warranty page; you get an outcome within 5 working days.'),
]

# ════════════════════════════ COMP A ════════════════════════════
A_CSS = r"""
.sec{padding:72px 0} @media (min-width:1024px){ .sec{padding:128px 0} }
.hero{position:relative;background:var(--graphite)}
.hero .ph{width:100%;height:260px;object-fit:cover;object-position:30% 55%}
.hero .wrap{padding:0}
.hero .box{background:var(--paper);padding:28px var(--gut) 36px}
.hero h1{font-size:34px;font-weight:800;letter-spacing:-.03em;line-height:1.02}
.hero .lede{margin:14px 0 22px;font-size:16px;color:var(--ink-2)}
@media (min-width:1024px){
  .hero{height:760px}
  .hero .ph{position:absolute;inset:0;height:100%}
  .hero .wrap{position:relative;height:100%;display:flex;align-items:center;padding:0 var(--gut)}
  .hero .box{width:540px;border-radius:16px;padding:40px 40px 36px;box-shadow:0 30px 60px -30px rgba(0,0,0,.6)}
  .hero h1{font-size:52px}
}
.boardsec .grid{display:grid;gap:32px}
.boardsec .side p{color:var(--ink-2);margin-top:14px}
.boardsec .side ul{margin:22px 0 0;padding:0;list-style:none;display:grid;gap:12px;font-size:15px;color:var(--ink-2)}
.boardsec .side li b{color:var(--ink)}
@media (min-width:1024px){ .boardsec .grid{grid-template-columns:5fr 7fr;gap:72px;align-items:start} }
.tyres{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:32px}
@media (min-width:1024px){ .tyres{grid-template-columns:repeat(4,1fr);gap:24px;margin-top:48px} }
.svc .grid{display:grid;gap:32px;margin-top:32px}
.svc .ph{border-radius:14px;width:100%;aspect-ratio:4/5;object-fit:cover}
.svc ul{list-style:none;margin:0;padding:0}
.svc li{display:grid;grid-template-columns:1fr auto;gap:4px 16px;padding:18px 0;border-top:1px solid var(--line)}
.svc li:last-child{border-bottom:1px solid var(--line)}
.svc li h3{font-size:18px;font-weight:800} .svc li .pr{font-weight:800;font-size:15px;text-align:right}
.svc li p{grid-column:1/-1;color:var(--ink-2);font-size:15px}
@media (min-width:1024px){ .svc .grid{grid-template-columns:5fr 7fr;gap:72px;margin-top:48px;align-items:center} }
.why{background:var(--surface);border-block:1px solid var(--line)}
.why .grid{display:grid;gap:28px;margin-top:32px}
.why .n{font-size:13px;font-weight:800;color:var(--ink-3);letter-spacing:.1em}
.why h3{font-size:20px;font-weight:800;margin:8px 0;letter-spacing:-.01em}
.why p{color:var(--ink-2)}
@media (min-width:1024px){ .why .grid{grid-template-columns:repeat(3,1fr);gap:56px;margin-top:56px} }
.brs .grid{display:grid;gap:24px;margin-top:32px}
.brs .map{height:340px}
.brs ul{list-style:none;margin:0;padding:0}
.brs li{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:14px 0;border-top:1px solid var(--line)}
.brs li h3{font-size:17px;font-weight:800} .brs li .ad{color:var(--ink-2);font-size:14px;grid-column:1}
.brs li .st{grid-column:2;grid-row:1/3;text-align:right;font-size:13px;color:var(--ink-2)}
.brs .week{font-size:14px;color:var(--ink-3);margin-top:14px}
@media (min-width:1024px){ .brs .grid{grid-template-columns:7fr 5fr;gap:48px;margin-top:48px} .brs .map{height:620px} }
.nl .wrap{display:grid;gap:8px}
"""

def a_body():
    brs = ''.join(f'<li><h3>{b[1]}</h3><span class="ad">{b[2]}, {b[4]}</span><span class="st">{hours_line(b)}</span></li>' for b in BRANCHES)
    svcs = ''.join(f'<li><h3>{n}</h3><span class="pr">{p}</span><p>{d}</p></li>' for n, p, d in SERVICES)
    why = ''.join(f'<div><span class="n">0{i+1}</span><h3>{h}</h3><p>{d}</p></div>' for i, (h, d) in enumerate(WHY))
    return (strip() + header() + '<main>'
      '<section class="hero" aria-labelledby="h1">'
      + pic('f113443523', 'A tyre and service bay with a car raised for work, tyres stacked by the wall', big=True, cls='ph', eager=True) +
      '<div class="wrap"><div class="box">'
      '<h1 id="h1">Tyres fitted today at 7 London branches.</h1>'
      '<p class="lede">Pick your size for prices with fitting included. Fitting from £25 per tyre fitted, balancing and valves included. All prices include VAT.</p>'
      + finder('a') + '</div></div></section>'
      '<section class="sec boardsec" aria-labelledby="hb"><div class="wrap"><div class="grid">'
      '<div class="side"><span class="kicker">Free bays</span><h2 class="h2" id="hb">The next free fitting bay at every branch</h2>'
      '<p>Times come from each branch&rsquo;s hours and the fittings already booked. You choose the exact slot at checkout.</p>'
      '<ul><li><b>Camden, 09:30.</b> Two bays free, £25 per tyre fitted.</li><li><b>Greenwich, 15:00.</b> The last bay today.</li><li><b>City</b> is full today; first bay tomorrow at 08:00.</li></ul></div>'
      + board() + '</div></div></section>'
      '<section class="sec" aria-labelledby="ht" style="padding-top:0"><div class="wrap"><span class="kicker">In stock</span><h2 class="h2" id="ht">Tyres for the cars London drives most</h2>'
      '<div class="tyres">' + tyre_cards() + '</div></div></section>'
      '<section class="sec svc" aria-labelledby="hs" style="background:var(--surface);border-top:1px solid var(--line)"><div class="wrap"><span class="kicker">Services</span><h2 class="h2" id="hs">Fitting, checks and servicing in the same bays</h2>'
      '<div class="grid">' + pic('f198617444', 'A car on a jack with its wheel off, a work lamp lighting the hub', sizes='(min-width:1024px) 480px, 100vw', cls='ph') +
      f'<ul>{svcs}</ul></div></div></section>'
      f'<section class="sec why" aria-labelledby="hw"><div class="wrap"><span class="kicker">Why Gripwell</span><h2 class="h2" id="hw">Three things you can check before you pay</h2><div class="grid">{why}</div></div></section>'
      '<section class="sec brs" id="branches" aria-labelledby="hbr"><div class="wrap"><span class="kicker">Branches</span><h2 class="h2" id="hbr">Seven branches, open today until 17:30</h2>'
      f'<div class="grid"><div class="map" data-map data-labels></div><div><ul>{brs}</ul><p class="week">Mon–Fri 08:00–17:30 · Sat 08:00–16:00 · Sun closed</p></div></div></div></section>'
      '<section class="sec nl" aria-labelledby="hn" style="padding-top:0"><div class="wrap"><div>' + newsletter().replace('class="h2"', 'class="h2" id="hn"') + '</div></div></section>'
      '</main>' + footer())

# ════════════════════════════ COMP B ════════════════════════════
B_CSS = r"""
.sec{padding:52px 0} @media (min-width:1024px){ .sec{padding:80px 0} }
.hero .grid{display:grid}
.hero .l{padding:28px var(--gut) 36px;display:grid;grid-template-columns:minmax(0,1fr);gap:22px}
.hero h1{font-size:34px;font-weight:800;letter-spacing:-.03em;line-height:1.02}
.hero .lede{margin-top:12px;font-size:16px;color:var(--ink-2)}
.hero .ph{width:100%;aspect-ratio:4/5;object-fit:cover;object-position:50% 40%}
@media (min-width:1024px){
  .hero .grid{grid-template-columns:minmax(0,1fr) 560px;max-width:1440px;margin:0 auto}
  .hero .l{padding:44px 56px 56px 120px;gap:26px}
  .hero h1{font-size:50px}
  .hero .ph{aspect-ratio:auto;height:100%;min-height:100%}
  .hero .board{max-width:640px}
}
.split{display:grid;gap:24px}
@media (min-width:1024px){ .split{grid-template-columns:4fr 8fr;gap:56px} }
.svcl{list-style:none;margin:0;padding:0;display:grid;gap:0}
.svcl li{display:grid;align-content:start;grid-template-columns:1fr auto;gap:2px 16px;padding:14px 0;border-top:1px solid var(--line)}
.svcl h3{font-size:16px;font-weight:800} .svcl .pr{font-weight:800;font-size:14px;text-align:right}
.svcl p{grid-column:1/-1;font-size:14px;color:var(--ink-2)}
@media (min-width:1024px){ .svcl{grid-template-columns:1fr 1fr;column-gap:40px} .svcl li:nth-last-child(-n+2){border-bottom:1px solid var(--line)} }
.svc .ph{border-radius:12px;aspect-ratio:3/2;object-fit:cover;width:100%;margin-top:18px}
.why{background:var(--graphite);color:#E6E8EC}
.why .kicker{color:#A9B0BA}
.why .row{display:grid;gap:22px}
.why h3{font-size:17px;font-weight:800;color:#fff;margin-bottom:6px}
.why p{font-size:15px;color:#C9CED6}
@media (min-width:1024px){ .why .row{grid-template-columns:repeat(3,1fr);gap:40px} }
.tyl{list-style:none;margin:0;padding:0}
.tyl li{display:grid;grid-template-columns:56px 1fr auto;gap:14px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}
.tyl li:last-child{border-bottom:1px solid var(--line)}
.tyl img{width:56px;height:56px;object-fit:contain;background:#F3F1EC;border-radius:8px;padding:4px}
.tyl .m{font-weight:800} .tyl .s{display:block;font-size:13px;color:var(--ink-2)}
.tyl .pr{text-align:right;font-weight:800} .tyl .pr span{display:block;font-size:12px;font-weight:600;color:var(--ink-2)}
@media (min-width:1024px){ .tyl{display:grid;grid-template-columns:1fr 1fr;column-gap:40px} .tyl li:nth-last-child(2){border-bottom:1px solid var(--line)} }
.brs .grid{display:grid;gap:20px}
.brs .map{height:300px}
.brt{width:100%;border-collapse:collapse;font-size:14px}
.brt th,.brt td{text-align:left;padding:11px 6px;border-top:1px solid var(--line);vertical-align:top}
.brt thead th{font-size:12px;color:var(--ink-3);font-weight:800;border-top:0}
.brt .nm{font-weight:800;font-size:15px} .brt .ad{display:block;font-weight:500;font-size:13px;color:var(--ink-2)}
.brt .nx{font-weight:800;white-space:nowrap;text-align:right}
.brt .hide{display:none}
@media (min-width:1024px){ .brs .grid{grid-template-columns:5fr 7fr;gap:40px} .brs .map{height:auto;min-height:520px} .brt .hide{display:table-cell} }
.nlb{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:28px 22px;display:grid;gap:8px}
@media (min-width:1024px){ .nlb{grid-template-columns:1fr 1fr;align-items:center;padding:44px;gap:40px} .nlb .h2{font-size:34px} }
"""

def b_body():
    svcs = ''.join(f'<li><h3>{n}</h3><span class="pr">{p}</span><p>{d}</p></li>' for n, p, d in SERVICES)
    why = ''.join(f'<div><h3>{h}</h3><p>{d}</p></div>' for h, d in WHY)
    tyl = ''.join(f'<li><img src="{IMG}{img}" alt="" loading="lazy"><span><span class="m">{br} {mo}</span><span class="s">{sz}</span></span>'
                  f'<span class="pr">{money(p)}<span>4 fitted: {SET4(p)}</span></span></li>' for br, mo, sz, p, img in TYRES)
    rows = ''
    for b in BRANCHES:
        n = NEXT[b[0]]
        nx = f'{n[2]} · {n[3]}' if not n[1] else f'{n[1]} {n[2]}'
        rows += (f'<tr><td><span class="nm">{b[1]}</span><span class="ad">{b[2]}, {b[4]}</span></td>'
                 f'<td>{hours_line(b)}</td><td class="hide">£{b[8]} per tyre fitted</td><td class="nx">{nx}</td></tr>')
    return (strip() + header() + '<main>'
      '<section class="hero" aria-labelledby="h1"><div class="grid"><div class="l">'
      '<div><h1 id="h1">Tyres fitted today at 7 London branches.</h1>'
      '<p class="lede">Every time on the board is a real free fitting bay. Fitting from £25 per tyre fitted, balancing and valves included. All prices include VAT.</p></div>'
      + finder('b') + board() + '</div>'
      + pic('f201752795', 'A technician in overalls walking to a car raised on a lift, morning light through the workshop window', sizes='(min-width:1024px) 560px, 100vw', big=True, cls='ph', eager=True) +
      '</div></section>'
      '<section class="sec svc" aria-labelledby="hs"><div class="wrap"><div class="split"><div><span class="kicker">Services</span><h2 class="h2" id="hs">Fitting and checks at every branch</h2>'
      + pic('f165704163', 'Close-up of a tyre tread with deep grooves', sizes='(min-width:1024px) 380px, 100vw', cls='ph') +
      f'</div><ul class="svcl">{svcs}</ul></div></div></section>'
      f'<section class="sec why" aria-labelledby="hw"><div class="wrap"><span class="kicker">Why Gripwell</span><h2 class="h2" id="hw" style="color:#fff;margin-bottom:28px">What you can check before you pay</h2><div class="row">{why}</div></div></section>'
      '<section class="sec" aria-labelledby="ht"><div class="wrap"><div class="split"><div><span class="kicker">In stock</span><h2 class="h2" id="ht">Common sizes, priced fitted</h2>'
      '<p class="lead" style="margin-top:12px;font-size:15px">Set prices are for 4 tyres fitted at Camden, £25 per tyre fitted.</p></div>'
      f'<ul class="tyl">{tyl}</ul></div></div></section>'
      '<section class="sec brs" id="branches" aria-labelledby="hbr" style="padding-top:0"><div class="wrap"><span class="kicker">Branches</span><h2 class="h2" id="hbr" style="margin-bottom:24px">Seven branches, all open today</h2>'
      '<div class="grid"><div class="map" data-map data-labels></div>'
      f'<div><table class="brt"><thead><tr><th>Branch</th><th>Today</th><th class="hide">Fitting</th><th style="text-align:right">Next bay</th></tr></thead><tbody>{rows}</tbody></table>'
      '<p style="font-size:13px;color:var(--ink-3);margin-top:12px">Mon–Fri 08:00–17:30 · Sat 08:00–16:00 · Sun closed</p></div></div></div></section>'
      '<section class="sec" aria-labelledby="hn" style="padding-top:0"><div class="wrap"><div class="nlb">'
      + newsletter('Fitting news, once a fortnight').replace('class="h2"', 'class="h2" id="hn"').replace('<p class="lead" style="margin:12px 0 22px">', '<p class="lead" style="margin:8px 0 0;font-size:15px">').replace('<form', '</div><div><form').replace('<h2', '<div><h2', 1) +
      '</div></div></div></section></main>' + footer())

# ════════════════════════════ COMP C ════════════════════════════
ASPHALT = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E"
           "%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .12 0 0 0 0 .13 0 0 0 0 .15 0 0 0 .55 0'/%3E"
           "%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E\")")
C_CSS = r"""
.sec{padding:56px 0} @media (min-width:1024px){ .sec{padding:96px 0} }
.hero{background:#EEEBE5 %s;border-bottom:1px solid var(--line)}
.hero .grid{display:grid;gap:28px;padding:28px 0 40px}
.hero h1{font-size:34px;font-weight:800;letter-spacing:-.03em;line-height:1.02}
.hero .lede{margin:12px 0 22px;font-size:16px;color:var(--ink-2)}
@media (min-width:1024px){ .hero .grid{grid-template-columns:5fr 7fr;gap:64px;padding:72px 0 88px;align-items:start} .hero h1{font-size:50px} .hero .l{padding-top:12px} }
.cards{display:grid;gap:16px;margin-top:28px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:transform .2s var(--ease),box-shadow .2s}
.card:hover{transform:translateY(-2px);box-shadow:0 14px 30px -22px rgba(30,33,40,.5)}
.card .fr{overflow:hidden} .card .fr img{width:100%%;aspect-ratio:3/2;object-fit:cover;transition:transform .4s var(--ease)}
.card:hover .fr img{transform:scale(1.03)}
.card .bd{padding:16px 18px 18px;display:grid;gap:6px}
.card h3{font-size:18px;font-weight:800}
.card .pr{font-weight:800;font-size:14px}
.card p{font-size:14px;color:var(--ink-2)}
@media (min-width:1024px){ .svc .cards{grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px} }
.more{list-style:none;padding:0;margin:20px 0 0;display:grid;gap:0}
.more li{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--line);font-size:15px}
.more li b{font-weight:800}
@media (min-width:1024px){ .more{grid-template-columns:1fr 1fr;column-gap:40px} }
.why ol{list-style:none;margin:24px 0 0;padding:0;display:grid;gap:18px;counter-reset:w}
.why li{display:grid;grid-template-columns:36px 1fr;gap:4px 12px}
.why li::before{counter-increment:w;content:'0' counter(w);font-weight:800;font-size:14px;color:var(--ink-3);padding-top:2px}
.why li b{font-size:17px;font-weight:800} .why li span{grid-column:2;color:var(--ink-2);font-size:15px}
@media (min-width:1024px){ .why ol{grid-template-columns:repeat(3,1fr);gap:40px} }
.brs .map{height:300px;margin-top:24px}
.brs .cards{grid-template-columns:1fr}
.brs .card .fr img{aspect-ratio:16/9}
.brs .nx{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding-top:10px;margin-top:4px;border-top:1px solid var(--line)}
.brs .nx b{font-weight:800}
@media (min-width:640px){ .brs .cards{grid-template-columns:1fr 1fr} }
@media (min-width:1024px){ .brs .map{height:440px;margin-top:40px} .brs .cards{grid-template-columns:repeat(4,1fr);gap:20px} }
.instock{font-size:14px;color:var(--ink-2);margin-top:18px}
.instock b{color:var(--ink)}
.nlc{display:grid;gap:8px;border-top:1px solid var(--line)}
""" % ASPHALT

def c_body():
    feat = [('f198617444', 'A car on a jack with its wheel off, a work lamp lighting the hub', SERVICES[0]),
            ('f165703947', 'Close-up of a worn tyre tread with deep grooves', SERVICES[1]),
            ('f201752795', 'A technician walking to a car raised on a lift', SERVICES[3])]
    svc = ''.join(f'<a class="card" href="#"><span class="fr">{pic(pid, alt, sizes="(min-width:1024px) 400px, 100vw")}</span>'
                  f'<span class="bd"><h3>{n}</h3><span class="pr">{p}</span><p>{d}</p></span></a>' for pid, alt, (n, p, d) in feat)
    more = ''.join(f'<li><b>{n}</b><span>{p}</span></li>' for n, p, d in (SERVICES[2], SERVICES[4], SERVICES[5]))
    why = ''.join(f'<li><b>{h}</b><span>{d}</span></li>' for h, d in WHY)
    cards = ''
    for b in BRANCHES:
        n = NEXT[b[0]]
        nx = f'<span>Next bay <b>{n[2]}</b></span><span>{n[3]}</span>' if not n[1] else f'<span>Next bay <b>{n[1]} {n[2]}</b></span><span>{n[3]}</span>'
        cards += (f'<a class="card" href="#"><span class="fr">{pic(b[9], f"A residential street in {b[3]} with parked cars", sizes="(min-width:1024px) 300px, (min-width:640px) 50vw, 100vw")}</span>'
                  f'<span class="bd"><h3>{b[1]}</h3><p>{b[2]}, {b[4]}</p><span>{hours_line(b)}</span>'
                  f'<span class="nx">{nx}</span><span style="font-size:13px;color:var(--ink-2)">£{b[8]} per tyre fitted</span></span></a>')
    instock = ' · '.join(f'<b>{br} {mo}</b> {sz} {money(p)}' for br, mo, sz, p, _ in TYRES)
    return (strip() + header() + '<main>'
      '<section class="hero" aria-labelledby="h1"><div class="wrap"><div class="grid"><div class="l">'
      '<h1 id="h1">Tyres fitted today at 7 London branches.</h1>'
      '<p class="lede">Pick your size and the board shows the fitted price for a set of four at each branch. Fitting from £25 per tyre fitted. All prices include VAT.</p>'
      + finder('c') + f'<p class="instock">In stock now: {instock}, per tyre.</p></div>'
      + board() + '</div></div></section>'
      '<section class="sec svc" aria-labelledby="hs"><div class="wrap"><span class="kicker">Services</span><h2 class="h2" id="hs">What the bays do besides tyres</h2>'
      f'<div class="cards">{svc}</div><ul class="more">{more}</ul></div></section>'
      f'<section class="sec why" aria-labelledby="hw" style="padding-top:0"><div class="wrap"><span class="kicker">Why Gripwell</span><h2 class="h2" id="hw">Checkable, not claimed</h2><ol>{why}</ol></div></section>'
      '<section class="sec brs" id="branches" aria-labelledby="hbr" style="background:var(--surface);border-top:1px solid var(--line)"><div class="wrap"><span class="kicker">Branches</span><h2 class="h2" id="hbr">Seven branches, all open today</h2>'
      '<p class="lead" style="margin-top:10px;font-size:15px">Mon–Fri 08:00–17:30 · Sat 08:00–16:00 · Sun closed</p>'
      f'<div class="map" data-map data-labels></div><div class="cards">{cards}</div></div></section>'
      '<section class="sec" aria-labelledby="hn"><div class="wrap">' + newsletter().replace('class="h2"', 'class="h2" id="hn"') + '</div></section>'
      '</main>' + footer())

write('a', 'Workshop hero', 'Full-bleed workshop photograph behind the headline and search; the board gets its own section. Generous spacing.', A_CSS, a_body())
write('b', 'Split hero with technician', 'Headline, search and board stacked on the left, a tall technician portrait on the right. Compact spacing.', B_CSS, b_body())
write('c', 'Asphalt texture, board in the hero', 'Muted asphalt texture instead of a photo; board beside the search. Photographs only in services and branch cards. The most minimal.', C_CSS, c_body())

# ════════════════════════════ COMP D ════════════════════════════
# Final pick. Light page, no departure board, Manrope only (400–700). Own CSS instead of BASE_CSS, which
# carries the board, amber and Doto. One breakpoint at 768px; everything between scales with clamp().
D_FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
           '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">')
CHEVRON = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5l5-5' "
           "fill='none' stroke='%231E2128' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")")
D_CSS = r"""
:root{--paper:#FAF8F4;--surface:#FFFFFF;--ink:#1E2128;--ink-2:#4A505B;--graphite:#2A2E36;--graphite-2:#1E2128;
  --orange:#FF6A1A;--orange-down:#E85A0E;--muted-fg:#737373;--line:#E5E5E5;
  --f:'Manrope',system-ui,sans-serif;--gut:clamp(16px,4vw,48px);--max:1280px}
*{box-sizing:border-box} html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:400 16px/1.55 var(--f);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%} a{color:inherit;text-decoration:none} button,input,select{font-family:inherit}
h1,h2,h3,p{margin:0} h1,h2{text-wrap:balance}
:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.wrap{max-width:calc(var(--max) + 2*var(--gut));margin:0 auto;padding:0 var(--gut)}
.sec{padding:clamp(48px,7vw,96px) 0}
.eyebrow{display:block;font-size:14px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted-fg);margin-bottom:8px}
.h2{font-size:clamp(26px,3vw,36px);font-weight:700;letter-spacing:-.02em;line-height:1.15}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 22px;border-radius:8px;border:0;font:600 16px/1 var(--f);cursor:pointer;transition:background .2s}
.btn-primary{background:var(--orange);color:var(--ink)} .btn-primary:hover,.btn-primary:active{background:var(--orange-down)}

/* top bar + nav */
.top{background:var(--graphite);color:#E6E8EC;font-size:14px;font-weight:500;text-align:center;padding:7px var(--gut)}
.top b{color:#fff;font-weight:700} .top .dot{display:none}
@media (min-width:768px){ .top .dot{display:inline} }
@media (max-width:767px){ .top>span{display:block} }
.nav{background:var(--surface);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;gap:16px;min-height:64px}
.nav .logo{display:inline-flex;align-items:center;min-height:44px} .nav .logo img{height:24px;width:auto}
.nav .links{display:none;flex:1;justify-content:center;gap:clamp(12px,2vw,32px);font-size:clamp(14px,1.1vw,15px);font-weight:600;color:var(--ink-2)}
.nav .links a{display:inline-flex;align-items:center;min-height:44px;white-space:nowrap} .nav .links a:hover{color:var(--ink)}
.nav .sp{flex:1}
.nav .acct{display:none;align-items:center;min-height:44px;font-size:15px;font-weight:600}
.basket{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:8px;border:1.5px solid var(--orange);font-size:15px;font-weight:600;white-space:nowrap;transition:background .2s}
.basket:hover{background:#FFF1E8}
.menu{width:44px;height:44px;display:grid;place-items:center;border-radius:8px;background:none;border:1px solid var(--line);color:var(--ink)}
@media (min-width:768px){ .nav .wrap{min-height:72px} .nav .links,.nav .acct{display:inline-flex} .nav .sp,.menu{display:none} .nav .logo img{height:26px} }

/* hero */
.hero{padding:clamp(28px,5vw,72px) 0 clamp(36px,5vw,72px)}
.hero .grid{display:grid;gap:28px}
.hero .grid>*{min-width:0}
.hero h1{font-size:clamp(28px,3.4vw,40px);font-weight:700;letter-spacing:-.025em;line-height:1.12}
.hero .lede{margin-top:14px;font-size:15px;color:var(--ink-2);max-width:52ch}
.hero .ph{width:100%;height:56vw;object-fit:cover;object-position:50% 40%;border-radius:12px}
@media (min-width:768px){ .hero .grid{grid-template-columns:55fr 45fr;gap:clamp(32px,5vw,72px);align-items:center} .hero .lede{font-size:16px} .hero .ph{height:auto;aspect-ratio:4/5} }
.finder{margin-top:24px;max-width:540px}
.tabs{display:flex;gap:8px;margin-bottom:16px}
.tab{min-height:44px;padding:0 18px;border-radius:999px;border:1.5px solid var(--ink);background:none;font:600 14px/1 var(--f);color:var(--ink);cursor:pointer}
.tab[aria-checked=true]{background:var(--ink);color:#fff}
.fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field{display:grid;gap:6px;min-width:0} .field.w{grid-column:1/-1}
@media (min-width:768px){ .fields{grid-template-columns:repeat(3,minmax(0,1fr))} .field.w{grid-column:auto} }
.field label{font-size:14px;font-weight:600;color:var(--ink-2)}
.field select{appearance:none;width:100%;height:48px;padding:0 32px 0 12px;border:1px solid var(--muted-fg);border-radius:8px;
  background:var(--surface) CHEVRON no-repeat right 12px center;font:500 16px/1 var(--f);color:var(--ink)}
.field select:disabled{opacity:.5;cursor:not-allowed}
.hint{margin-top:12px;font-size:14px;color:var(--muted-fg)}
.go{margin-top:16px;width:100%}

/* rails: card rows that scroll sideways when they do not fit, with the next card peeking */
.rail{position:relative;list-style:none;display:grid;grid-auto-flow:column;grid-auto-columns:210px;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;
  margin:0 calc(-1*var(--gut));padding:2px var(--gut) 14px;scroll-padding-inline:var(--gut);scrollbar-width:thin}
.rail>li{scroll-snap-align:start;min-width:0}

/* available today */
.avail{padding:0 0 clamp(28px,3vw,40px)}
.ahead{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 16px}
.asof{font-size:14px;color:var(--muted-fg)}
.asub{margin:6px 0 20px;font-size:15px;color:var(--ink-2)}
@media (min-width:768px){ .avail .rail{grid-auto-columns:minmax(164px,1fr)} }
.ac{display:flex;flex-direction:column;gap:2px;height:100%;padding:16px;background:var(--surface);border:1px solid var(--line);border-radius:12px;transition:border-color .2s}
.ac:hover{border-color:var(--muted-fg)}
.ac h3{font-size:16px;font-weight:700}
.ac .pc{font-size:14px;color:var(--ink-2)}
.ac .nx{margin-top:12px;font-size:14px;color:var(--ink-2)} .ac .nx b{color:var(--ink);font-weight:700;font-size:16px}
.ac .pr{font-size:15px;font-weight:600;margin-bottom:12px} .ac .pr span{white-space:nowrap}
.badge{align-self:flex-start;display:inline-flex;align-items:center;min-height:28px;padding:0 10px;border-radius:999px;font-size:14px;font-weight:600;white-space:nowrap}
.ac .badge{margin-top:auto}
.b-free,.b-open{background:#E6F0E9;color:#1D5E36}
.b-last{background:#FFE6D6;color:#9A3A06}
.b-full{background:none;box-shadow:inset 0 0 0 1px #D4D4D4;color:var(--muted-fg);text-decoration:line-through;text-decoration-thickness:1px}

/* in stock */
.instock{padding:0 0 clamp(48px,7vw,96px)}
.instock p{font-size:15px;line-height:1.7;color:var(--ink-2)}
.instock b{color:var(--ink);font-weight:700} .instock .nw{white-space:nowrap}

/* services */
.svc{background:var(--surface);border-block:1px solid var(--line)}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:20px 12px;margin-top:24px}
@media (min-width:768px){ .sgrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,3vw,40px) clamp(16px,2vw,24px);margin-top:36px} }
.sc{display:flex;flex-direction:column;gap:2px;min-width:0}
.sc .ph{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;margin-bottom:10px}
.phd{display:grid;place-items:center;text-align:center;padding:12px;background:#ECEAE5;color:var(--ink-2);font-size:14px;font-weight:500}
.sc h3{font-size:16px;font-weight:700}
.sc .pr{font-size:14px;font-weight:600;color:var(--ink-2)}
.sc p{display:none;font-size:15px;color:var(--ink-2);margin-top:4px}
@media (min-width:768px){ .sc .ph{aspect-ratio:3/2;border-radius:12px;margin-bottom:14px} .sc h3{font-size:18px} .sc p{display:block} }

/* why */
.why{background:var(--graphite);color:#fff}
.why .wrap{padding-inline:max(24px,var(--gut))}
.why .eyebrow{color:#B5BAC3} .why .h2{color:#fff}
.why ol{list-style:none;margin:28px 0 0;padding:0;display:grid;gap:28px}
@media (min-width:768px){ .why ol{grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,4vw,56px);margin-top:44px} }
.why .n{display:block;font-size:15px;font-weight:700;letter-spacing:.06em;color:var(--orange);margin-bottom:8px}
.why h3{font-size:18px;font-weight:700;line-height:1.3}
.why p{margin-top:8px;font-size:15px;color:#C9CED6}

/* deals */
.deals{margin-top:24px}
@media (min-width:768px){ .deals{grid-auto-flow:row;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible;margin:36px 0 0;padding:0;gap:clamp(12px,2vw,24px)} }
.dc{display:flex;flex-direction:column;gap:2px;height:100%;padding:16px;background:var(--surface);border:1px solid var(--line);border-radius:12px;transition:border-color .2s}
.dc:hover{border-color:var(--muted-fg)}
.dc .im{aspect-ratio:4/3;display:grid;place-items:center;background:#F1EFEA;border-radius:8px;margin-bottom:12px}
.dc .im img{width:50%;height:auto}
.dc .brn{font-size:14px;font-weight:600;color:var(--muted-fg)}
.dc h3{font-size:16px;font-weight:700} .dc .sz{font-size:14px;color:var(--ink-2)}
.dc .pp{margin-top:auto;padding-top:12px;display:flex;align-items:baseline;flex-wrap:wrap;gap:0 8px}
.dc s{font-size:15px;color:var(--muted-fg)}
.dc .now{font-size:22px;font-weight:700;color:var(--orange-down)}
.dc .per{width:100%;font-size:14px;color:var(--ink-2)}

/* branches */
.brs .grid{display:grid;gap:16px;margin-top:24px}
.brs .grid>*{min-width:0}
.map{height:200px;border-radius:12px;overflow:hidden;background:#E8E8E8;border:1px solid var(--line)}
@media (min-width:768px){ .brs .grid{grid-template-columns:5fr 7fr;gap:clamp(20px,3vw,40px);align-items:start;margin-top:36px} .map{height:clamp(440px,48vw,640px);position:sticky;top:24px} }
.leaflet-container{font-family:var(--f)!important}
.map .leaflet-bar a{width:44px!important;height:44px!important;line-height:44px!important;font-family:var(--f)}
.pin svg{display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))}
.leaflet-tooltip.lbl{background:var(--graphite);color:#fff;border:0;border-radius:6px;font:700 12px/1 var(--f);padding:5px 7px;box-shadow:none}
.leaflet-tooltip.lbl::before{display:none}
.bl{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.bcol{container-type:inline-size}  /* cards follow the column width, not the viewport */
@container (min-width:560px){ .bl{grid-template-columns:1fr 1fr;gap:16px} }
.bc{display:grid;grid-template-columns:80px minmax(0,1fr);gap:14px;height:100%;padding:12px;background:var(--surface);border:1px solid var(--line);border-radius:12px;transition:border-color .2s}
.bc:hover{border-color:var(--muted-fg)}
.bc .ph{width:80px;height:80px;object-fit:cover;border-radius:8px}
.bc .bd{display:grid;gap:4px;align-content:start}
.bc h3{font-size:16px;font-weight:700} .bc .ad{font-size:14px;color:var(--ink-2)}
.bc .row{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin-top:4px;font-size:14px;color:var(--ink-2)}
.bc .row b{color:var(--ink);font-weight:700}
@container (min-width:560px){ .bc{grid-template-columns:1fr;padding:0;gap:0;overflow:hidden} .bc .ph{width:100%;height:auto;aspect-ratio:16/9;border-radius:0} .bc .bd{padding:14px 16px 16px} }
.week{margin-top:12px;font-size:14px;color:var(--muted-fg)}

/* newsletter */
.nlb{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:clamp(28px,5vw,56px) clamp(20px,4vw,48px);text-align:center}
.nlb p{margin:10px auto 0;max-width:46ch;font-size:15px;color:var(--ink-2)}
.nlb form{display:flex;flex-direction:column;gap:10px;max-width:480px;margin:24px auto 0}
.nlb input{height:48px;min-width:0;border:1px solid var(--muted-fg);border-radius:8px;padding:0 14px;font:500 16px var(--f);background:var(--surface);color:var(--ink)}
.nlb .note{margin-top:12px;font-size:14px;color:var(--muted-fg)}
@media (min-width:768px){ .nlb form{flex-direction:row} .nlb input{flex:1} }

/* footer */
.ftr{background:var(--graphite);color:#C9CED6;font-size:15px}
.ftr .cols{display:grid;gap:32px;padding:48px 0 32px}
@media (min-width:768px){ .ftr .cols{grid-template-columns:1.5fr 1fr 1fr;gap:clamp(24px,4vw,64px);padding:64px 0 40px} }
.ftr h3{font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;margin-bottom:6px}
.ftr .about img{height:26px;width:auto;margin-bottom:14px} .ftr .about p{max-width:38ch;color:#B5BAC3}
.ftr ul{list-style:none;margin:0;padding:0}
.ftr a{color:#E6E8EC} .ftr a:hover{color:#fff}
.ftr ul a,.ftr address a{display:flex;align-items:center;min-height:44px}
@media (min-width:768px){ .ftr ul a,.ftr address a{min-height:36px} }
.ftr address{font-style:normal;display:grid;justify-items:start}
.soc{display:flex;gap:10px;margin-top:20px}
.soc a{width:44px;height:44px;border-radius:10px;background:#fff;display:grid;place-items:center;color:var(--muted-fg)}
.soc svg{width:18px;height:18px;fill:currentColor}
.ftr .base{border-top:1px solid rgba(255,255,255,.14);padding:8px 0 20px;display:flex;flex-wrap:wrap;gap:0 24px;align-items:center;justify-content:space-between;font-size:14px;color:#B5BAC3}
.ftr .base nav{display:flex;flex-wrap:wrap;gap:0 20px} .ftr .base a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px}
""".replace('CHEVRON', CHEVRON)

D_SERVICES = [  # name, price (only where the site prices it), line, photo id or None (grey placeholder), alt / placeholder label
  ('Tyre fitting', 'From £25 per tyre fitted', 'New valves and disposal of the old tyres included.', 'f198617444', 'A car on a jack with its wheel off, a work lamp lighting the hub'),
  ('Wheel alignment', 'Call to book', 'Computerised four-wheel alignment for even wear and straight steering.', 'f113443523', 'A service bay with a car raised for work'),
  ('Balancing', 'Included with fitting', 'Every wheel we fit is balanced, so the steering stays smooth at speed.', None, 'Photo: wheel balancing machine'),
  ('Pre-MOT check', 'Free', 'Know what needs fixing before the MOT test.', 'f165703947', 'Close-up of a tyre tread'),
  ('Puncture repair', 'Call to book', 'Repaired while you wait, where it is safe to do so.', 'f165704163', 'Close-up of a tyre tread with deep grooves'),
  ('Manufacturer service', 'Call to book', 'Manufacturer-schedule servicing that keeps your new-car warranty.', None, 'Photo: technician at a diagnostic laptop'),
]
D_WHY = [
  ('The price on the page is the price you pay', 'No hidden extras. VAT is included and fitting is shown per tyre fitted at each branch.'),
  ('A time on this page is a free bay', 'Next-bay times come from branch hours minus the fittings already booked. They are not estimates.'),
  ('Warranty claims start online', 'Send the claim form with photos from the warranty page. No phone tree, no branch visit to file.'),
]
DEAL_WAS = (112, 115, 165, 210)  # comp-only "was" prices: the DB holds none, so a real deals row needs genuine price history first

def d_body():
    opts = ''.join(f'<option>{w}</option>' for w in WIDTHS)
    finder_html = ('<form class="finder" onsubmit="return false">'
      '<div class="tabs" role="radiogroup" aria-label="Search by"><button type="button" class="tab" role="radio" aria-checked="true">Tyre size</button>'
      '<button type="button" class="tab" role="radio" aria-checked="false">Car</button></div>'
      f'<div class="fields"><div class="field w"><label for="dw">Width</label><select id="dw"><option>-</option>{opts}</select></div>'
      '<div class="field"><label for="dp">Profile</label><select id="dp" disabled><option>-</option></select></div>'
      '<div class="field"><label for="dr">Rim</label><select id="dr" disabled><option>-</option></select></div></div>'
      '<p class="hint">Your size is on the tyre&rsquo;s sidewall, for example 205/55&nbsp;R16</p>'
      '<button class="btn btn-primary go" type="submit">Show tyres and prices</button></form>')
    avail = ''
    for bid, day, time, status, _ in BOARD:
        b = B[bid]
        kind = 'last' if status == 'Last bay' else 'full' if status.startswith('Full') else 'free'
        when = f'{day} {time}' if day else time
        avail += (f'<li><a class="ac" href="#"><h3>{b[1]}</h3><span class="pc">{b[4]}</span>'
                  f'<span class="nx">Next bay: <b>{when}</b></span>'
                  f'<span class="pr">£{b[8]} <span>per tyre fitted</span></span><span class="badge b-{kind}">{status}</span></a></li>')
    instock = ' · '.join(f'<b>{br} {mo}</b> <span class="nw">{sz} {money(p)}</span>' for br, mo, sz, p, _ in TYRES)
    svc = ''
    for n, pr, d, pid, alt in D_SERVICES:
        ph = (pic(pid, alt, sizes='(min-width:768px) 400px, 50vw', cls='ph') if pid
              else f'<div class="ph phd" role="img" aria-label="{alt}">{alt}</div>')
        svc += f'<div class="sc">{ph}<h3>{n}</h3><span class="pr">{pr}</span><p>{d}</p></div>'
    why = ''.join(f'<li><span class="n">0{i+1}</span><h3>{h}</h3><p>{d}</p></li>' for i, (h, d) in enumerate(D_WHY))
    deals = ''.join(
        f'<li><a class="dc" href="#"><span class="im"><img src="{IMG}{img}" alt="" loading="lazy"></span>'
        f'<span class="brn">{br}</span><h3>{mo}</h3><span class="sz">{sz}</span>'
        f'<span class="pp"><s><span class="sr">Was </span>{money(was)}</s><span class="now"><span class="sr">Now </span>{money(p)}</span><span class="per">per tyre</span></span></a></li>'
        for (br, mo, sz, p, img), was in zip(TYRES, DEAL_WAS))
    brs = ''
    for b in BRANCHES:
        n = NEXT[b[0]]
        when = f'{n[1]} {n[2]}' if n[1] else n[2]
        brs += (f'<li><a class="bc" href="#">{pic(b[9], f"A street in {b[3]}", sizes="(min-width:768px) 340px, 80px", cls="ph")}'
                f'<span class="bd"><h3>{b[1]}</h3><span class="ad">{b[2]}, {b[4]}</span>'
                f'<span class="row"><span class="badge b-open">Open</span><span>until 17:30</span></span>'
                f'<span class="row"><span>Next bay <b>{when}</b></span><span>from <b>£{b[8]}</b> per tyre fitted</span></span></span></a></li>')
    quick = ''.join(f'<li><a href="#">{x}</a></li>' for x in ('Tyres', 'Wheels', 'Services', 'Branches', 'Warranty', 'About'))
    return ('<div class="top"><span>Fitting from <b>£25</b> per tyre fitted</span><span class="dot"> · </span><span>Free collection &amp; delivery on 4+ tyres</span></div>'
      '<header class="nav"><div class="wrap"><a class="logo" href="#" aria-label="Gripwell home"><img src="../assets/brand/logo-horizontal.svg" alt="Gripwell"></a>'
      '<nav class="links" aria-label="Main"><a href="#">Tyres</a><a href="#">Wheels</a><a href="#">Fitting &amp; services</a><a href="#branches">Branches</a><a href="#">Warranty</a></nav>'
      '<span class="sp"></span><a class="acct" href="#">Account</a>'
      '<a class="basket" href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/></svg>Basket 0</a>'
      '<button class="menu" aria-label="Open menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'
      '</div></header><main>'
      '<section class="hero" aria-labelledby="h1"><div class="wrap"><div class="grid"><div>'
      '<h1 id="h1">Tyres fitted today at 7 London branches.</h1>'
      '<p class="lede">Pick your size to see the fitted price for a set of four at each branch. Fitting from £25 per tyre fitted. All prices include VAT.</p>'
      + finder_html + '</div>'
      + pic('f201752795', 'A technician in overalls walking to a car raised on a lift, morning light through the workshop window', sizes='(min-width:768px) 45vw, 100vw', big=True, cls='ph', eager=True) +
      '</div></div></section>'
      '<section class="sec avail" aria-labelledby="ha"><div class="wrap"><div class="ahead"><h2 class="h2" id="ha">Available today</h2>'
      f'<span class="asof">{AS_OF}</span></div><p class="asub">The next free fitting bay at each branch, soonest first.</p>'
      f'<ul class="rail">{avail}</ul></div></section>'
      f'<section class="instock" aria-label="In stock now"><div class="wrap"><p>In stock now: {instock}, per tyre.</p></div></section>'
      '<section class="sec svc" aria-labelledby="hs"><div class="wrap"><span class="eyebrow">Services</span><h2 class="h2" id="hs">What the hands actually do</h2>'
      f'<div class="sgrid">{svc}</div></div></section>'
      '<section class="sec why" aria-labelledby="hw"><div class="wrap"><span class="eyebrow">Why Gripwell</span><h2 class="h2" id="hw">Checkable, not claimed</h2>'
      f'<ol>{why}</ol></div></section>'
      '<section class="sec" aria-labelledby="hd"><div class="wrap"><span class="eyebrow">Deals</span><h2 class="h2" id="hd">Best deals this week</h2>'
      f'<ul class="rail deals">{deals}</ul></div></section>'
      '<section class="sec brs" id="branches" aria-labelledby="hbr" style="padding-top:0"><div class="wrap"><span class="eyebrow">Branches</span><h2 class="h2" id="hbr">7 branches across London</h2>'
      f'<div class="grid"><div class="map" data-map data-labels></div><div class="bcol"><ul class="bl">{brs}</ul>'
      '<p class="week">Mon–Fri 08:00–17:30 · Sat 08:00–16:00 · Sun closed</p></div></div></div></section>'
      '<section class="sec" aria-labelledby="hn" style="padding-top:0"><div class="wrap"><div class="nlb"><h2 class="h2" id="hn">Get deals and fitting reminders</h2>'
      '<p>New stock in common sizes and a reminder when your tyres are due a check. One email a fortnight.</p>'
      '<form onsubmit="return false"><label class="sr" for="nl">Email address</label><input id="nl" type="email" placeholder="you@email.com" autocomplete="email">'
      '<button class="btn btn-primary" type="submit">Subscribe</button></form><p class="note">We send a link to confirm first. Unsubscribe from any email.</p></div></div></section>'
      '</main>'
      '<footer class="ftr"><div class="wrap"><div class="cols">'
      '<div class="about"><img src="../assets/brand/logo-horizontal-reversed.svg" alt="Gripwell"><p>Tyres and wheels for London drivers, fitted at seven branches. Prices include VAT. Demo project, not a real business.</p>'
      + SOCIAL + '</div>'
      f'<div><h3>Quick links</h3><ul>{quick}</ul></div>'
      '<div><h3>Contact</h3><address>Gripwell head office<br>14 Kentish Town Rd<br>London NW1 9NX'
      f'<a href="tel:+442079460800">{SWITCHBOARD}</a><a href="mailto:hello@gripwell.demo">hello@gripwell.demo</a></address></div>'
      '</div><div class="base"><span>© 2026 Gripwell</span><nav aria-label="Legal"><a href="../CREDITS.md" target="_top">Photo credits</a><a href="#">Privacy</a><a href="#">Terms</a></nav></div></div></footer>')

write('d', 'Final pick', 'Light page; today’s availability as white branch cards. Manrope only. Technician photo in the hero; real branch data as of Fri 20 Nov 08:10.',
      D_CSS, d_body(), comps='abcd', fonts=D_FONTS, base='')
print('ok')
