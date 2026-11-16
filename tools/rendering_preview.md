# Rendering comparisons

Use `rendering_gallery.py` to build labelled spruce/broadleaf comparisons, ground swatches and grey cards. `BASELINE`
is the current generator; `LEGACY` retains brightness/specular/reflectivity/subscattering at 1. The other columns change
one input. Their model and texture names isolate CSP caches; leave the global tree cache intact.

The profile applies to generated trees and bushes in every climate and season. Imported models are outside it. When
testing new shading, include both needle and leaf crowns, then verify an evergreen and a deciduous tree in winter.

## Build and run

Check that no Map2Lap Build/Worker is running before changing build inputs. Close AC before installing the gallery.
Enable Map2Lap's **Track Debug app** in Settings once; the preview temporarily appends its app-only camera bridge to
the installed copy and restores it afterward. Steam and AC/CSP must already work normally.

`<python>` is `.venv\Scripts\python.exe` on Windows or `.venv/bin/python` on Linux. `<AC>` is the existing installation.

```text
<python> tools/rendering_gallery.py --ac-root "<AC>"
<python> tools/rendering_preview.py start --ac-root "<AC>" --fixed 0.28
<python> tools/rendering_preview.py capture spruce_before --variant LEGACY
<python> tools/rendering_preview.py capture spruce_after --variant BASELINE
<python> tools/rendering_preview.py capture leaves_after --species broadleaf --variant BASELINE
<python> tools/rendering_preview.py stop
```

The launcher uses `app.system.start_ac`, including the existing Proton and Steam runtime on Linux. It retains the
selected car, sets clear weather, sun angle -32 and zero wind, and uses a 1600×900 window. `--fixed` uses a temporary
copy of the default PP filter with auto exposure disabled; omit it to compare the user's current filter/auto exposure.
The camera exposure multiplier is always 1. Weather implementations and filters still affect the result: record them
from the CSP log instead of treating an sRGB screenshot pixel as a direct albedo measurement.

Gallery positions come from `data/gallery.json`; rebuilding the columns does not invalidate named camera commands.
For another view, use AC coordinates and a direction, for example:

```text
<python> tools/rendering_preview.py capture grey --position 0 9 35 --direction 0 -0.25 -1 --fov 50
```

Each screenshot comes from `ac.makeSimpleScreenshot`, with a two-second settle time, without desktop focus or input
automation. The PNG, camera/session JSON and CSP log are saved together under ignored `out/rendering-preview/<session>/`.
Use a new screenshot name for every capture. Inspect the actual image and log; a stale desktop window can survive a
CSP crash and is not evidence of a successful comparison. Unit tests check export/settings invariants, not appearance.

## Recovery

```text
<python> tools/rendering_preview.py status
<python> tools/rendering_preview.py stop
# If AC crashed or the launcher was interrupted: close that AC process, then:
<python> tools/rendering_preview.py restore
```

The launcher exits after AC is ready; cleanup does not depend on keeping a terminal process alive. Before any writes,
it stores original bytes and hashes for race/video/free-camera/exposure settings and Track Debug, plus the temporary
filter receipt. `stop` exits only its recorded session, then restores. `restore` refuses while any AC is running and
preserves independently edited files, listing conflicts instead of overwriting them. Backups survive restoration.
AC saving the probe's exposure value 1 on exit is recognized as part of the session. Only one preview may own AC at a
time, including across worktrees and the weather preview. Do not edit those same files during a comparison.

## Inspect executed shaders

On Linux/DXVK, `start --dump-shaders` also collects the actual `.dxbc` and `.spv` files used in that run. This records
compiled code, not CSP's unavailable HLSL sources. Use `spirv-dis <file.spv> -o <file.spvasm>` for SPIR-V. The small native
C helper `rendering_disassemble.c` calls `D3DDisassemble` and writes `<input>.asm` for each DXBC argument. Build it with
a Windows-targeting C compiler and `d3dcompiler` (for example `clang rendering_disassemble.c -ld3dcompiler -o reader.exe`
inside a Windows compiler environment); run it on Windows or the existing Proton setup, without creating another Wine
prefix or installing .NET. Do not commit shader dumps or locally built readers.

The 0.2.11 diffuse-gain finding can be checked in the model pixel shader: find the `txDiffuse` sample, the brightness
multiply, then the RGB addition to itself followed by `log`, multiplication by 2.2 and `exp`. The model vertex shader
also emits height-dependent inputs and combines baked AO with per-instance occlusion. These are different mechanisms;
disabling a single highlight term is not proof that it controls the upper-crown gradient.
