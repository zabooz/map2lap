# Test tracks for driving

Short routes (named "... Test"), each built around one spot worth driving in AC after a change to the driving
surface: a junction, a bridge end. A few hundred metres, so a build takes a minute and the spot comes right after the
start.

Build one into AC either way:
- generator page → New track → paste the track code into the code field;
- command line, with the pins and width below (the same inputs as the code):

```powershell
.venv\Scripts\python.exe src\generator.py --name <name> --title "<title>" --width <width> <pin> <pin> ...
.venv\Scripts\python.exe tools\measure.py <name>          # the driving line, per metre over 0.5 G at 100 km/h
```

The pins lie along the route (not only at its ends), so OSRM routes it the same way again. Route metres are the Track
Debug app's count, the same as `measure.py` and `check_drive.py`. The values are `measure.py`'s, at 100 km/h: hints;
the drive in AC decides.

## Stausee Kreuzung Test

Stausee near Völkermarkt (Carinthia): a narrow tertiary road down to a junction, a 21 m connector, then a second
junction where a trunk goes on as a primary and the route turns onto the primary. Checks how roads of different
widths meet at a junction (`grading.py`: `BESIDE_*`, `YIELD_*`, `snap_junctions`).

- name `stausee_kreuzung_test`, width 120, 320 m
- pins `46.6573263,14.6324524 46.6563103,14.6328449 46.6555697,14.6333813 46.6548753,14.6326255`
- code (track version 0.5.0):

```
M2L1-eNo1yjsKwzAQRdGtmKnFIM1PQltwmXRGRQqRLoRYssEhe4_Bdvc4735hgQweFT04aPu-tUefax3GT-1bfz2He53b_r0hT5MYmkYmc0HQmESpuEONw4lJ9ELVeCBzChdKinqmRlqKgxVyII_-9wdLHCKw
```

| Route m | What | Now |
|---|---|---|
| 149–154 | a dip just before the first junction | up to 2.9 G (open) |
| 155–159 | the connector between the junctions, 5–8 m from the second: the junction's roads meet at one height (no hump) | up to 0.8 G |
| 160–175 | the turn onto the primary | under 0.5 G |

Drive it at about 40 km/h, the speed of the turn.

## Rechberg Test

Eisenkappel-Vellach (Rechberg, Carinthia): two short bridges close together on a narrow road, a 28 m one and a 35 m
one, with driveways along the road. Checks bridge ends (decks onto the ground) and narrow roads beside wider ones
(`grading.py`: `BESIDE_*`).

- name `rechberg_test`, width 120, 460 m
- pins `46.5211061,14.576363 46.5206611,14.5764457 46.520236,14.5766576 46.5198091,14.5768601 46.518404,14.576919
  46.5180977,14.5772496 46.5180282,14.5777683 46.5175784,14.5777649`
- code (track version 0.5.0):

```
M2L1-eNpFzLsKwzAMheFXKZqNkWxJvjxG6Ra8NJh0LG1oh5J3ryF2sh0-fs4PPpABrVgEA2vb1zo_7vW1XG71vTZ7Qp4mViuOCNUQWwnq1RezK6pSV2Y91PnRqsSulCKmrnGkFBm5Y6J0KKa4a3ByohvYHoYGCadKKQa-kMmhxe0Pnm8yaA
```

| Route m | What | Now |
|---|---|---|
| 78–112 | the first bridge, a driveway joining 2.5 m before it: onto its deck and off, level across | under 0.5 G; onto 0.07 G, off 0.10 G |
| 357–403 | the second bridge and the ground after its end | up to 5.6 G off the deck at 388–401 (open) |

## Friedensbruecke Test

Graz: a short bridge, then the Friedensbrücke over the Mur with the Grieskai tunnel under its west end. Checks bridge
ends in town and a tunnel under a deck (`grading.py`: `BESIDE_*`, `Plan.tunnel`).

- name `friedensbruecke_test`, width 120, 360 m
- pins `47.0572857,15.4319079 47.0573474,15.4330863 47.0575035,15.4342466 47.0576492,15.4354118 47.0578019,15.4365751`
- code (track version 0.5.0):

```
M2L1-eNo9y0EKAjEMheGrSNYlpGnSdnoAT-Bu6EbNQgSRmXFciHe3UOnu8T3-D-xQgFCRwMHW9nG52dUe63l52eVuh5OtW7ueUOZZEpImztF5RQl-olzdX4OkroFyHKokXYUlDY0ydVXxPDQTd42tq9XBG4pnQvr-AJHtJ3g
```

| Route m | What | Now |
|---|---|---|
| 29–46 | the short bridge: onto its deck and off | onto 0.22 G, off 0.11 G |
| 217–313 | the Friedensbrücke, the Grieskai tunnel under its west end | up to 1.4 G at its east end (310–314) |
