"""The rules' numbers and switches."""
import logging
import math
import os

import roads as roadsmod


log = logging.getLogger("earthd.grading")
VERSION = 2
PROFILE_STEP = 2.0          # m between profile samples
SIGMA_M = 12.0              # m, profile smoothing of built roads
# ... and of motorways and trunks: real ones keep long, gentle grades, and 12 m kept every bump of the elevation data in
# them where it is a 30 m surface model (BR-381 in Brazil: a junction's pad, forest edges; 20 % grades between them, a
# flat bench halfway down a long descent). Lidar areas change little: their roads are smooth already.
SIGMA_MAJOR_M = float(os.environ.get("BNE_GRADE_MAJOR", "40"))
# (and primary roads: one through Russian forest kept every 1-3 m bump of GLO-30 over 50-100 m at 12 m, a road of hills
# and walls on flat land. Not secondary yet: Otto Road's junction with I-80's ramps came out 0.29 m apart
# once its dip under I-80 (underpass_offsets) was laid on the longer smoothing; the ramps' pins need a look first)
MAJOR_CLASSES = ("motorway", "trunk", "primary")      # (not their slip roads: Overture's subclass "link", Spec.link)
DIRT_SIGMA_M = 8.0          # m, profile smoothing of gravel / dirt roads (5 followed the DEM's bumps)
# longer smoothing for the mid classes too (mpsteppe's: real roads have long vertical curves, the larger the
# longer; 12 m left bumps the roads do not have); MAJOR_CLASSES keep SIGMA_MAJOR_M
CLASS_SIGMA_M = {"secondary": 25.0, "tertiary": 20.0, "unclassified": 16.0, "residential": 14.0}
# A running median before the smoothing (median_profile): a bridge deck left in the elevation data where it crosses
# over a road is a spike a few samples wide, and the Gaussian spread it into a hump in the road under (an
# 8.5 m spike near Thetford: a 3.2 m hump). Slopes, crests and steps longer than the window stay.
MEDIAN_M = float(os.environ.get("BNE_GRADE_MEDIAN", "24"))
DIRT_MEDIAN_M = 10.0        # (tracks keep their small real bumps)
RAIL_GRADE_ON = os.environ.get("BNE_RAIL_GRADE", "1") != "0"    # the ground laid to the railways' bed (railways.py)
RAIL_TAG = "rail:"
SHOULDER_M = 1.0            # m of flat shoulder beyond the carriageway, each side
SIDEWALK_MARGIN_M = 0.5     # m of flat ground beyond a sidewalk (roads.SIDEWALK_CLASSES)
LONG_PART_M = 3000.0        # a road part longer than this is planned per cell, only within CLIP_MARGIN_M of the cell
CLIP_MARGIN_M = 400.0
PLAN_THREADS = 4            # cells planned at once (_plan_missing)
PLAN_SETS_MAX = 16          # cell sets whose merged plans are kept (Grader._plan_set; ~1 MB each in a town)
SPREAD_CELLS = 16           # plans(): more map cells in the points' bbox: only the cells around the points
T_MIN, T_MAX = 5.0, 12.0    # m, transition back to the natural ground (5: roads close together meet gently)
SLOPE_RUN = 2.0             # transition = SLOPE_RUN x the height difference (1:2 slope)
VERTEX_STEP = 4.0           # m between the plan's vertices (segments for the grading pass; linear between: at 16 m a
                            # crest or a sag was a kink every 16 m, 'bumpy roads, worst uphill and at speed' on r/BeamNG,
                            # 2026-10-17: a San Francisco street's slope changed 4.4 % rms per 2 m, 1.2 % at 4 m;
                            # grading a 1 km block 0.06 -> 0.14 s)
BUCKET = 32.0               # m, query-point buckets
ROAD_LIFT = 0.04            # m the physics ground is raised under roads (see Grader.apply)
BLEND_R = 4.0               # m: roads near each other blend their targets by 1 / (1 + (d / BLEND_R)^2)
PROFILE_ZOOM = int(os.environ.get("BNE_DEM_ZOOM", "16"))   # DEM zoom of the profiles (one zoom for every caller)
WALL_CUT_M = 2.0            # a road cut deeper than this into the ground: a retaining wall at the core's edge
WALL_T_M = 0.8              # (roadmesh.retaining_walls) and the ground at its natural height right behind it, over
                            # this; on a 1:2 slope Central Park's sunken transverse was a grassy ditch between its
                            # stone walls
WALL_FLAT_M = 2.0           # ... after one terrain grid step at the road's level behind the wall: rising at the wall
                            # itself, the 2 m grid's triangles stood as dark wedges in front of its face; the wall's
                            # top (roadmesh.WALL_THICK_M) covers the strip
TUNNEL_TAG = ":tun"          # in the fid of the tunnels' own plans (open sections, mouths): apply(roads_only) skips them
MOUTH_PLAN_M = 4.0          # m into a tunnel from a portal its floor is a grading plan too (Grader._mouth_plans)
TUNNEL_KEEP_IN_M = 3.0      # (roads.LOW_HOLE_M: a low arch's mouths, flat at its floor)
TUNNEL_KEEP_M = 5.0         # m beside a covered tunnel's road where the ground over it is left ungraded ...
OVER_TUNNEL_SMALL_M = 0.5   # ... but for a change smaller than this (a road crossing over it, graded flush)
WALL_AHEAD_M = 2.5          # ... only beside a segment or this little past its end (a joint between two: VERTEX_STEP)
# Roads at other heights beside a road's core (a street in a cutting had its half under a service road on
# the bank 7.5 m above it pulled 2-4 m up its slope; hairpins blended into each other; an upper road's edge dragged into
# a pit by the road under it). Beside a point in a core, another road's segments outside their own core count less the
# further their height is from that core's: not at all from SEP_FULL_M, as before up to SEP_FROM_M, and their weight
# comes back over CORE_FADE_M past the core (no step at its edge).
SEP_ON = os.environ.get("BNE_GRADE_SEP", "on") != "off"
# Sharp cuttings (the elevation data is smoothed, "sharper terrain features get lost": a street in
# a walled cutting read as a 4 m slope its asphalt climbed, McGraw-Graben, Munich). Beside a built road whose ground
# rises SHARP_MIN_M or more within SHARP_REACH_M of its core at SHARP_GRADE or steeper on average (a wall the data
# smoothed into a ramp), the ground is raised to that top from the core's edge out: the road's wall rule (WALL_CUT_M)
# then flattens a strip, steps up and roads.retaining_walls stands a wall there.
SHARP_ON = os.environ.get("BNE_SHARP", "on") != "off"
SHARP_REACH_M = 10.0
SHARP_STEP_M = 1.0
SHARP_MIN_M = 2.0
SHARP_GRADE = 0.6
SHARP_RUN_N = 3             # consecutive plan vertices (VERTEX_STEP apart) a cutting holds for at least
# A cutting under this deep is a wall only in a trench (a cutting on both sides: Munich's McGraw-Graben, Central Park's
# transverses); a lone bank of a metre or two beside a road is a graded slope, as real ones are (a 1.5 m concrete wall
# stood in the flat desert beside US-163 in Utah, where there is a low eroded rock bank: Mapillary).
# Hillside roads' deeper cuttings keep their walls (WALL_MAX_H_M high at most)
SHARP_LONE_MIN_M = 4.0
SEP_FROM_M = 2.0
SEP_FULL_M = 4.0
CORE_FADE_M = 2.0
SIDE_FADE_M = 2.0           # m of (side - ahead) over which a segment counts as beside the point (ahead: its own road)
RETRY_S = 60.0              # s before a cell whose road data failed is asked for again
# Junctions: a side road's end takes the height of the road it joins (snap_junctions; mpsteppe's PR #290)
JUNCTION_SNAP_ON = os.environ.get("BNE_JUNCTION_SNAP", "1") != "0"
JUNCTION_RANK = {"motorway": 9, "trunk": 8, "primary": 7, "secondary": 6, "tertiary": 5, "unclassified": 4,
                 "residential": 3, "living_street": 2, "service": 1}
JUNCTION_REACH_M = 3.0      # m beyond the joined road's carriageway edge a side road's end still counts as joining it
JUNCTION_END_M = 10.0       # m: a same-class road ending this close to the other's end continues it (no snap)
JUNCTION_TAPER_M = 40.0     # m along the side road the height change is eased in over (half the road when shorter)
# A road's end beside another of its own class running parallel to it (within JUNCTION_PARALLEL_DEG, away from that
# one's ends) is no junction: it is the other carriageway of a divided road. Snapped to it, an approach would take the
# other carriageway's height across the median (higher or lower by the cross slope) and hump past the bridge.
JUNCTION_PARALLEL_DEG = 25.0
JUNCTION_MAX_M = 6.0        # m: a bigger difference is left as it was (bad data; Perm: 4-5 m steps where a
                            # 30 m DEM smeared an embankment into the junctions)
# Roads side by side where the elevation is only the coarse global model (dem.coarse_at: no lidar;, Perm on
# Copernicus' 30 m: service roads 7 m beside the primary stood 4-5 m over it, where Mapillary shows them at grade): a
# lower-ranked road within COARSE_REACH_M of a higher-ranked one's edge eased to its height (equal ranks halfway), less a
# COARSE_MAX_SLOPE cross slope between their edges (a real hillside keeps its fall); over COARSE_MAX_STEP_M apart they
# are taken as truly separated. Rust: earthfast.ease_coarse.
# (off by default: at Perm the trench turned out to be the underpass dip, which this does not touch; an A/B across
# coarse-elevation places comes first, BNE_COARSE_EASE=1 turns it on)
COARSE_EASE_ON = os.environ.get("BNE_COARSE_EASE", "0") == "1"
COARSE_REACH_M = 20.0
COARSE_MAX_STEP_M = 6.0
COARSE_MAX_SLOPE = 0.25
COARSE_SIGMA_M = 8.0
COARSE_SIDE_M = 12.0        # m: plan_roads' side samples on coarse elevation (the median of three)
# Overpass approach ramps (from KyzoFox's 1.5.4). A short bridge over a road had its ends on the ground on both
# sides (the DEM is too coarse for the real approach embankments), and roads.deck_profile_once caps how steeply a deck
# climbs from its ends: the deck over I-20 near Temple, GA reached ~2.5 m over the lanes (trucks hit it).
# The roads leading onto such a bridge are now graded up to the height the deck needs, over a smooth ramp, as real
# approach fills are: the bridge's ends (sampled from this graded ground) then sit high enough.
APPROACH_ON = os.environ.get("BNE_APPROACH_RAMPS", "on") != "off"
APPROACH_GRADE = float(os.environ.get("BNE_APPROACH_GRADE", "0.05"))   # steepest grade of a ramp (its middle)
APPROACH_MAX_LIFT = 10.0    # m an abutment is raised at most
APPROACH_MIN_LIFT = 0.5     # m: less is left as it is
APPROACH_MIN_RUN = 30.0     # m: the shortest ramp
APPROACH_MAX_RUN = 320.0    # m: the longest ramp
APPROACH_TOUCH_M = 2.5      # m: a road whose end is this close to an abutment leads onto the bridge ...
# ... unless that end lies on another road going on past it (junction_ends: a driveway joining the road a few metres
# before its bridge). It joins that road, not the deck: its end takes the road's height and gives way on its
# carriageway (snap_junctions, YIELD_*). Taken for an approach, its end kept its own height (a driveway coming down
# the slope 1 m under the road), ran on UNDER_DECK_M straight across the road (_under_deck) and pulled the road's near
# lane 0.2 m down just before the deck, and a car took off at the deck's start at 50 km/h.
APPROACH_MIN_CROSS_M = 6.0  # m: a road crossing a deck closer than this to its end is a junction at grade (not
                            # under it)
APPROACH_FLAT_M = 20.0      # m from an abutment the deck needs its full clearance (beyond: it may fall at DECK_GRADE)
APPROACH_MARGIN_M = 0.3     # m over the clearance (the deck profile's smoothing takes a little off near its ends)
APPROACH_SKIP = ("motorway", "trunk")   # never raised (their links are: _never_raised); the roads over them rise
WATER_LIFT_ON = os.environ.get("BNE_WATER_FILL", "on") != "off"
WATER_CURVE_M = 16.0        # m from an abutment a deck over water spends on its vertical curve before climbing ...
WATER_MAX_LIFT = 2.0        # ... and its approach fill is raised at most this (any class: a motorway's too)
OBS_HALF_M = 4.0            # m: the half width a bridge line is matched with when its abutment's lift is measured
OBS_END_M = 12.0            # m from the end the measured deck's height is taken at most (its first measured station)
APPROACH_GAP_M = 1.0        # m of flat ground kept between a ramp's fill slope and the road beside it
ENU_CACHE_MAX = 512         # cells' road parts in the anchor frame kept (Grader._cell_enu; ~0.02-0.5 MB each)
APPROACH_CELL_M = 450.0     # m: a plan's end this far from a cell cannot raise what that cell's queries see
APPROACH_CAP_GRADE = 0.10   # steepest grade a ramp falls at where a road beside it caps it (a cap alone dropped 3 m
                            # in 8 m by a side road north of the I-20 bridge near Temple, GA)
# Embankments at abutments (a GPS drive near Presov, Slovakia flipped on the D1). A bridge's map line can end
# down its embankment, short of the abutment: the road's last metres followed the valley's side in the elevation data and
# the deck end, taken from that ground, sat 1.4 m under the road 2 m on (a 12 % deck and a step at 55 mph). A road ending
# at a bridge whose last ABUT_NEAR_M fall much more steeply toward it than its own grade further on keeps that grade to
# its end instead, as the fill under a real approach does (every class, motorways too).
ABUT_FILL_ON = os.environ.get("BNE_ABUT_FILL", "on") != "off"
# A road split at a junction (the map's segments end at every one) is smoothed as one: each part's profile also samples
# the ground along the straightest part that goes on from its end, so the parts meet at one height. Each was smoothed
# alone, and on a slope each end took the average of its own side: on BR-381's 20 % grades the next part began 2 m
# over where the last ended, a ramp at every junction.
CHAIN_ON = os.environ.get("BNE_GRADE_CHAIN", "on") != "off"
CHAIN_JOIN_M = 1.0          # m: two parts' ends this close are one node
CHAIN_TURN_DEG = 35.0       # the part that goes on turns at most this at the node
CHAIN_LOOK_M = 10.0         # m along each part its direction at the node is taken over
# Junctions: a road's end that runs onto another road with no part of its own going on (a side road at a T, a service
# road on a tertiary) gives way on that road's carriageway, its weight back over YIELD_FADE_M past the carriageway's
# edge; the road it runs onto keeps its own profile (blended as equals, a short side road pulls the through road out of
# its profile: a wave that stiff tyres and springs feel). Only an end that meets that road within YIELD_GATE_* of its
# height gives way: where the two are further apart the blend spreads the step, giving way would leave it at the edge
# (a narrow road climbing beside a wider one into it, 1 m under it there: a ramp).
YIELD_NEAR_M = 20.0         # m of a road from its end that give way
YIELD_FADE_M = 8.0          # m past the other road's carriageway over which it comes back
YIELD_GATE_FROM_M = 0.10    # m apart at the end: gives way fully under this ...
YIELD_GATE_TO_M = 0.30      # ... and not at all from this
# Underpasses (#142, #126's rule: "the road under gives way"): a ground road crossing under a short
# overpass that is never raised (APPROACH_SKIP classes and links: a motorway's bridge over a local road) dips to the
# deck's height (its abutments' ground, interpolated) minus UNDER_CLEAR_M, falling back at UNDER_GRADE. Lidar terrain
# removes bridges and interpolates across the gap, at about the deck's height: the road under ran 0.7-2.5 m under the
# girders (A28 near Zwolle, I-84 over NE 181st Ave in Portland, I-395 in Springfield VA). Never raises.
UNDER_ON = os.environ.get("BNE_UNDERPASS", "on") != "off"
# Rounded junction corners (roadcorners.py): the fan of asphalt between a curbless corner's arc and its
# roads' old square corner graded at the roads' heights (Grader._make_cell)
CORNERS_ON = os.environ.get("BNE_GRADE_CORNERS", "on") != "off"
UNGRADED = {"raceway"}      # classes planned by nobody: the terrain is their surface (an oval's banking) ...
UNGRADED_MARGIN_M = 2.0     # ... and nothing else grades their carriageway (+ this: kerbs, apron): a road crossing a
                            # track, or a tunnel's open approach under one, cut a flat trench through Daytona's banking
# The same structural headroom as the deck solver, including the lower road's
# physical surface lift. A stale 6.7 m target forced short motorway decks into
# clearance humps even after their underpass had been graded (Otto, Wyoming).
UNDER_CLEAR_M = roadsmod.DECK_ROAD_CLEAR + ROAD_LIFT
UNDER_GRADE = 0.06          # the dip's ramps
UNDER_MAX_BRIDGE_M = 120.0  # only single short spans (both ends on the ground): a chain's inner ends are no abutments
UNDER_MAX_DROP_M = 8.0      # never lowered more than this (bad data: rather a low bridge than a pit)
UNDER_FLAT_M = 12.0         # m either side of the crossing kept at the dip's full depth (underpass_offsets)
UNDER_MAX_GRADE = 0.10      # a dip's ramp made steeper, up to this, to end inside its road part (underpass_offsets)
UNDER_JOINT_FLAT_M = 12.0   # at a junction, every road takes the deepest dip within this of it ...
UNDER_JOINT_FADE_M = 20.0   # ... blended back to its own over this
# m around a cell's plans whose roads and spans its dips are solved on: the farthest a dip or a loose end reaches
# (underpass_offsets: flat + the longest ramp, a junction's share) and a span's length; every cell sees the same
UNDER_NEAR_M = 4 * VERTEX_STEP  # m past a cell's box its plans' dips are made (to their pieces' cut ends there)
UNDER_REACH_M = UNDER_FLAT_M + UNDER_MAX_DROP_M * math.pi / UNDER_GRADE + 2 * UNDER_JOINT_FLAT_M \
    + UNDER_JOINT_FADE_M + 10.0
# ... and under any other short overpass, by what its ramps could not raise it (BR-381 near Pouso Alegre: a local
# road's bridge whose ramps the frontage roads at both ends held down sat ~1 m over the motorway; the 30 m elevation
# data has no cutting under it, and the AI car drove into its abutment wall)
UNDER_ANY_ON = os.environ.get("BNE_UNDERPASS_ANY", "on") != "off"
# Dig only where the elevation is filled under the bridge: the road's ground under the deck stands over the line
# between its ground just past the deck's edges (UNDER_HUMP_EDGE_M out, a median over UNDER_HUMP_WIN_M), and then only
# down to that line (the road's own grade through the bridge), not to the clearance target. Lidar that shows the cutting
# under the bridge is left alone: real overpasses leave 4-5 m, and the clearance rule would dig lidar out by metres
# under them (one carriageway under the other, walls beside the road).
UNDER_HUMP_MIN_M = 0.5      # m of fill under the deck before anything is dug
UNDER_HUMP_EDGE_M = 3.0     # m past the deck's edge (along the road under it) its own ground is read
UNDER_HUMP_WIN_M = 6.0      # ... as the median over this far
UNDER_HUMP_RAIL_HALF_M = 4.0    # m: a railway deck's half width (not in the map's road specs)
UNDER_HUMP_SIN_MIN = 0.3    # (a crossing flatter than this is taken at it: the deck's footprint along the road)
ABUT_NEAR_M = 14.0          # m from the bridge end the road is checked ...
ABUT_FAR_M = 40.0           # ... against its grade from ABUT_NEAR_M to this far
ABUT_STEEP = 0.15           # a fall this much steeper than that grade, near the end: the valley's side, not the road
ABUT_MIN_M = 0.3            # m: a smaller fill at the end is left out
ABUT_MAX_M = 8.0            # m filled at most
# Where the elevation is fine (lidar: not dem.coarse_at), a road's last samples falling into the bank are the valley's
# side at a far smaller drop than ABUT_MIN_M / ABUT_STEEP (set for coarse models): left in, the profile's smoothing,
# holding that end, draws the road's last ~50 m down and the deck climbs from there.
ABUT_STEEP_FINE = 0.05
ABUT_MIN_FINE_M = 0.1
ABUT_SHORT_SAMPLES = 3      # samples of a short profile's far half: the fewest that say a grade and not one bump
