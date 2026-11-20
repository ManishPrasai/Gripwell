# Builds docs/design/comps/e/index.html (Comp E, design-taste-frontend place page). Run from comps/e:
#   python .taste-skill/build_e.py
from pathlib import Path
from urllib.parse import quote

BR = [('Camden', 'Kentish Town Road', 25), ('Shoreditch', 'Brick Lane', 28), ('Brixton', 'Atlantic Road', 27),
      ('Hammersmith', 'King Street', 32), ('Islington', 'Upper Street', 30), ('Greenwich', 'Greenwich High Road', 35),
      ('City of London', 'Cheapside', 33)]
osm = lambda s, d: 'https://www.openstreetmap.org/search?query=' + quote(f'{s}, {d}, London')
moment = ', '.join(f'<a href="{osm(s, d)}">{d}</a>' for d, s, _ in BR[:-1])
moment += f' and <a href="{osm(BR[-1][1], BR[-1][0])}">the City</a>'
branches = ''.join(f'<li><a class="link" href="{osm(s, d)}"><span class="full">{s}, {d}</span><span class="short">{d}</span></a><span>£{p}</span></li>'
                   for d, s, p in sorted(BR, key=lambda b: b[2]))


def rows(items):
    return '<ul class="rows">' + ''.join(
        f'<li><span class="rows__name">{n}</span><span class="rows__value">{v}</span></li>' for n, v in items) + '</ul>'


tyres = rows([('Kova Ecoline 2<small>205/55 R16</small>', '£98'), ('Meridian Citadel UX7<small>215/65 R16</small>', '£100'),
              ('Terrain X Velo Sport 5<small>225/40 R18</small>', '£145'), ('Corsaro Strada Sport<small>245/45 R18</small>', '£185')])
incl = rows([('Wheel balancing', 'Included'), ('New valves', 'Included'), ('Old tyres taken away', 'Included'), ('VAT', 'Included')])
other = rows([('Pre-MOT check', 'Free'), ('Puncture repair', 'While you wait'), ('Wheel alignment', 'Four wheels'),
              ('Warranty claims', 'Online')])


def img(pid, alt, sizes, extra=''):
    return (f'<img src="assets/img/photo-{pid}-960.jpg" srcset="assets/img/photo-{pid}-500.jpg 500w, '
            f'assets/img/photo-{pid}-960.jpg 960w" sizes="{sizes}" alt="{alt}" loading="lazy" decoding="async" '
            f'data-source="stand-in" data-subject="stand-in"{extra}>')


def img500(pid, alt, sizes="(max-width: 639px) 45vw, (max-width: 1023px) 40vw, 282px"):
    return (f'<img src="assets/img/photo-{pid}-500.jpg" srcset="assets/img/photo-{pid}-360.jpg 360w, assets/img/photo-{pid}-500.jpg 500w" sizes="{sizes}" alt="{alt}" loading="lazy" decoding="async" '
            f'data-source="stand-in" data-subject="stand-in">')


DIMS = {'f198617444': (500, 750), 'f25112040': (500, 333), 'f194394740': (500, 333)}


def card(pid, t, line):
    return (f'<a class="menu-card span-4" href="#tyres"><div class="panel"><img class="frame__img" '
            f'src="assets/img/photo-{pid}-500.jpg" width="{DIMS[pid][0]}" height="{DIMS[pid][1]}" alt="{t}" data-source="stand-in" data-subject="stand-in"></div>'
            f'<span class="t-card">{t}</span><span class="t-small muted">{line}</span></a>')


ARROW = ('<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/>'
         '<path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>')
opts = ''.join(f'<option>{d}, {s}</option>' for d, s, _ in BR)
brand = Path('.taste-skill/brand.txt').read_text(encoding='utf-8')
head_links = brand.split('<!--')[0].strip()
i = brand.index('<style>' + chr(10) + ':root'); root = brand[i:brand.index('</style>', i) + 8]
CHEV = ('<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" '
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')

page = Path('.taste-skill/page.tpl.html').read_text(encoding='utf-8')
for k, v in dict(HEAD_LINKS=head_links, ROOT=root, MOMENT=moment, BRANCHES=branches, TYRES=tyres, INCL=incl,
                 OTHER=other, OPTS=opts, ARROW=ARROW, CHEV=CHEV,
                 CARD1=card('f198617444', 'Tyre fitting', 'From £25 a tyre, balancing included'),
                 CARD2=card('f25112040', 'Wheel alignment', 'Four wheels, at the bay'),
                 CARD3=card('f194394740', 'Pre-MOT check', 'Free, before the test'),
                 IMG_VISIT=img('f113443523', 'A workshop bay with a car raised and its bonnet open under strip lights', '(max-width: 639px) 160vw, (max-width: 1023px) 50vw, 588px'),
                 IMG_STORY=img('f201752795', 'A fitter in overalls walking to a car raised on a lift', '(max-width: 1023px) 100vw, 588px'),
                 IMG_BOOK=img('f186889537', 'A two-post lift in a workshop bay beside a silver car', '(max-width: 1023px) 100vw, 588px'),
                 STRIP=''.join([img500('f165704163', 'A tyre tread close up, its grooves cut deep', '(max-width: 639px) 120vw, 500px'),
                                img500('f36837716', 'A wheel balancing machine with a tyre on its shaft', '(max-width: 639px) 120vw, 500px'),
                                img500('f6379859', 'A tyre changing machine in a fitting bay'),
                                img500('f170813252', 'Old tyres stacked for disposal')])).items():
    page = page.replace('{{' + k + '}}', v)
assert '{{' not in page, page[page.index('{{'):page.index('{{') + 40]
Path('index.html').write_text(page, encoding='utf-8')
print('wrote index.html', len(page))
