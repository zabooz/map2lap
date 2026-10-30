"""Download the CC0 textures from ambientCG that the generator uses (facades, walls, roofs ...) into assets/textures.

    .venv\\Scripts\\python.exe tools\\get_textures.py

Only the colour map of each is kept (<Name>_2K-JPG_Color.jpg). Textures by ambientCG (https://ambientcg.com), CC0 1.0.
The release zip already contains them.
"""
import io
import os
import sys
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "src"))
from app import version  # noqa: E402

DEST = os.path.join(HERE, "assets", "textures")
TEXTURES = ("Asphalt031", "Bricks108A", "Concrete034", "Grass005", "Gravel043", "Ground037", "PaintedPlaster017",
            "PavingStones151", "Plaster001", "RoofingTiles013A")
URL = "https://ambientcg.com/get?file={}_2K-JPG.zip"


def have(name):
    folder = os.path.join(DEST, name)
    return os.path.isdir(folder) and any(f.endswith("_Color.jpg") for f in os.listdir(folder))


def main():
    for name in TEXTURES:
        if have(name):
            print(f"{name}: already there")
            continue
        print(f"{name}: downloading ...", flush=True)
        req = urllib.request.Request(URL.format(name), headers={"User-Agent": version.USER_AGENT})
        with urllib.request.urlopen(req, timeout=300) as r:
            data = r.read()
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            member = next(n for n in z.namelist() if n.endswith("_Color.jpg"))
            os.makedirs(os.path.join(DEST, name), exist_ok=True)
            with z.open(member) as src, open(os.path.join(DEST, name, os.path.basename(member)), "wb") as dst:
                dst.write(src.read())
    print("Textures complete.")


if __name__ == "__main__":
    main()
