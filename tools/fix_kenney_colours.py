r"""Correct the verified Kenney Nature Kit library's legacy material colour space, keeping old packages and placements.

    .venv\Scripts\python.exe tools\fix_kenney_colours.py <publisher zip> [--root <app folder>] [--apply]

Without --apply, only report checked candidates. --apply publishes new immutable packages and replaces their catalogue
entries; existing originals remain addressable and existing track/draft snapshots are never edited.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src'))
from app import materiallibrary, modeldata, objectlibrary  # noqa: E402

SOURCE = 'https://kenney.nl/assets/nature-kit'


def _candidates(archive):
    """Verify each original palette against the publisher ZIP before publishing any replacement."""
    folder = Path(objectlibrary.ROOT, 'library/objects')
    replacements = objectlibrary._superseded()
    candidates = []
    for path in sorted(folder.iterdir() if folder.is_dir() else ()):
        if not materiallibrary.KEY.fullmatch(path.name):
            continue
        asset = objectlibrary.get(path.name)
        if asset.get('source_url') != SOURCE or asset.get('material_lighting') == 'matte':
            continue
        if asset['id'] in replacements and objectlibrary._folder(replacements[asset['id']]).joinpath('asset.json').is_file():
            continue
        try:
            provenance = materiallibrary._json(path / 'provenance.json')
        except FileNotFoundError:
            continue
        # Existing hand-made Dark Green/Dry variants are already linear and must not be decoded again.
        if provenance.get('provider') != 'Kenney' or provenance.get('variant'):
            continue
        original = archive.read(provenance['original_file'])
        if hashlib.sha256(original).hexdigest() != provenance['original_file_sha256']:
            raise ValueError('The publisher source does not match the retained Kenney provenance')
        canonical = objectlibrary.original(asset['id'])
        if hashlib.sha256(canonical).hexdigest() != provenance['sha256']:
            raise ValueError('The library model does not match its Kenney source preparation')
        upload = objectlibrary.source_path(path, asset) if asset.get('material_colours') == 'srgb' else None
        raw = upload.read_bytes() if upload else canonical
        source, _ = modeldata._chunks(original)
        prepared, _ = modeldata._chunks(raw)
        palette = lambda doc: [m.get('pbrMetallicRoughness', {}).get('baseColorFactor', [1, 1, 1, 1]) for m in doc.get('materials', [])]
        if palette(source) != palette(prepared):
            raise ValueError('The Kenney source palette was already changed; refusing another colour conversion')
        candidates.append((asset, provenance, raw))
    return candidates


def correct(archive, root=ROOT, apply=False):
    """Check a curated library; optionally publish corrected models, then replace only their catalogue entries."""
    previous = objectlibrary.ROOT
    objectlibrary.ROOT = str(Path(root).resolve())
    try:
        with zipfile.ZipFile(archive) as package:
            candidates = _candidates(package)
        replacements = []
        if apply:
            for asset, provenance, raw in candidates:
                filename = asset['model']['filename']
                prepared = objectlibrary.prepare(filename, raw)
                settings = {key: asset[key] for key in ('name', 'category', 'metres_per_unit', 'anchor', 'collision', 'tags', 'license')}
                result = objectlibrary.add({**settings, 'token': prepared['token'], 'filename': filename,
                                            'source': SOURCE, 'material_colours': 'srgb', 'material_lighting': 'matte'})['model']
                target = objectlibrary._folder(result['id'])
                record = {**provenance, 'id': result['id'], 'previous_id': asset['id'],
                          'sha256': result['model']['sha256'], 'material_colours': 'srgb', 'material_lighting': 'matte',
                          'correction': 'Decode source sRGB palette and explicitly declare matte artwork; alpha/maps/geometry unchanged.'}
                materiallibrary._write_json(target / 'provenance.json', record)
                license_file = objectlibrary._folder(asset['id']) / 'LICENSE.txt'
                if license_file.is_file():
                    shutil.copyfile(license_file, target / 'LICENSE.txt')
                if objectlibrary.source_path(target, result).read_bytes() != raw:
                    raise ValueError('The replacement did not retain its unchanged source upload')
                replacements.append({'old': asset['id'], 'new': result['id'], 'name': asset['name']})
            for replacement in replacements:
                objectlibrary.supersede(replacement['old'], replacement['new'])
        return {'candidates': len(candidates), 'applied': apply, 'replacements': replacements}
    finally:
        objectlibrary.ROOT = previous


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('archive', type=Path, help='The original publisher Kenney Nature Kit ZIP')
    parser.add_argument('--root', type=Path, default=ROOT, help='The app folder containing library/objects')
    parser.add_argument('--apply', action='store_true', help='Publish corrected models and replace their catalogue entries')
    args = parser.parse_args()
    print(json.dumps(correct(args.archive, args.root, args.apply), indent=2))


if __name__ == '__main__':
    main()
