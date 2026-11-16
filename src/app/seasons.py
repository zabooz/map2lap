"""Session-only scenery seasons: native CSP materials and one shared owned TreeFX model per species."""
from pathlib import Path

from scenery import treefx

SEASONS = ('spring', 'summer', 'autumn', 'winter')
# Saved paints hide the source ground and draw tracknative's non-colliding region copies instead.
GROUND_MESHES = '1ROAD_ground_?, 1GRASS_ground_?, 1GRAVEL_ground_?, nocol_ground_m2l_?'
# Dedicated roof texture families only; office glass and concrete walls must not receive roof snow.
# Keep the Editor's isRoofMaterial selector in scene/seasons.ts in step with this list.
ROOF_KINDS = ('rsl', 'rsh', 'rme', 'rfl', 'fbc', 'veg', 'pol', 'sol', 'tha', 'rgl', 'grv', 'bit', 'rtl', 'cop')


def resolve(options):
    """Snow always uses winter scenery; otherwise honor the selected season. Pure."""
    return 'winter' if options['kind'] == 'snow' else options['season']


def config(season, tree_list=False):
    """Native material/TreeFX conditions, without changing global CSP settings or session date. Pure."""
    winter, autumn = (0.5 if season == 'winter' else 0), (0.85 if season == 'autumn' else 0)
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
MESHES={GROUND_MESHES}
CONDITION=M2L_SEASON_WINTER
KEY_0=seasonWinter
VALUE_0=1
OFF_VALUE_0=0
[MATERIAL_ADJUSTMENT_...]
MESHES={GROUND_MESHES}
CONDITION=M2L_SEASON_AUTUMN
KEY_0=seasonAutumn
VALUE_0=0.5
OFF_VALUE_0=0
[MATERIAL_ADJUSTMENT_...]
MATERIALS={', '.join(kind + '_?' for kind in ROOF_KINDS)}
CONDITION=M2L_SEASON_WINTER
KEY_0=seasonWinter
VALUE_0=1
OFF_VALUE_0=0
[TREES]
{'LIST_0=trees/trees_seasonal.txt' if tree_list else ''}
SEASON_WINTER_0=M2L_SEASON_WINTER
; Deciduous foliage is already coloured in its atlas. Native autumn tint also colours evergreen needles.
SEASON_AUTUMN_0=0
'''.encode('utf-8')


def install(track, season='summer'):
    """Prepare owned atlases and a CSP list with isolated cache names; retain source identities and placements."""
    ext = Path(track) / 'extension'
    ext.mkdir(parents=True, exist_ok=True)
    aliases = {}
    for path in (ext / 'trees').glob('*.bin'):
        if path.name.startswith('m2l_runtime_'):
            continue
        try:
            tree = treefx.read_bin(path)
        except ValueError:
            continue
        species = treefx.generated_species(tree)
        if not species:
            continue
        runtime = path.with_name(treefx.runtime_name(species, season))
        # CSP writes baked AO into these files. Returning to a season keeps its bake;
        # a different generated payload gets a new name without deleting global caches.
        if not runtime.exists():
            runtime.write_bytes(treefx.bin_bytes(species, season))
        aliases[path.name] = runtime.name
        marked = tree.get('seasonal', {})
        if marked.get('season') == season and marked.get('format') == treefx.TREE_FORMAT:
            continue                         # CSP may have added AO/cache data; retain it for the same season.
        path.write_bytes(treefx.bin_bytes(species, season))
    listing = ext / 'trees/trees.txt'
    if listing.is_file():
        raw = runtime_list(listing.read_text(encoding='utf-8-sig'), aliases).encode('utf-8')
        _write(ext / 'trees/trees_seasonal.txt', raw)
    _write(ext / 'map2lap_seasons.ini', config(season, listing.is_file()))


def runtime_list(source, aliases):
    """Replace only owned filenames in source CSP lines; comments and unknown fields survive. Pure."""
    lines = []
    for line in source.splitlines(keepends=True):
        if line.lstrip().startswith('tree:'):
            head, sep, tail = line.partition(';')
            prefix, _, filename = head.partition(':')
            if filename.strip() in aliases:
                line = prefix + ': ' + aliases[filename.strip()] + sep + tail
        lines.append(line)
    return ''.join(lines)


def _write(ini, raw):
    """Write a generated session file only when its contents change."""
    if not ini.exists() or ini.read_bytes() != raw:
        ini.write_bytes(raw)
