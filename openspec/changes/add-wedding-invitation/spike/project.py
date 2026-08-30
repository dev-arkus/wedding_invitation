import json, math

LAT, LON = 7.77, -72.22          # San Cristobal, Tachira
D2R = math.pi/180

def julian_day(y, mo, d, h, mi, s):
    if mo <= 2: y, mo = y-1, mo+12
    A = y//100; B = 2 - A + A//4
    jd = math.floor(365.25*(y+4716)) + math.floor(30.6001*(mo+1)) + d + B - 1524.5
    return jd + (h + mi/60 + s/3600)/24

def gmst_deg(jd):
    T = (jd - 2451545.0)/36525.0
    g = 280.46061837 + 360.98564736629*(jd - 2451545.0) + 0.000387933*T*T - T*T*T/38710000.0
    return g % 360

def altaz(ra_deg, dec_deg, lst_deg, lat=LAT):
    H = (lst_deg - ra_deg) * D2R
    dec, la = dec_deg*D2R, lat*D2R
    sin_alt = math.sin(dec)*math.sin(la) + math.cos(dec)*math.cos(la)*math.cos(H)
    alt = math.asin(max(-1, min(1, sin_alt)))
    az = math.atan2(-math.sin(H)*math.cos(dec),
                    math.cos(la)*math.sin(dec) - math.sin(la)*math.cos(dec)*math.cos(H))
    return alt/D2R, (az/D2R) % 360

MISA = julian_day(2026, 11, 7, 22, 0, 0)      # 2026-11-07T22:00:00Z
RECE = julian_day(2026, 11, 8,  0, 0, 0)      # 2026-11-08T00:00:00Z

for label, jd in (('misa 6:00 PM', MISA), ('recepcion 8:00 PM', RECE)):
    lst = (gmst_deg(jd) + LON) % 360
    print(f'{label:20s} JD={jd:.4f}  LST={lst/15:.3f}h ({lst:.2f} deg)')

lst_m = (gmst_deg(MISA) + LON) % 360
lst_r = (gmst_deg(RECE) + LON) % 360
print(f'rotacion misa -> recepcion: {(lst_r - lst_m) % 360:.2f} deg de AR\n')

# Estrellas de referencia conocidas (J2000)
REF = [
    ('Vega',       279.235,  38.784, 0.03),
    ('Altair',     297.696,   8.868, 0.77),
    ('Deneb',      310.358,  45.280, 1.25),
    ('Fomalhaut',  344.413, -29.622, 1.16),
    ('Antares',    247.352, -26.432, 1.06),
    ('Sirius',     101.287, -16.716, -1.46),
    ('Polaris',     37.955,  89.264, 1.98),
    ('Achernar',    24.429, -57.237, 0.46),
    ('Arcturus',   213.915,  19.182, -0.05),
    ('Canopus',     95.988, -52.696, -0.72),
]
print(f'{"estrella":12s} {"alt":>8s} {"az":>8s}   estado')
for n, ra, dec, v in REF:
    a, z = altaz(ra, dec, lst_m)
    where = 'BAJO HORIZONTE' if a < 0 else ('cerca del CENIT' if a > 80 else 'visible')
    print(f'{n:12s} {a:8.2f} {z:8.2f}   {where}')
