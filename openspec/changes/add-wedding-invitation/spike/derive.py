import json, re, gzip, io

src = json.load(open('bsc5.json'))

def ra_deg(s):
    m = re.match(r'\s*(\d+)h\s*(\d+)m\s*([\d.]+)s', s)
    h, mi, se = float(m.group(1)), float(m.group(2)), float(m.group(3))
    return (h + mi/60 + se/3600) * 15.0

def dec_deg(s):
    s = s.replace('°',' ').replace('′',' ').replace('″',' ')
    m = re.match(r'\s*([+-])\s*(\d+)\s+(\d+)\s+([\d.]+)', s)
    sign = -1.0 if m.group(1) == '-' else 1.0
    d, mi, se = float(m.group(2)), float(m.group(3)), float(m.group(4))
    return sign * (d + mi/60 + se/3600)

rows = []
for r in src:
    if not r.get('RA') or not r.get('Dec') or not r.get('V'):
        continue
    try:
        v = float(r['V'])
    except ValueError:
        continue
    rows.append((ra_deg(r['RA']), dec_deg(r['Dec']), v))

rows.sort(key=lambda x: x[2])
print('parsed total:', len(rows))

for cut in (3.5, 4.0, 4.5, 5.0, 5.5):
    sub = [[round(a,2), round(b,2), round(c,1)] for a,b,c in rows if c < cut]
    blob = json.dumps(sub, separators=(',',':')).encode()
    gz = len(gzip.compress(blob, 9))
    print(f'mag<{cut}: {len(sub):5d} stars  raw {len(blob)/1024:6.1f}KB  gzip {gz/1024:5.1f}KB')

sub = [[round(a,2), round(b,2), round(c,1)] for a,b,c in rows if c < 4.5]
json.dump(sub, open('catalog.json','w'), separators=(',',':'))
print('wrote catalog.json:', len(sub))
