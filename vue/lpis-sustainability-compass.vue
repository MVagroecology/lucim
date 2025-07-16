<script>
module.exports = {
  name: "lpis-sustainability-compass",
  data() {
    return {
      panel: 'viewer',
      middlePanel: 'legend',
      map: null,
      layers: {},
      indicator_layers: [ 'tree_cover_density_2021', 'grassland_2021' ],
      layerForPixelPoints: null
    }
  },
  created() {
    var _this = this

    this.layers = MAP_LAYERS
  },
  mounted() {
    this.setupMap()
  },
  computed: {
    currentZoom() {
      return this.map?.getView().getZoom()
    },
    anySelectedFeature() {
      for (layer of Object.values(this.layers)) {
        if (layer.selectedFeatures?.length > 0) {
          return true
        }
      }
      return false
    }
  },
  methods: {
    goToLL(ll) {
      var center = {
        cz: [ 1840683.9115480955, 6318239.438253673 ],
        fi: [ 3283692.290487795, 8952656.169080153 ],
        de: [ 1553772.7979576322, 6789747.502388015 ],
        it: [ 1214347.8501890423, 5409332.980049073 ],
        nl: [ 636507.9391770194, 6782649.020396105 ],
        uk: [ -150301.35564523656, 7005328.808126256 ]
      }[ll]
      this.map.getView().animate({ center, zoom: 10 });
    },
    showAbout() {
      this.panel = 'about'
    },
    showViewer() {
      this.panel = 'viewer'
      this.$nextTick(() => {
        this.map.updateSize();  // Critical to fix click alignment
      });
    },
    setupMap() {
      var initCenter = [
          1624638.377924949,
          6443029.754914843
      ] // cz

      /* var initCenter = [
          -775225.1824175175,
          5139227.89655404
      ] // prada */

      this.map = new ol.Map({
        target: 'map',
        layers: [],
        view: new ol.View({
          center: initCenter,
          zoom: 15,
          projection: MAP_PROJECTION,
          constrainResolution: true // forces zoom levels to integers
        })
      });
      
      const layerSourceForPixelPoints = new ol.source.Vector();
      this.layerForPixelPoints = new ol.layer.Vector({
        source: layerSourceForPixelPoints,
        zIndex: 100,
        style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 1,
            fill: new ol.style.Fill({ color: 'red' })
          })
        })
      });
      this.map.addLayer(this.layerForPixelPoints);

      var geocoder = new Geocoder('nominatim', {
        provider: 'osm',
        lang: 'en',
        placeholder: 'Search for ...',
        limit: 5,
        debug: false,
        autoComplete: true,
        keepOpen: true,
        preventMarker: true
      });
      this.map.addControl(geocoder);

      this.$nextTick(() => {
        this.map.updateSize();  // Critical to fix click alignment
      });
    },
    clearStats() {
      this.layerForPixelPoints.getSource().clear();
      for (layer of Object.values(this.layers)) {
        if (layer.type == "WFS" && layer.show && layer.selectedFeatures.length > 0) {
          for (selectedFeature of layer.selectedFeatures) {
            for (indicator_layer of this.indicator_layers) {
              this.$delete(selectedFeature, indicator_layer + '_sum')
              this.$delete(selectedFeature, indicator_layer + '_count')
              this.$delete(selectedFeature, indicator_layer + '_avg')
              this.$delete(selectedFeature, indicator_layer + '_max')
              this.$delete(selectedFeature, indicator_layer + '_min')
            }
          }
        }
      }
    },
    calculateIndicators() {
      var _this = this
      var requests = []
      for (layer of Object.values(this.layers)) {
        if (layer.type == "WFS" && layer.show && layer.selectedFeatures.length > 0) {
          for (selectedFeature of layer.selectedFeatures) {
            for (indicator_layer of this.indicator_layers) {
              console.log(layer.id + ": performing 'averageRasterValueForPolygon' for " + indicator_layer)
              requests.push(this.averageRasterValueForPolygon(this.layers[indicator_layer], selectedFeature))
            }
          }
        }
      }
      Promise.allSettled(requests).then(function() {
				_this.map.getView().fit(_this.layerForPixelPoints.getSource().getExtent(), { padding: [20, 20, 20, 20], duration: 500 });
			})
    },
    averageRasterValueForPolygon(rasterLayer, selectedFeature) {
      var _this = this

      const url = this.getWMSUrlForFeature(rasterLayer, selectedFeature)
      
      // Get geotiff image from WMS url
      
      return GeoTIFF.fromUrl(url, { allowFullFile: true }).then(function(tiff) {

        tiff.getImage().then(function(image) {

          var fileDirectory = image.fileDirectory
          const [a, b, _, tx, c, d, __, ty] = fileDirectory.ModelTransformation;

          image.readRasters({ interleave: true }).then(function(raster) {

            // Raster statistics
            let sum = 0;
            let count = 0;
            let max = null
            let min = null

            const origin = image.getOrigin();        // top-left corner [x, y]
            const res = image.getResolution();       // [pixelWidth, pixelHeight]
            const width = image.getWidth();
            const height = image.getHeight();

            // Generate the geojson for turf evaluate if points intersect it
            // Turf works in TURF_PROJECTION = "EPSG:4326", so, every operation using it needs
            // to have the coordinates transformed into, and transformed back
            var polygonGeoJSONForTurf = new ol.format.GeoJSON().writeFeatureObject(selectedFeature.feature, {
              featureProjection: selectedFeature.projection, // Source projection
              dataProjection: TURF_PROJECTION, // Output projection
            });

            // Iterate over every pixel
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {

                // Get the value from the raster
                const value = raster[y * width + x];
                if (value === null || value === image.fileDirectory.GDAL_NODATA) continue;

                // Calculate pixel center coordinates
                const coordX = a * (x + 0.5) + b * (y + 0.5) + tx; // +0.5 for center
                const coordY = c * (x + 0.5) + d * (y + 0.5) + ty;

                const coordForTurf = ol.proj.transform([coordX, coordY], _this.layers.tree_cover_density_2021.layer_projection, TURF_PROJECTION);

                const coordForMap = ol.proj.transform([coordX, coordY], _this.layers.tree_cover_density_2021.layer_projection, MAP_PROJECTION);
                
                // Create point and check if is inside the polygon
                const pt = turf.point(coordForTurf);
                if (turf.booleanPointInPolygon(pt, polygonGeoJSONForTurf)) {

                  const pointFeature = new ol.Feature(new ol.geom.Point(coordForMap));
                  _this.layerForPixelPoints.getSource().addFeature(pointFeature);

                  if (value !== null && !isNaN(value)) {

                    // Calculate statistics

                    sum += value;

                    count++;

                    if (max === null) {
                      max = value
                    } else {
                      max = Math.max(max, value)
                    }

                    if (min === null) {
                      min = value
                    } else {
                      min = Math.min(min, value)
                    }

                  }
                }
              }
            }

            var avg = count > 0 ? sum / count : null;
            console.log('sum: ' + sum)
            console.log('count: ' + count)
            console.log('avg: ' + avg)
            console.log('max: ' + max)
            console.log('min: ' + min)
            
            _this.$set(selectedFeature, rasterLayer.id + "_avg", avg)
            _this.$set(selectedFeature, rasterLayer.id + "_sum", sum)
            _this.$set(selectedFeature, rasterLayer.id + "_count", count)
            _this.$set(selectedFeature, rasterLayer.id + "_max", max)
            _this.$set(selectedFeature, rasterLayer.id + "_min", min)
          })
        })
      }).catch(err => console.warn(err))
    },
    getWMSUrlForFeature(rasterLayerObj, selectedFeature) {

        const projection = rasterLayerObj.layer_projection
        const source = rasterLayerObj.layer.getSource()
        const baseUrl = source.getUrls()[0];
        const params = source.getParams();
        const pixelSize = rasterLayerObj.layer_resolution

        const featureExtent = selectedFeature.feature.getGeometry().getExtent();
        
        // Transform feature extent to raster projection

        // Transform all 4 corners individually
        const extentCorners = [
            [featureExtent[0], featureExtent[1]], // ll
            [featureExtent[2], featureExtent[1]], // lr
            [featureExtent[0], featureExtent[3]], // ul
            [featureExtent[2], featureExtent[3]]  // ur
          ];

        const extentCornersInRasterProjection = extentCorners.map(coord => 
          proj4(selectedFeature.projection, rasterLayerObj.layer_projection, coord)
        );

        // Calculate extent with buffer (2 meters)
        const pixelBuffer = 2
        const xs = extentCornersInRasterProjection.map(c => c[0]);
        const ys = extentCornersInRasterProjection.map(c => c[1]);
        const buffer = pixelBuffer * pixelSize;
        
        var extent = [
          Math.min(...xs) - buffer, // minX
          Math.min(...ys) - buffer, // minY
          Math.max(...xs) + buffer, // maxX
          Math.max(...ys) + buffer  // maxY
        ];

        // Snap bbox to raster grid
        const [minx, miny, maxx, maxy] = extent  
        const originX = rasterLayerObj.layer_origin_x
        const originY = rasterLayerObj.layer_origin_y
        
        // Snap outward to ensure full coverage
        const minCol = Math.floor((minx - originX) / pixelSize);
        const maxCol = Math.ceil((maxx - originX) / pixelSize);
        const maxRow = Math.floor((originY - miny) / pixelSize);
        const minRow = Math.ceil((originY - maxy) / pixelSize);

        const snappedMinX = originX + minCol * pixelSize;
        const snappedMaxX = originX + maxCol * pixelSize;
        const snappedMaxY = originY - minRow * pixelSize;
        const snappedMinY = originY - maxRow * pixelSize;

        const width = Math.round((snappedMaxX - snappedMinX) / pixelSize);
        const height = Math.round((snappedMaxY - snappedMinY) / pixelSize);

        // TODO how to know the correct order of the bbox from the projection system?

        //const bbox = [snappedMinX, snappedMinY, snappedMaxX, snappedMaxY].join(',');
        const bbox = [snappedMinY, snappedMinX, snappedMaxY, snappedMaxX].join(',');

        return `${baseUrl
            }?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap` +
            `&FORMAT=image/geotiff` +
            `&TRANSPARENT=${params.TRANSPARENT ? 'TRUE' : 'FALSE'}` +
            `&LAYERS=${params.LAYERS}` +
            `&WIDTH=${width}&HEIGHT=${height}` +
            `&CRS=${projection}&BBOX=${bbox}`
    },
  } // end methods
}
</script>

<template>
  <div class="lpis-sustainability-compass">
    <div class="row" v-show="panel == 'viewer'">

      <div class="col-6"> <!-- LEFT SIDE -->
        <div class="row">
          <div class="col-4">
            <router-link class="btn btn-back" to="/" tag="button">
              <span class="d-none d-sm-block">Back to <b>homepage</b></span>
              <i class="fa fa-home d-sm-none"></i>
            </router-link>
          </div>
          <div class="col-8">
            <h3 class="lpis-sustainability-compass-title text-center">
              LPIS Sustainability Compass
            </h3>
          </div>
          <div class="col-12">
            <div id="map"></div>
            <div id="basemaps">
              <div v-for="layer in layers">
                <layer-tilexyz v-if="layer.type == 'tileXYZ'" :layer_props="layer" :layer_id="layer.id"></layer-tilexyz>
                <layer-wfs v-if="layer.type == 'WFS'" :layer_props="layer" :layer_id="layer.id"></layer-wfs>
                <layer-wms v-if="layer.type == 'WMS'" :layer_props="layer" :layer_id="layer.id"></layer-wms>
              </div>
            </div>
            <div id="zoom"><p class="m-0">zoom: {{ currentZoom }}</p></div>
          </div>
        </div>
      </div>

      <div class="col-6"> <!-- RIGHT SIDE -->
        <div class="row">
          <div class="col-7 pl-0 map-elements">
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: middlePanel == 'legend'}" @click="middlePanel = 'legend'">Legend</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: middlePanel == 'indicators'}"  @click="middlePanel = 'indicators'">Indicators</a>
              </li>
              <!--li class="nav-item">
                <a class="nav-link" href="#">Link</a>
              </li-->
              <li class="nav-item">
                <!--a class="nav-link" @click="demo()">Demo</a-->
              </li>
            </ul>

            <div v-if="middlePanel == 'legend'" class="card">
              <div class="card-body">
                <div class="mb-2 feature" v-if="anySelectedFeature">
                  <div><p class="mb-0"><b>Selected features information</b></p></div>
                  <div v-for="layer in layers" class="mb-3">
                    <template v-if="layer.show && !layer.baselayer">
                      <p class="mb-2">{{ layer.name_en }}</p>
                      <div class="feature-element mb-2" v-for="(feature, idx) in layer.selectedFeatures" v-animate-on-update="feature">
                        <template v-if="feature">
                          <div class="feature-properties" v-for="(el, idx) in feature.info">
                            <p><b>{{ el.name }}: </b>{{ el.value }}</p>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
                <div class="mb-2 legend">
                  <p class="mb-0"><b>Legend</b></p>
                  <div v-for="layer in layers" class="mb-3">
                    <template v-if="layer.show && !layer.baselayer">
                      <p class="mb-0">{{ layer.name_en }} <div class="spinner-border" v-if="layer.isLoading" role="status">
                        <span class="sr-only">Loading...</span>
                      </div></p>
                      <div class="legend-element" :class="{ selected: layer.selectedLegendElements?.includes(legendEl_id) }" v-for="legendEl, legendEl_id in layer.layer_legend">
                        <div class="square" :class="{ 'no-data': legendEl.color === null }" :style="{ background: legendEl.color }"></div>
                        <p>{{ legendEl[layer.feature_legend_text] }}</p>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="middlePanel == 'indicators'" class="card">
              <div class="card-body">
                <div class="mb-2">
                  <p class="m-0"><b>Indicator statistics</b> of your farm parcel(s)</p>
                  <button class="my-2" @click="calculateIndicators()">Calculate</button>
                  <button class="my-2" @click="clearStats()">Clear</button>
                  <div v-for="layer in layers" class="mb-3 text-left">
                    <template v-if="layer.type == 'WFS' && layer.show && !layer.baselayer && layer.selectedFeatures.length > 0">
                      <p class="mb-2">{{ layer.name_en }}</p>
                      <div class="feature-element mb-2" v-for="(selectedFeature, idx) in layer.selectedFeatures" v-animate-on-update="selectedFeature">
                        <template v-if="selectedFeature">
                          <div class="feature-properties table-responsive">
                            <p><b>{{ layer.feature_identifier }}:</b> {{ selectedFeature.feature.get(layer.feature_identifier) }}</p>
                            <table class="table">
                              <thead>
                                <tr>
                                  <th scope="col"></th>
                                  <th v-for="indicator_layer of indicator_layers" scope="col">{{ layers[indicator_layer].name }}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <th scope="row">Sum</th>
                                  <td v-for="indicator_layer of indicator_layers">{{ selectedFeature[indicator_layer + '_sum']?.toFixed(0) }}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Count</th>
                                  <td v-for="indicator_layer of indicator_layers">{{ selectedFeature[indicator_layer + '_count']?.toFixed(0) }}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Average</th>
                                  <td v-for="indicator_layer of indicator_layers">{{ selectedFeature[indicator_layer + '_avg']?.toFixed(2) }}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Max</th>
                                  <td v-for="indicator_layer of indicator_layers">{{ selectedFeature[indicator_layer + '_max']?.toFixed(0) }}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Min</th>
                                  <td v-for="indicator_layer of indicator_layers">{{ selectedFeature[indicator_layer + '_min']?.toFixed(0) }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                  <a href="https://land.copernicus.eu/en/products" target="_blank" class="btn btn-copernicus d-none d-sm-block">Other <img class="copernicus-img" src="img/copernicus_logo.png"> datasets</a>
                </div>
              </div>
            </div>

          </div>
          <div class="col-5 pl-0 insights text-center">
            <p class="btn btn-back btn-copernicus pointer"><a href="https://docs.google.com/forms/d/e/1FAIpQLSfpRQTzxsG4rifDJK5qVnv1yfuQl1Gf5hqWRZZf962Nc5Y6zQ/viewform?usp=dialog" target="_blank">Feedback & Ideas</a></p>

            <p v-if="panel == 'viewer'" @click="showAbout()" class="btn btn-back btn-copernicus pointer"><span class="d-none d-sm-block">About</span><i class="fas fa-question d-sm-none"></i></p>
            
            <p v-if="panel == 'about'" @click="showViewer()" class="btn btn-back btn-copernicus pointer"><span class="d-none d-sm-block">Go to map viewer </span><i class="fas fa-desktop d-sm-none"></i></p>
            <div class="card">
              <div class="card-body">
                <div class="mb-4">
                  <p class="mb-0">Look up your <b>farm's region</b> <img class="copernicus-img" src="img/search.png"> or go to one of DigitAF's Living Labs</p>
                  <button class="btn border m-1 p-1" @click="goToLL('cz')">Czechia LL</button>
                  <button class="btn border m-1 p-1" @click="goToLL('fi')">Finland LL</button>
                  <button class="btn border m-1 p-1" @click="goToLL('de')">Germany LL</button>
                  <button class="btn border m-1 p-1" @click="goToLL('it')">Italy LL</button>
                  <button class="btn border m-1 p-1" @click="goToLL('nl')">Netherlands LL</button>
                  <button class="btn border m-1 p-1" @click="goToLL('uk')">UK LL</button>
                </div>
                <div class="mb-4">
                  <p class="mb-0"><b>To select your farm parcel, simply click on it</b>. To select more than one, hold the SHIFT key and click on each additional parcel.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="panel == 'about'" class="row">
      <div class="col-6">
        <div class="row">
          <div class="col-4">
            <router-link class="btn btn-back" to="/" tag="button">
              <span class="d-none d-sm-block">Back to <b>homepage</b></span>
              <i class="fa fa-home d-sm-none"></i>
            </router-link>
          </div>
          <div class="col-8">
            <h3 class="lpis-sustainability-compass-title text-center">
              LPIS Sustainability Compass
            </h3>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="row">
          <div class="col-12 text-right">
            <p class="btn btn-back btn-copernicus pointer"><a href="https://docs.google.com/forms/d/e/1FAIpQLSfpRQTzxsG4rifDJK5qVnv1yfuQl1Gf5hqWRZZf962Nc5Y6zQ/viewform?usp=dialog" target="_blank">Feedback & Ideas</a></p>

            <p v-if="panel == 'viewer'" @click="showAbout()" class="btn btn-back btn-copernicus pointer"><span class="d-none d-sm-block">About</span><i class="fas fa-question d-sm-none"></i></p>
            
            <p v-if="panel == 'about'" @click="showViewer()" class="btn btn-back btn-copernicus pointer"><span class="d-none d-sm-block">Go to map viewer </span><i class="fas fa-desktop d-sm-none"></i></p>
          </div>
        </div>
      </div>
      <div class="col-12 mb-2">
        <div class="card">
          <div class="card-body">
            <p><b>The «LPIS Sustainability Compass» is designed to function as an online GIS-based environment that aggregates spatial information and generates policy-related insights for farmers. Operating primarily at the farm level, the tool leverages publicly available national Land Parcel Information System (LPIS) GIS data for parcels located within the Living Labs, and potentially beyond.</b></p>
          </div>
        </div>
      </div>
      <div class="col-12 mb-2 text-center">
        <div class="card">
          <div class="card-body">
            <p><b>Spatial Insights into Parcel or Farm</b></p>
            <p>The following are some examples of use cases that the «LPIS Sustainability Compass» is designed to support.</p>
          </div>
        </div>
      </div>
      
      <div class="col-5 mb-2">
        <div class="card">
          <div class="card-body">
            <p><em><b>How representative is the parcel/farm compared to its surrounding area?</b></em></p>
            <p>Compare the land use (e.g. of Living Lab parcel/farms) to that of surrounding areas, providing insights into their representativeness within broader landscapes. This comparison is made within various spatial scales, such as NUTS3 or NUTS4 administrative regions, or a fixed e.g. 10 × 10 km bounding box (editable bounding box size) - an approach particularly relevant for establishing standardized baselines. In addition to land use, agro-environmental indices calculated at the farm level will also be compared to those of the surrounding area. This functionality aims to contextualize farm performance and support more informed policy and management decisions.</p>
          </div>
        </div>
      </div>
      
      <div class="col-7 mb-2">
        <div class="card">
          <div class="card-body">
            <p><em><b>Identifying tree-rich and tree-poor farms</b></em></p>
            <p>Using satellite-based tree cover density data, such as the <a href="https://land.copernicus.eu/en/products/high-resolution-layer-forests-and-tree-cover?tab=tree_cover_density" target="_blank">Copernicus Tree Cover Density (TCD) layers</a>, it is possible to identify “tree desert” areas within agricultural land or even Trees Outside Forests (TOF). By overlaying this information with LPIS parcel data, specific patterns emerge, showing where tree presence in farmland is high (e.g. agroforestry systems) or nearly absent. The TCD dataset also enables tree density to be assessed at the parcel level, helping to classify farmland into categories such as grassland with trees or silvoarable systems based on thresholds (e.g. >5% or >10% TCD).</p>
            <p>These insights are valuable for farmers by helping them understand how their land compares to regional tree cover baselines, identify opportunities for agroforestry expansion, and align with climate and biodiversity targets. Use of GSAA-LPIS parcel codes is specifically recommended in the <a href="https://eur-lex.europa.eu/eli/reg/2024/3012" target="_blank">Carbon Removals and Carbon Farming (CRCF) Regulation (2024/3012)</a> and in monitoring of landscape features needed for compliance with the <a href="https://eur-lex.europa.eu/eli/C/2025/980/" target="_blank">Nature Restoration Regulation (Commission Notice C/2025/980 14.2.2025)</a>, and with CAP Conditionality requirements.</p>
          </div>
        </div>
      </div>
      
      <div class="col-5 mb-2">
        <div class="card">
          <div class="card-body">
            <p><em><b>Land use classification challenges</b></em></p>
            <p>Accurate land use classification is crucial for policy compliance and sustainability monitoring. However, discrepancies often arise between different datasets. For instance, the <a href="https://eur-lex.europa.eu/eli/reg/2023/1115" target="_blank">EU Deforestation Regulation (EUDR) (2023/1115)</a>, effective from 30 December 2025, mandates that certain commodities, such as cattle, cocoa, coffee, oil palm, soya, wood, and rubber, must be proven to be deforestation-free and legally produced to be placed on the EU market or exported. A critical component of this regulation is the use of geospatial data to verify compliance. To support this, the Joint Research Centre (JRC) developed the <a href="https://forobs.jrc.ec.europa.eu/GFC" target="_blank">Global Forest Cover (GFC) 2020 dataset</a>, which provides a spatially explicit representation of forest presence and absence for the year 2020 at a 10m resolution. This dataset is integral to the EUDR's risk assessment framework, aiding in the identification of areas where deforestation has occurred since the cut-off date of 31 December 2020.</p>
            <p>Key questions arise around the degree of concordance between this forest cover dataset, with information on agricultural and forestry land use information available from the LPIS: what types of discrepancies exist, at what spatial scales, and between which specific land uses? In particular, agricultural areas with tree cover, such as certain types of permanent crops, pastures with scattered trees, or agroforestry systems, are frequently misclassified as "forest" in global datasets like the one from the JRC. This misalignment can lead to major policy and compliance challenges (see <a href="https://doi.org/10.5281/zenodo.14161921" target="_blank">EURAF Policy Briefing #15</a>).</p>
            <p>Understanding these discrepancies is vital for farmers. Misclassifications could impact eligibility for subsidies or support under this and multiple other EU policies. By being aware of how their land is classified, farmers can better navigate regulatory requirements and ensure compliance, thereby safeguarding their access to financial support and avoiding potential penalties.</p>
            <p>The «LPIS Sustainability Compass» offers a platform to explore and address the complex challenges of land use classification, enabling stakeholders to share their perspectives through their specific contextual lenses. It also provides a channel to visualize statutory land use constraints, physical limitations to land use change, and opportunities for tree planting, all within a tool that can be integrated with other DigitAF socio-economic and biophysical models.</p>
          </div>
        </div>
      </div>

      <div class="col-7 mb-2">
        <div class="card">
          <div class="card-body">
            <p><em><b>Recording conditionality within other legal designations at parcel or sub-parcel scale</b></em></p>
            <p>The geospatial implications for "conditionality" in the CAP are summarised in <a href="https://eur-lex.europa.eu/eli/reg/2021/2115" target="_blank">Annex III of the Strategic Plan Regulation (2021/2115)</a> and require monitoring by CAP Managing Authorities, and compliance by farmers. The «LPIS Sustainability Compass» is being developed to deliver the following indicators at plot or farm level:</p>
            <p><em>Good Agricultural and Environmental Conditions (GAEC)</em></p>
            <ul>
              <li>GAEC1 - Maintenance of permanent grassland based on a ratio of permanent grassland in relation to agricultural area at national, regional, subregional, group-of-holdings or holding level in comparison to the reference year 2018, with a maximum decrease of 5 % allowed.</li>
              <li>GAEC2 - Protection of wetland and peatland soils, where whole parcels or parts of parcels are designated as susceptible to constraints on the type of land use and ploughing allowed</li>
              <li>GAEC3 - Ban on the burning of arable stubble - except for plant health reasons - tracked using the Area Monitoring System.</li>
              <li>GAEC4 - Establishment of buffer strips along water courses - involving preservation of a 3m strip along watercourses, which should be mapped.  Additional funding may be available for planting new herbaceous or woody strips.</li>
              <li>GAEC5 - Tillage management to reduce the risk of soil degradation and erosion, including consideration of the slope gradient - which may involve mapping of erosion risk at parcel or sub parcel scale.</li>
              <li>GAEC6 - Minimum soil cover to avoid bare soil in periods that are most sensitive - with rules set by Member States and monitoring through the Area Monitoring Service.</li>
              <li>GAEC7 - Crop rotation in arable land, except for crops growing under water - where LPIS data is used to establish sufficient rotations and  compliance is monitored through the Copernicus Area Monitoring Service.</li>
              <li>GAEC8 - Minimum area devoted to landscape features (hedges, trees, ponds, terraces, copses etc)  and non-productive areas (fallow land) - this requirement was removed in the simplification package of 14.5.2024 (2024/1468), but Management Agencies are still required to monitor the retention of landscape features by farmers.</li>
              <li>GAEC9 - Ban on converting or ploughing permanent grassland designated at environmentally-sensitive permanent grasslands in Natura 2000 sites.</li>
            </ul>
            <p><em>Statutory Monitoring Requirements</em></p>
            <ul>
              <li>SMR1 - Water Framework Directive (Directive 2000/60/EC) monitoring - particularly diffuse sources of pollution by phosphates</li>
              <li>SMR2 - Nitrates Directive (91/676/EEC) - protection of waters against pollution caused by nitrates from agricultural sources.</li>
              <li>SMR3 - Wild Birds Directive (91/676/EEC) - conservation of wild birds.</li>
              <li>SMR4 - Habitats Directive - conservation of natural habitats and wild flora and fauna, and mainly represented by Natura 2000 habitat designations</li>
            </ul>
            <p>Furthermore, a range of agri-environmental indicators could be calculated at parcel and farm scale using methodologies developed for the CAP Performance Monitoring and Evaluation Framework. These are discussed in <a href="https://doi.org/10.5281/zenodo.15084363" target="_blank">DigitAF Deliverable 1.2 (Kay et al 2024)</a>. Other examples of use cases are  given in <a href="https://doi.org/10.5281/zenodo.15712678" target="_blank">DigitAF Policy Briefing #68</a>.</p>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <p><b>For more details:</b></p>
            <p>Tomás A, Kay S, Lawson GJ, Gosme M, Smith J, Palma JHN (2025) AF-LPIS spatial policy models implemented for use in LL: The LPIS Sustainability Compass. DigitAF EU project. Deliverable 1.4 Available @ <a href="https://www.doi.org/10.5281/zenodo.15609504" target="_blank">https://www.doi.org/10.5281/zenodo.15609504</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
