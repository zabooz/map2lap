# Map2Lap data sources

This maps the inputs used by Map2Lap's code. Provider URLs, release ids, fallback logic and switches belong to the modules
below; inspect them when diagnosing a download. Attribution: [README credits](README.md#credits), retained upstream notices
in [CREDITS.md](CREDITS.md), and each track's generated description. Upstream credits also cover sources Map2Lap does not use.

## Build inputs

| Input | Used for | Implementation |
|---|---|---|
| Overture Maps | Roads/connectors, buildings, water, land use and infrastructure | `engine/overture.py`, `engine/mapdata.py` |
| OSM road tags / Layercake | Road attributes beyond the base map | `engine/osmtags.py` |
| OSM API extracts | Lane directions and speeds around mapped toll roofs; Overture fallback | `engine/tollsource.py` |
| Mapterhorn, AWS Terrain Tiles | Terrain heights and fallback | `engine/dem.py` |
| Copernicus polar DEM, Canadian HRDEM and BC lidar | Region-specific elevation support | `engine/polardem.py`, `engine/hrdem.py`, `engine/lidarbc.py` |
| USGS lidar, Norwegian NVDB, French IGN roads | Measured road/bridge/tunnel elevations where supported | `engine/roadz.py` |
| ESA WorldCover, Meta/WRI canopy heights | Ground classes and vegetation distribution/heights | `engine/mapdata.py`, `engine/maprasters.py` |
| OSM railway details and US crossing data | Rail equipment and level crossings | `engine/railtags.py`, `engine/fra.py` |
| Bundled climate/bridge/region data | Regional scenery and bridge choices | `tools/data/`, consumers in `engine/` and `src/scenery/` |
| ambientCG textures and Map2Lap artwork | Shared assets and painted scenery | `tools/get_textures.py`, `src/scenery/` |

Map2Lap paints comic ground and roofs; an AC build does not run the inherited aerial-image pipeline in `engine/imagery.py`.
Distant terrain uses `src/scenery/farview.py`, also without aerial imagery. Library textures/models are explicit imports
with retained source/licence metadata; see [editor-library.md](docs/editor-library.md).

Build readers cache downloaded inputs locally. Missing data, retries and fallbacks vary by source; uncached places are
not guaranteed to build offline. `engine/netfetch.py` owns build-fetch policies. Diagnostics:
[architecture.md](docs/architecture.md#build-caches-and-comparisons) and the [tool catalogue](tools/README.md).

## Interactive services

| Feature | Service and owner |
|---|---|
| Map display | OpenStreetMap raster tiles, `ui/src/components/TrackMap.tsx` |
| Place search, track name/country | Nominatim, `src/generator.py` and `src/server.py` |
| Route through pins | OSRM, `src/generator.py` |
| App releases and update downloads | GitHub, `src/app/updater.py` |
| Explicit CSP installation | Official patch download, `src/app/csp.py` |

Weather is selected in the Editor and written to the AC session (`src/app/weather.py`), not fetched from Open-Meteo.
Map2Lap has no BeamMP server-browser service. The inherited BeamNG.Earth live-world status text and service list do not
describe this app.

## Engine fetch-policy registry

The allowed hosts in `engine/netfetch.py:POLICIES` include inherited and optional readers,
including aerial imagery and BeamNG.Earth services. This registry does not mean Map2Lap
calls every host; the feature map above describes its runtime. Keep the list synchronized
when policies change (`test_netfetch.RolesTest.test_sources_md_names_every_source`).

```text
ags.cuzk.gov.cz
api.github.com
api.open-meteo.com
api.openstreetmap.org
apps.geo.fpac.usda.gov
basemap.nationalmap.gov
canelevation-dem.s3.ca-central-1.amazonaws.com
copernicus-dem-30m.s3.amazonaws.com
cteco.uconn.edu
cyberjapandata.gsi.go.jp
data.geopf.fr
data.openstreetmap.us
dataforgood-fb-data.s3.amazonaws.com
di-ingov.img.arcgis.com
downloads.sourceforge.net
earth.tgforever.net
esa-worldcover.s3.eu-central-1.amazonaws.com
gdi.berlin.de
geo.api.vlaanderen.be
geoservices.bayern.de
geoservices.buergernetz.bz.it
gis.ngdc.noaa.gov
github.com
imagery.dcgis.dc.gov
imagery.firstmap.delaware.gov
imagery.nationalmap.gov
imagery.pasda.psu.edu
maps.nj.gov
maps.ohio.gov
maps.six.nsw.gov.au
maps.vcgi.vermont.gov
maps.wien.gv.at
mapy.geoportal.gov.pl
mdgeodata.md.gov
nrs.objectstore.gov.bc.ca
nvdbapiles.atlas.vegvesen.no
opendata.lgln.niedersachsen.de
orthos.its.ny.gov
overturemaps-us-west-2.s3.us-west-2.amazonaws.com
overturemapswestus2.blob.core.windows.net
owsproxy.lgl-bw.de
photon.komoot.io
raw.githubusercontent.com
routing.openstreetmap.de
s3-us-west-2.amazonaws.com
s3.amazonaws.com
service.pdok.nl
services.nconemap.gov
services.thelist.tas.gov.au
stac.overturemaps.org
tecnagamer.github.io
tiles.arcgis.com
tiles.maaamet.ee
tiles.maps.eox.at
tiles.mapterhorn.com
tms-pnoa-ma.idee.es
vginmaps.vdem.virginia.gov
wms.pcn.minambiente.it
wmts.geo.admin.ch
wmts1.geoportail.lu
ws.geoservices.lrc.gov.on.ca
www.gds-srv.hessen.de
www.wms.nrw.de
```
