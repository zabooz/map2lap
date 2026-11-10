"""Editing a draft with imported models does no pixel work, builds them once and answers for the state it saved."""
from dataclasses import replace
import io
from pathlib import Path
import shutil
import unittest
from unittest import mock

import numpy as np
from PIL import Image

from test_modeldata import encode, fixture
from test_trackcopy import Base
from app import modeldata, modelmesh, objectlibrary, trackcopy, trackedits, trackinspect, trackmodels, trackview
from track import kn5

LIGHT = {"ksAmbient": .42, "ksDiffuse": .36}


class Interrupting:
    """The save lock, and another save the moment it is first let go: what a second request does between the two."""

    def __init__(self, lock, then):
        self.lock, self.then = lock, then

    def __enter__(self):
        return self.lock.__enter__()

    def __exit__(self, *problem):
        self.lock.__exit__(*problem)
        then, self.then = self.then, None
        if then:
            then()


def png(size, colour=(200, 40, 40, 255)):
    """An image's PNG bytes. Pure."""
    out = io.BytesIO()
    Image.new("RGBA", size, colour).save(out, "PNG")
    return out.getvalue()


class ModelEditingTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)

    def asset(self, roughness=.9):
        document, binary = fixture()
        document["materials"][0]["pbrMetallicRoughness"]["baseColorFactor"] = [1, roughness, 1, 1]
        prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        return objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]["id"]

    def placed(self, asset, at=(20, 0, 5), name=None):
        name = name or self.name
        now = trackedits.load(self.ac, name)
        return trackedits.model(self.ac, name, {"base": now["base"], "revision": now["revision"], "model": asset,
                                                "at": list(at), "collision": "none"})["model"]

    def keep(self, models, placed=(), name=None):
        name = name or self.name
        now = trackedits.load(self.ac, name)
        return trackedits.save_telling(self.ac, name, {"base": now["base"], "revision": now["revision"], "id": "models",
                                                       "deleted": [], "models": models, "placed": list(placed)})

    def test_a_save_builds_the_models_once_and_leaves_them_ready_for_the_index(self):
        model = self.placed(self.asset())
        with mock.patch.object(trackmodels, "extend", wraps=trackmodels.extend) as built:
            self.assertEqual([-2], self.keep([model])["meshes"])
            self.assertEqual(1, built.call_count)
            self.assertEqual([model], trackview.index(self.ac, self.name)["models"])
            self.assertEqual(1, built.call_count, "The saved state is the one the index reads")

    def test_a_save_answers_for_its_own_state_when_the_next_save_has_already_replaced_it(self):
        asset = self.asset()
        first, second = self.placed(asset), self.placed(asset, (30, 0, 5))
        self.keep([first, second])
        numbers = sorted(m["i"] for m in trackview.index(self.ac, self.name)["meshes"] if m.get("model", {}).get("instance") == second["id"])
        pose = {"id": second["id"] + "#0", "x": 1, "y": 0, "z": 0, "turn": 0, "scale": 1}
        with mock.patch.object(trackedits, "_saving", Interrupting(trackedits._saving, lambda: self.keep([second], [pose]))):
            answer = self.keep([first, second], [pose])
        self.assertEqual(numbers, answer["meshes"], "The first model's meshes are gone only in the next save's state")

    def test_editing_renders_no_model_pixels(self):
        model = self.placed(self.asset())
        with mock.patch.object(modelmesh.Image, "fromarray", side_effect=AssertionError("model pixels while editing")):
            self.keep([model])
            index = trackview.index(self.ac, self.name)
            sizes = trackinspect.statistics(self.ac, self.name)
        self.assertTrue(any(t["name"].startswith("map2lap_model_") and t["size"] > 0 for t in index["textures"]))
        self.assertGreater(sizes["draft_bytes"], sizes["current_bytes"])

    def test_the_inspector_shows_a_draft_models_texture(self):
        self.keep([self.placed(self.asset())])
        index = trackview.index(self.ac, self.name)
        number = next(i for i, t in enumerate(index["textures"]) if t["name"].startswith("map2lap_model_"))
        with Image.open(io.BytesIO(trackinspect.thumbnail(self.ac, self.name, number, index["revision"]))) as image:
            self.assertEqual((4, 4), image.size)
            np.testing.assert_allclose(image.convert("RGBA").getpixel((0, 0)), (30, 133, 40, 120), atol=2)

    def asset_of(self, category):
        document, binary = fixture()
        prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        return objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": category, "category": category})["model"]["id"]

    def test_every_import_category_can_be_placed(self):
        for category, kind in (("tree", "tree"), ("bush", "bush"), ("grass", "model"), ("rock", "model"), ("building", "house"), ("prop", "model")):
            with self.subTest(category=category):
                model = self.placed(self.asset_of(category))
                self.keep([model])
                self.assertEqual([kind], trackview.index(self.ac, self.name)["objects"][model["id"]]["kinds"])

    def test_models_take_the_light_of_the_tracks_own_plants_and_objects(self):
        from track import obj_to_kn5
        for category, values in (("bush", obj_to_kn5.VALUES["trees"]), ("prop", obj_to_kn5.DEFAULT)):
            with self.subTest(category=category):
                self.keep([self.placed(self.asset_of(category))])
                material = next(m for m in trackview.index(self.ac, self.name)["materials"] if m["name"].startswith("m2l_model_"))
                self.assertAlmostEqual(values["ksAmbient"], material["ambient"])
                self.assertAlmostEqual(values["ksDiffuse"], material["diffuse"])

    def test_the_index_says_what_a_model_meshs_vertices_are_made_from(self):
        model = {**self.placed(self.asset()), "scale": 2}
        self.keep([model])
        mesh = next(m for m in trackview.index(self.ac, self.name)["meshes"] if m.get("model"))
        self.assertEqual((model["at"], 2), (mesh["model"]["at"], mesh["model"]["scale"]))

    def test_a_recipe_names_its_pixels_without_making_them(self):
        document, binary = fixture()
        document["materials"].append({**document["materials"][0]})
        document["materials"].append({**document["materials"][0], "pbrMetallicRoughness": {
            **document["materials"][0]["pbrMetallicRoughness"], "baseColorFactor": [1, .5, 1, 1]}})
        model = replace(modeldata.load(encode(document, binary)), images=(png((4, 4)),))
        native, recipes = modelmesh.materials(model, "a" * 64, LIGHT)
        names = [next(n for slot, _number, n in material.maps if slot == "txDiffuse") for material in native]
        self.assertEqual(names[0], names[1], "One image and factor is one texture")
        self.assertNotEqual(names[0], names[2])
        self.assertEqual(set(names), set(recipes))
        again = replace(model, images=(png((4, 4), (1, 2, 3, 255)),))
        self.assertFalse(set(names) & set(modelmesh.materials(again, "b" * 64, LIGHT)[1]))
        self.assertEqual(set(names), set(modelmesh.materials(model, "b" * 64, LIGHT)[1]), "Assets sharing an image share its texture")

    def test_a_recipe_renders_a_preview_at_a_limited_size(self):
        document, binary = fixture()
        model = replace(modeldata.load(encode(document, binary)), images=(png((64, 32)),))
        _native, recipes = modelmesh.materials(model, "a" * 64, LIGHT)
        recipe = next(iter(recipes.values()))
        with Image.open(io.BytesIO(modelmesh.image(model, recipe))) as full, Image.open(io.BytesIO(modelmesh.image(model, recipe, 16))) as small:
            self.assertEqual((64, 32), full.size)
            self.assertEqual((16, 8), small.size)
            self.assertEqual(full.convert("RGBA").getpixel((0, 0)), small.convert("RGBA").getpixel((0, 0)))

    def test_a_cold_track_keeps_its_saved_image_and_a_new_model_brings_its_own(self):
        first = self.placed(self.asset())
        self.keep([first]); trackcopy.save(self.ac, self.name, "cold_one", "Cold one")
        before = self.model_textures("cold_one")
        self.assertEqual(1, len(before))
        for relative in ("cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        again = {**first, "id": "instance_" + "a" * 24, "at": [30, 0, 5]}
        other = self.placed(self.asset(.5), (40, 0, 5), "cold_one")
        self.keep([first, again, other], name="cold_one"); trackcopy.save(self.ac, "cold_one", "cold_two", "Cold two")
        native = kn5.read(str(Path(self.ac, "content/tracks/cold_two/cold_two.kn5")))
        maps = {next(n for slot, _number, n in m.maps if slot == "txDiffuse") for m in native["materials"] if m.name.startswith("m2l_model_")}
        self.assertEqual(self.model_textures("cold_two"), maps, "Every image is used by a material, every material finds its image")
        self.assertEqual(2, len(maps))
        self.assertLessEqual(before, maps)
        for relative in ("cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        trackcopy.save(self.ac, "cold_two", "cold_three", "Cold three")
        self.assertEqual(maps, self.model_textures("cold_three"), "Saving again adds no image")

    def model_textures(self, name):
        native = kn5.read(str(Path(self.ac, "content/tracks", name, name + ".kn5")))
        return {n for n, _active, _raw in native["textures"] if n.startswith("map2lap_model_")}


if __name__ == "__main__": unittest.main()
