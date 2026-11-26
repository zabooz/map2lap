"""Install or remove Map2Lap's native race plugin in a closed Assetto Corsa installation."""
import argparse
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from app import acplugin, settings


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('install', 'remove'))
    parser.add_argument('--ac', type=Path, help='AC installation (defaults to the one selected by Map2Lap)')
    args = parser.parse_args()
    ac = args.ac or settings.ac_path()
    if not ac or not (Path(ac) / 'acs.exe').is_file():
        parser.exit(1, 'Choose an Assetto Corsa installation with --ac.\n')
    change = acplugin.install if args.action == 'install' else acplugin.remove
    if not change(ac):
        parser.exit(1, 'Close Assetto Corsa first.\n')
    print(f'{args.action} completed in {Path(ac) / "plugins"}')
