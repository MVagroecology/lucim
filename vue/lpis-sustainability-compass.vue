<script>
module.exports = {
  name: "lpis-sustainability-compass",
  data() {
    return {
      panel: 'viewer',
      middlePanel: 'layers',
      rightPanel: 'help',
      map: null,
      layers: {},
      indicator_layers: [ 'tree_cover_density_2021', 'grassland_2021' ],
      layerForPixelPoints: null,
      countriesLayer: null,
      visibleCountries: []
    }
  },
  created() {
    this.layers = MAP_LAYERS;
  },
  mounted() {
    this.setupMap()

    if (this.$route.query.middletab) {
      this.middlePanel = this.$route.query.middletab;
    }
    if (this.$route.query.righttab) {
      this.rightPanel = this.$route.query.righttab;
    }
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
    },
    baselayers() {
      return Object.filter(this.layers, function(x){ return x.baselayer })
    },
    lpislayers() {
      // Wait for map and visibleCountries to be ready
      if (!this.map || !this.countriesLayer || !Array.isArray(this.visibleCountries) || this.visibleCountries.length === 0) {
        return {};
      }
      var _this = this;
      return Object.filter(this.layers, function(x) {
        if (x.id.includes('lpis')) {
          if (_this.visibleCountries.includes(x.country_code)) {
            return true;
          } else if (x.show) {
            VueBus.$emit('updateLayerVisibility', x.id, false)
            x.show = false
            return false;
          }
        }
      })
    },
    otherlayers() {
      return Object.filter(this.layers, function(x){ return !x.id.includes('lpis') && !x.baselayer })
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
    setupMap() {
      var initCenter = [
          1624638.377924949,
          6443029.754914843
      ] // cz

      /* var initCenter = [
          -775225.1824175175,
          5139227.89655404
      ] // prada */

      let initZoom = 15; // default

      if (this.$route.query.center) {
        const parts = this.$route.query.center.split(',').map(Number);
        if (parts.length === 2 && parts.every(n => !isNaN(n))) {
          initCenter = parts;
        }
      }
      if (this.$route.query.zoom) {
        const z = Number(this.$route.query.zoom);
        if (!isNaN(z)) {
          initZoom = z;
        }
      }

      this.map = new ol.Map({
        target: 'map',
        layers: [],
        view: new ol.View({
          center: initCenter,
          zoom: initZoom,
          projection: MAP_PROJECTION,
          constrainResolution: true // forces zoom levels to integers
        })
      });

      // Scale
      const scaleLineControl = new ol.control.ScaleLine();
      this.map.addControl(scaleLineControl);

      // Geocoder
      var geocoder = new Geocoder('nominatim', {
        provider: 'photon',
        lang: 'en',
        placeholder: 'Search for ...',
        limit: 5,
        debug: false,
        autoComplete: true,
        keepOpen: true,
        preventMarker: true
      });
      this.map.addControl(geocoder);

      // Custom control for "Go to my location"
      const locateBtn = document.createElement('button');
      locateBtn.className = 'ol-locate-btn';
      locateBtn.title = 'Go to my location';
      locateBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs" alt="Locate"></i>';

      locateBtn.onclick = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const coords = ol.proj.fromLonLat([pos.coords.longitude, pos.coords.latitude], MAP_PROJECTION);
            this.map.getView().animate({ center: coords, zoom: 15 });
          }, err => {
            alert("Could not get your location.");
          });
        } else {
          alert("Geolocation is not supported by your browser.");
        }
      };

      const locateInnerControlDiv = document.createElement('div');
      locateInnerControlDiv.className = 'ol-control';
      locateInnerControlDiv.appendChild(locateBtn);

      const locateControlDiv = document.createElement('div');
      locateControlDiv.className = 'ol-unselectable ol-custom-locate';
      locateControlDiv.appendChild(locateInnerControlDiv);

      const locateControl = new ol.control.Control({
        element: locateControlDiv
      });
      this.map.addControl(locateControl);
      
      // Create layer for pixels from calculations
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

      // Add countries limits layer
      const countriesSource = new ol.source.Vector({
        url: 'js/layers/europe_countries.geojson',
        format: new ol.format.GeoJSON()
      });
      this.countriesLayer = new ol.layer.Vector({
        source: countriesSource,
        visible: true
      });
      this.map.addLayer(this.countriesLayer);

      countriesSource.on('change', () => {
        if (countriesSource.getState() === 'ready') {
          this.getVisibleCountries();
        }
      });

      this.map.on('moveend', () => {
        this.getVisibleCountries();

        const newQuery = {
          ...this.$route.query,
          center: this.map.getView().getCenter().join(','),
          zoom: this.map.getView().getZoom()
        };

        // Only update if something changed
        if (
          this.$route.query.center !== newQuery.center ||
          this.$route.query.zoom !== String(newQuery.zoom)
        ) {
          this.$router.replace({ query: newQuery });
        }
      });
      
      this.$nextTick(() => {
        this.map.updateSize();  // Critical to fix click alignment
      });
    },
    getVisibleCountries() {
      if (!this.map || !this.countriesLayer) return [];
      const mapExtent = this.map.getView().calculateExtent(this.map.getSize());
      var countries = [];
      this.countriesLayer.getSource().forEachFeature(feature => {
        if (feature.getGeometry().intersectsExtent(mapExtent)) {
          countries.push(feature.get('CNTR_ID'));
        }
      });
      this.visibleCountries = countries
    },
    setMiddleTab(tabName) {
      this.middlePanel = tabName;
      const newQuery = {
        ...this.$route.query,
        middletab: tabName
      };
      if (this.$route.query.middletab !== tabName) {
        this.$router.replace({ query: newQuery });
      }
    },
    setRightTab(tabName) {
      this.rightPanel = tabName;
      const newQuery = {
        ...this.$route.query,
        righttab: tabName
      };
      if (this.$route.query.righttab !== tabName) {
        this.$router.replace({ query: newQuery });
      }
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
    <div class="row mx-1">

      <div class="col-6 px-1"> <!-- LEFT SIDE -->
        <div id="map"></div>
        <div id="zoom"><p class="m-0">zoom: {{ currentZoom }}</p></div>
      </div>

      <div class="col-3 px-1 map-elements"> <!-- MIDDLE -->
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: middlePanel == 'layers'}" @click="setMiddleTab('layers')">Layers</a>
          </li>
        </ul>

        <div v-show="middlePanel == 'layers'" class="card">
          <div class="card-body">
            <div class="mb-2 layers">
              <p class="mb-0"><b>Layers</b></p>
              <p class="mt-2 mb-1">LPIS</p>
              <div class="text-smaller" v-for="layer in lpislayers">
                <layer-tilexyz :key="layer.id" v-if="layer.type == 'tileXYZ'" :layer_props="layer" :layer_id="layer.id"></layer-tilexyz>
                <layer-wfs :key="layer.id" v-if="layer.type == 'WFS'" :layer_props="layer" :layer_id="layer.id"></layer-wfs>
                <layer-wms :key="layer.id" v-if="layer.type == 'WMS'" :layer_props="layer" :layer_id="layer.id"></layer-wms>
              </div>
              <div class="text-smaller" v-if="Object.keys(lpislayers).length == 0">
                <p>LPIS coverage is not yet supported for this location</p>
              </div>
              <p class="mt-2 mb-1">Other layers</p>
              <div class="text-smaller" v-for="layer in otherlayers">
                <layer-tilexyz :key="layer.id" v-if="layer.type == 'tileXYZ'" :layer_props="layer" :layer_id="layer.id"></layer-tilexyz>
                <layer-wfs :key="layer.id" v-if="layer.type == 'WFS'" :layer_props="layer" :layer_id="layer.id"></layer-wfs>
                <layer-wms :key="layer.id" v-if="layer.type == 'WMS'" :layer_props="layer" :layer_id="layer.id"></layer-wms>
              </div>
              <p class="mt-2 mb-1">Baselayers</p>
              <div class="text-smaller" v-for="layer in baselayers">
                <layer-tilexyz :key="layer.id" v-if="layer.type == 'tileXYZ'" :layer_props="layer" :layer_id="layer.id"></layer-tilexyz>
                <layer-wfs :key="layer.id" v-if="layer.type == 'WFS'" :layer_props="layer" :layer_id="layer.id"></layer-wfs>
                <layer-wms :key="layer.id" v-if="layer.type == 'WMS'" :layer_props="layer" :layer_id="layer.id"></layer-wms>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-3 px-1 map-elements"> <!-- RIGHT SIDE -->
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: rightPanel == 'help'}" @click="setRightTab('help')">Help</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: rightPanel == 'legend'}" @click="setRightTab('legend')">Legend</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: rightPanel == 'indicators'}"  @click="setRightTab('indicators')">Indicators</a>
          </li>
        </ul>

        <div v-show="rightPanel == 'help'" class="card">
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

        <div v-show="rightPanel == 'legend'" class="card">
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
                  <div :key="layer.id">
                    <p class="mb-0">{{ layer.name_en }}</p>
                    <div class="legend-element" :class="{ selected: layer.selectedLegendElements?.includes(legendEl_id) }" v-for="legendEl, legendEl_id in layer.layer_legend">
                      <div class="square" :class="{ 'no-data': legendEl.color === null }" :style="{ background: legendEl.color }"></div>
                      <p>{{ legendEl[layer.feature_legend_text] }}</p>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <div v-show="rightPanel == 'indicators'" class="card">
          <div class="card-body">
            <div class="mb-2">
              <p class="m-0"><b>Indicator statistics</b> of your farm parcel(s)</p>
              <button class="my-2" @click="calculateIndicators()">Calculate</button>
              <button class="my-2" @click="clearStats()">Clear</button>
              <div v-for="layer in layers" class="mb-3 text-left">
                <template v-if="layer.type == 'WFS' && layer.show && !layer.baselayer && layer.selectedFeatures?.length > 0">
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

    </div>
  </div>
</template>
