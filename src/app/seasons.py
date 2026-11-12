"""Session-only scenery seasons: native CSP materials and one shared owned TreeFX model per species."""
from pathlib import Path

from scenery import treefx

SEASONS = ('spring', 'summer', 'autumn', 'winter')


def resolve(options):
    """Snow always uses winter scenery; otherwise honor the selected season. Pure."""
    return 'winter' if options['kind'] == 'snow' else options['season']


def config(season, aliases=()):
    """Native material/TreeFX conditions, without changing global CSP settings or session date. Pure."""
    winter, autumn = (0.5 if season == 'winter' else 0), (0.85 if season == 'autumn' else 0)
    own = ', '.join(sorted({name + '.bin' for name in treefx.MODELS} | set(aliases)))
    return f'''[CONDITION_...]
NAME=M2L_SEASON_WINTER
INPUT=ONE
LUT=(|0={winter}|1={winter}|)
LAG=0
[CONDITION_...]
NAME=M2L_SEASON_AUTUMN
INPUT=ONE
LUT=(|0={autumn}|1={autumn}|)
LAG=0
[MATERIAL_ADJUSTMENT_...]
MESHES=1ROAD_ground_?, 1GRASS_ground_?, 1GRAVEL_ground_?
CONDITION=M2L_SEASON_WINTER
KEY_0=seasonWinter
VALUE_0=1
OFF_VALUE_0=0
[MATERIAL_ADJUSTMENT_...]
MESHES=1ROAD_ground_?, 1GRASS_ground_?, 1GRAVEL_ground_?
CONDITION=M2L_SEASON_AUTUMN
KEY_0=seasonAutumn
VALUE_0=0.5
OFF_VALUE_0=0
[TREES]
SEASON_WINTER_0=M2L_SEASON_WINTER
SEASON_AUTUMN_0=M2L_SEASON_AUTUMN
SEASON_AUTUMN_1={own}, 0
'''.encode('utf-8')


def install(track, season='summer'):
    """Prepare only owned shared tree atlases and a native season include before Play; no KN5 or placement writes."""
    ext = Path(track) / 'extension'
    ext.mkdir(parents=True, exist_ok=True)
    aliases = []
    for path in (ext / 'trees').glob('*.bin'):
        try:
            tree = treefx.read_bin(path)
        except ValueError:
            continue
        species = treefx.generated_species(tree)
        if not species:
            continue
        aliases.append(path.name)
        if tree.get('seasonal', {}).get('season') == season:
            continue                         # CSP may have added AO/cache data; retain it for the same season.
        path.write_bytes(treefx.bin_bytes(species, season))
    ini, raw = ext / 'map2lap_seasons.ini', config(season, aliases)
    if not ini.exists() or ini.read_bytes() != raw:
        ini.write_bytes(raw)
