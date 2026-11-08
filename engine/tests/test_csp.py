"""CSP detection and explicitly requested installation preserve existing game/user files."""
import io
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest import mock
import urllib.request
import urllib.error
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: E402,F401
import server  # noqa: E402
from app import csp, system  # noqa: E402


def archive(extra=()):
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as z:
        for name, raw in [("dwrite.dll", b"MZpublic patch"),
                          ("extension/config/data_manifest.ini", b"[VERSION]\nSHADERS_PATCH=0.2.11\nSHADERS_PATCH_BUILD=3465\n"),
                          ("extension/config/general.ini", b"[BASIC]\nENABLED=1\n"), *extra]:
            z.writestr(name, raw)
    return output.getvalue()


class CspTest(unittest.TestCase):
    def test_offline_install_explains_connection_problem(self):
        csp._job["path"] = str(self.ac.resolve())
        with mock.patch.object(csp, "_open", side_effect=urllib.error.URLError("getaddrinfo failed")):
            csp._install(str(self.ac))
        info = csp.status(str(self.ac))
        self.assertEqual("error", info["stage"])
        self.assertIn("connection", info["error"])
        self.assertNotIn("getaddrinfo", info["error"])

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.ac = Path(self.tmp.name, "Assetto Corsa")
        (self.ac / "content/tracks").mkdir(parents=True)
        (self.ac / "acs.exe").write_bytes(b"game")
        self.zip = Path(self.tmp.name, "patch.zip")
        self.zip.write_bytes(archive())
        self.docs = Path(self.tmp.name, "Documents")
        patch = mock.patch.object(system, "documents", return_value=str(self.docs))
        patch.start()
        self.addCleanup(patch.stop)
        patch = mock.patch.object(csp, "_job", {"path": None, "stage": "idle", "done": 0, "total": 0, "error": None})
        patch.start()
        self.addCleanup(patch.stop)
        patch = mock.patch.object(system, "running", return_value=False)
        patch.start()
        self.addCleanup(patch.stop)

    def test_detects_missing_installed_and_disabled_without_a_network_request(self):
        self.assertEqual("missing", csp.inspect(self.ac)["status"])
        csp.install_archive(self.ac, self.zip, "0.2.11")
        info = csp.inspect(self.ac)
        self.assertEqual("installed", info["status"])
        self.assertEqual("0.2.11", info["version"])
        self.assertEqual(3465, info["build"])
        user = self.docs / "Assetto Corsa/cfg/extension/general.ini"
        user.parent.mkdir(parents=True)
        user.write_text("[BASIC]\nENABLED=0 ; keep my setting\n")
        self.assertFalse(csp.inspect(self.ac)["enabled"])

    def test_an_unknown_existing_loader_is_never_overwritten(self):
        loader = self.ac / "dwrite.dll"
        loader.write_bytes(b"a different mod")
        self.assertEqual("partial", csp.inspect(self.ac)["status"])
        with self.assertRaisesRegex(ValueError, "(?i)existing|already"):
            csp.install_archive(self.ac, self.zip, "0.2.11")
        self.assertEqual(b"a different mod", loader.read_bytes())

    def test_existing_csp_and_a_running_game_are_refused(self):
        with mock.patch.object(system, "running", return_value=True):
            with self.assertRaisesRegex(ValueError, "Close Assetto Corsa"):
                csp.install_archive(self.ac, self.zip, "0.2.11")
        csp.install_archive(self.ac, self.zip, "0.2.11")
        with self.assertRaisesRegex(ValueError, "existing|already"):
            csp.install_archive(self.ac, self.zip, "0.2.11")

    def test_install_preserves_tracks_unrelated_extension_files_and_user_settings(self):
        track = self.ac / "content/tracks/own.kn5"
        track.write_bytes(b"my track")
        own = self.ac / "extension/config/tracks/own.ini"
        own.parent.mkdir(parents=True)
        own.write_bytes(b"my config")
        user = self.docs / "Assetto Corsa/cfg/extension/general.ini"
        user.parent.mkdir(parents=True)
        user.write_bytes(b"[BASIC]\nENABLED=0\n")
        csp.install_archive(self.ac, self.zip, "0.2.11")
        self.assertEqual(b"my track", track.read_bytes())
        self.assertEqual(b"my config", own.read_bytes())
        self.assertEqual(b"[BASIC]\nENABLED=0\n", user.read_bytes())

    def test_archive_must_match_the_requested_public_version(self):
        with self.assertRaisesRegex(ValueError, "version"):
            csp.install_archive(self.ac, self.zip, "0.3.0")
        self.assertFalse((self.ac / "dwrite.dll").exists())

    def test_unsafe_paths_and_case_collisions_are_refused_before_writing(self):
        for name in ("../outside", "extension/../../outside", "C:/outside", "extension/data:stream", "DWRITE.dll", "acs.exe"):
            with self.subTest(name=name):
                self.zip.write_bytes(archive([(name, b"bad")]))
                with self.assertRaises(ValueError):
                    csp.install_archive(self.ac, self.zip, "0.2.11")
                self.assertFalse((self.ac / "dwrite.dll").exists())
                self.assertEqual(b"game", (self.ac / "acs.exe").read_bytes())

    def test_failed_install_rolls_back_files_and_does_not_activate_a_partial_patch(self):
        old = self.ac / "extension/config/general.ini"
        old.parent.mkdir(parents=True)
        old.write_bytes(b"old defaults")
        replace = csp.os.replace
        def fail_loader(source, target):
            if Path(target) == self.ac / "dwrite.dll":
                raise OSError("simulated disk error")
            return replace(source, target)
        with mock.patch.object(csp.os, "replace", side_effect=fail_loader):
            with self.assertRaises(OSError):
                csp.install_archive(self.ac, self.zip, "0.2.11")
        self.assertEqual(b"old defaults", old.read_bytes())
        self.assertFalse((self.ac / "dwrite.dll").exists())
        self.assertFalse((self.ac / "extension/config/data_manifest.ini").exists())

    def test_recommended_release_is_selected_from_the_official_download_link(self):
        html = '<a href="?get=0.3.0">v0.3.0 (latest version)</a><a href="?get=0.2.11">v0.2.11 (recommended version)</a>'
        self.assertEqual("0.2.11", csp.recommended_version(html))
        with self.assertRaises(ValueError):
            csp.recommended_version('<a href="https://other.invalid/patch.zip">recommended version</a>')

    def test_official_download_worker_installs_without_requiring_an_installed_log(self):
        page = b'<a href="?get=0.2.11">v0.2.11 (recommended version)</a>'
        html, package = io.BytesIO(page), io.BytesIO(archive())
        package.headers = {}
        with mock.patch.object(csp, "_open", side_effect=[html, package]) as opening:
            csp._install(str(self.ac))
        self.assertEqual("done", csp._job["stage"])
        self.assertEqual("0.2.11", csp.inspect(self.ac)["version"])
        self.assertEqual([mock.call(csp.PAGE), mock.call(csp.PAGE + "?get=0.2.11")], opening.call_args_list)
        self.assertFalse((self.ac / "extension/installed.log").exists())

    def test_a_truncated_download_reports_failure_without_changing_game_files(self):
        html = io.BytesIO(b'<a href="?get=0.2.11">v0.2.11 (recommended version)</a>')
        package = io.BytesIO(b"partial zip")
        package.headers = {"Content-Length": "1000"}
        with mock.patch.object(csp, "_open", side_effect=[html, package]):
            csp._install(str(self.ac))
        self.assertEqual("error", csp._job["stage"])
        self.assertIn("ended early", csp._job["error"])
        self.assertFalse((self.ac / "dwrite.dll").exists())

    def test_incomplete_rollback_retains_recovery_copies(self):
        old = self.ac / "extension/config/general.ini"
        old.parent.mkdir(parents=True)
        old.write_bytes(b"old defaults")
        replace = csp.os.replace
        def fail(source, target):
            if Path(target) == self.ac / "dwrite.dll" or "backup" in Path(source).parts:
                raise OSError("simulated locked file")
            return replace(source, target)
        with mock.patch.object(csp.os, "replace", side_effect=fail):
            with self.assertRaises(csp.RecoveryNeeded):
                csp.install_archive(self.ac, self.zip, "0.2.11")
        recovery = list(self.ac.glob(".map2lap-csp-*/backup/extension/config/general.ini"))
        self.assertEqual(1, len(recovery))
        self.assertEqual(b"old defaults", recovery[0].read_bytes())
        self.assertFalse((self.ac / "dwrite.dll").exists())

    def test_starting_ac_during_staging_refuses_activation(self):
        with mock.patch.object(system, "running", side_effect=[False, False, True]):
            with self.assertRaisesRegex(ValueError, "Close Assetto Corsa"):
                csp.install_archive(self.ac, self.zip, "0.2.11")
        self.assertFalse((self.ac / "extension/config/data_manifest.ini").exists())

    def test_linux_play_adds_the_loader_only_to_the_launched_process(self):
        csp.install_archive(self.ac, self.zip, "0.2.11")
        with mock.patch.object(system, "WIN", False), mock.patch.object(system, "proton", return_value="/proton/proton"), \
             mock.patch.object(system, "runtime", return_value=None), mock.patch.object(system, "steam_roots", return_value=["/steam"]), \
             mock.patch.object(system, "steam_libraries", return_value=[]), mock.patch.object(system, "_detached") as launch, \
             mock.patch.dict(system.os.environ, {"WINEDLLOVERRIDES": "dxgi=n,b"}):
            system.start_ac(str(self.ac))
            self.assertEqual("dxgi=n,b;dwrite=n,b", launch.call_args.kwargs["env"]["WINEDLLOVERRIDES"])
            self.assertEqual("dxgi=n,b", system.os.environ["WINEDLLOVERRIDES"])

    def test_http_installer_requires_same_page_and_the_current_folder(self):
        http = server.Server(("127.0.0.1", 0), server.Handler)
        thread = threading.Thread(target=http.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(http.server_close)
        self.addCleanup(http.shutdown)
        url = f"http://127.0.0.1:{http.server_port}/api/csp/install"
        def request(body, content_type="application/json"):
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": content_type})
            try:
                with urllib.request.urlopen(req) as result:
                    return result.status, json.load(result)
            except urllib.error.HTTPError as error:
                return error.code, json.load(error)
        with mock.patch.object(server.settings, "ac_path", return_value=str(self.ac)), \
             mock.patch.object(csp, "start", return_value={"stage": "checking"}) as start:
            self.assertEqual(403, request({"path": str(self.ac)}, "text/plain")[0])
            self.assertEqual(409, request({"path": "a different folder"})[0])
            start.assert_not_called()
            self.assertEqual(202, request({"path": str(self.ac)})[0])
            start.assert_called_once_with(str(self.ac))

    def test_play_rechecks_installation_after_waiting_for_steam(self):
        track = self.ac / "content/tracks/one/one.kn5"
        track.parent.mkdir()
        track.write_bytes(b"track")
        race = Path(self.tmp.name, "race.ini")
        race.write_text("[RACE]\nMODEL=car\n")
        with mock.patch.object(server.settings, "ac_path", return_value=str(self.ac)), \
             mock.patch.object(csp, "busy", side_effect=[False, True]), \
             mock.patch.object(system, "ensure_steam", return_value=True), \
             mock.patch.object(server, "race_ini", return_value=str(race)), \
             mock.patch.object(server, "play_car", return_value=(None, None)), \
             mock.patch.object(system, "start_ac") as launch:
            self.assertEqual(409, server.play("one")[0])
            launch.assert_not_called()

    def test_proton_loader_override_preserves_other_libraries_and_explicit_user_choices(self):
        self.assertEqual("dxgi=n,b;dwrite=n,b", csp.proton_overrides("dxgi=n,b"))
        self.assertEqual("dwrite=b;dxgi=n", csp.proton_overrides("dwrite=b;dxgi=n"))
        self.assertEqual("dwrite=n,b", csp.proton_overrides(""))


if __name__ == "__main__":
    unittest.main()
