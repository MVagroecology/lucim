<script>
module.exports = {
  name: "lpis-sustainability-compass",
  data() {
    return {
      panel: 'viewer',
      map: null,
      vectorLayer: null,
      layers: {},
      TCDDetails: false,
      gridSpacing: 10,
      runnedGridSpacing: null
    }
  },
  created() {
    this.layers = MAP_LAYERS
  },
  mounted() {
    this.setupMap()
  },
  computed: {
    toggledLayers() {
      return Object.filter(this.layers, layer => layer.show && !layer.baselayer)
    },
    selectedFeatures() {
      return Object.values(this.toggledLayers).reduce((acc, layer) => {
        if (Array.isArray(layer.selectedFeatures)) {
          return acc.concat(layer.selectedFeatures);
        }
        return acc;
      }, []);
    },
    currentZoom() {
      return this.map?.getView().getZoom()
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
    showTCDDetails() {
      this.TCDDetails = !this.TCDDetails
      VueBus.$emit('toggleTDCPointGridLayer', this.TCDDetails)
    },
    showViewer() {
      this.panel = 'viewer'
      this.$nextTick(() => {
        this.map.updateSize();  // 🔧 Critical to fix click alignment
      });
    },
    setupMap() {
      /*var initCenter = [
          1624504.61312545,
          6444797.361193953
      ] // cz */

      var initCenter = [
          -775225.1824175175,
          5139227.89655404
      ] // prada

      this.map = new ol.Map({
        target: 'map',
        layers: [],
        pixelRatio: 1, // Try setting this explicitly to debug
        view: new ol.View({
          center: initCenter,
          zoom: 14,
          projection: 'EPSG:3857',
          constrainResolution: true // forces zoom levels to integers
        })
      });

      //Instantiate with some options and add the Control
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
        this.map.updateSize();  // 🔧 Critical to fix click alignment
      });
    },
    geocodePlace() {
      var _this = this
      const place = document.getElementById('placeInput').value.trim();
      if (!place) return alert('Please enter a place name');

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;

      fetch(url)
        .then(res => res.json())
        .then(results => {
          if (!results.length) {
            alert('Place not found.');
            return;
          }
          const result = results[0]; // Take the first match
          const lon = parseFloat(result.lon);
          const lat = parseFloat(result.lat);
          const center = ol.proj.fromLonLat([lon, lat]);
          _this.map.getView().animate({ center, zoom: 14 });
        })
        .catch(err => {
          console.error('Geocoding error:', err);
          alert('Failed to find place');
        });
    },
    searchByParNum() {
      const searchValue = document.getElementById('searchInput').value.trim();
      if (!searchValue) return alert('Please enter a PAR_NUM to search');

      VueBus.$emit('goToParcel', searchValue)
    },
    calculateAvg(gridSpacing) {
      this.runnedGridSpacing = gridSpacing
      VueBus.$emit('calculateAvg', gridSpacing)
    },
    clearCalculateAvg() {
      VueBus.$emit('clearCalculateAvg')
    }
  } // end methods
}
</script>

<template>
  <div class="lpis-sustainability-compass">
    <div class="row no-gutters">
      <div class="col-2">
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
      <div class="col-2 text-center">
          <p v-if="panel == 'viewer'" @click="showAbout()" class="btn btn-back btn-copernicus pointer"><span class="d-none d-sm-block">About this tool </span><i class="fas fa-question d-sm-none"></i></p>
          
          <p v-if="panel == 'about'" @click="showViewer()" class="btn btn-back btn-copernicus pointer"><span class="d-none d-sm-block">Go to map viewer </span><i class="fas fa-desktop d-sm-none"></i></p>
      </div>
    </div>
    <div v-show="panel == 'viewer'" class="row no-gutters">
      <div class="col-12 col-sm-6">
        <div id="map"></div>
        <div id="basemaps">
          <div v-for="layer in layers">
            <!--toggle-layer :layer-props="layer"></toggle-layer-->
            <layer-tilexyz v-if="layer.tileXYZ" :layer-props="layer"></layer-tilexyz>
            <layer-wfs v-if="layer.WFS" :layer-props="layer"></layer-wfs>
            <layer-wms v-if="layer.WMS" :layer-props="layer"></layer-wms>
          </div>
        </div>
        <div id="zoom"><p class="m-0">zoom: {{ currentZoom }}</p></div>
      </div>
      <div class="col-6 col-sm-3 map-elements">
        <div class="card h-100 ml-2">
          <div class="card-body">
            <div class="mb-2 legend">
              <p class="mb-0"><b>Available layers:</b></p>
              <div v-for="layer in toggledLayers" class="mb-3">
                <p class="mb-0">{{ layer.name_en }} <div class="spinner-border" v-if="layer.isLoading" role="status">
                  <span class="sr-only">Loading...</span>
                </div></p>
                <div class="legend-element" :class="{ selected: layer.selectedFeatures && layer.selectedFeatures.some(f => f.legendId == legendEl_id) }" v-for="legendEl, legendEl_id in layer.legend">
                  <div class="square" :style="{ background: legendEl.color }"></div>
                  <p>{{ layer.getLegendLabel(legendEl) }}</p>
                </div>
              </div>
            </div>
            <div class="mb-2 feature">
              <div><p class="mb-0"><b>Selected features information:</b></p></div>
              <div class="feature-element" v-for="(feature, idx) in selectedFeatures">
                <template v-if="feature">
                  <p class="feature-layer">{{ feature.layerName }}</p>
                  <div class="feature-properties" v-for="(el, idx) in feature.info">
                    <p><b>{{ el.name }}: </b>{{ el.value }}</p>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 col-sm-3 insights">
        <div class="card h-100 ml-2">
          <div class="card-body">
            <div class="mb-4">
              <p class="mb-0">Look up your <b>farm's region</b> <img class="copernicus-img" src="img/search.png"> or go to one of DigitAF Living Labs</p>
              <button class="btn border m-1" @click="goToLL('cz')">Czechia LL</button>
              <button class="btn border m-1" @click="goToLL('fi')">Finland LL</button>
              <button class="btn border m-1" @click="goToLL('de')">Germany LL</button>
              <button class="btn border m-1" @click="goToLL('it')">Italy LL</button>
              <button class="btn border m-1" @click="goToLL('nl')">Netherlands LL</button>
              <button class="btn border m-1" @click="goToLL('uk')">United Kingdom LL</button>
            </div>
            <div class="mb-4">
              <p class="mb-0"><b>To select your farm parcel, simply click on it</b>. To select more than one, hold the SHIFT key and click on each additional parcel.</p>
            </div>
            
            <div class="card">
              <div class="card-body p-3">
                <img class="copernicus-img stamp" src="img/copernicus_logo.jpg">
                <p class="m-0"><b>Average Tree Cover Density</b> of your farm parcel(s)</p>
                <div class="row">
                  <div class="col-12 mb-4">
                    <button class="my-2" @click="calculateAvg(gridSpacing)">Calculate</button>
                    <button class="my-2" @click="clearCalculateAvg()" :disabled="!runnedGridSpacing">Clear</button>
                    <template class="mb-2" v-for="layer in toggledLayers">
                      <span v-if="'avgTCD' in layer" class="feature-element">
                        <p class="feature-layer">{{ layer.name_en }}</p>
                        <p class="mb-0"><b>Farm:</b> {{layer.avgTCD?.toFixed(2) }}% TCD</p>
                        <div class="mb-0 feature-properties" v-for="selected in layer.selectedFeatures">
                          <p><b>{{ layer.infoFn(selected.feature)[0].name }} {{ layer.infoFn(selected.feature)[0].value }}:</b> {{ selected.avgTCD?.toFixed(2) }}% TCD</p>
                        </div>
                      </span>
                    </template>
                  </div>
                  <div class="col-12">
                    <button class="my-2" @click="showTCDDetails()">How this is done</button>
                    <template v-if="TCDDetails">
                      <p>This calculates the average TCD for the parcel(s) you've selected on the map. <b>For each selected field, it places a grid of sample points (shown in red) and checks the TCD value at each of those points.</b> It then calculates the average TCD for each selected field, and also gives you an overall average for the farm.</p>
                      <label class="m-0">Grid spacing (meters): <input 
                        type="number" 
                        v-model.number="gridSpacing" 
                        min="1" 
                        step="1" 
                        style="width: 80px; margin-left: 8px;"
                      /><button class="ml-2 my-2" @click="calculateAvg(gridSpacing)" :disabled="gridSpacing == runnedGridSpacing">Re-calculate</button></label>
                      <small>Smaller spacing = more detail, slower.<br>Larger spacing = less detail, faster.</small>
                    </template>
                  </div>
                </div>
                
              </div>
            </div>
            <div class="mt-4 mb-2">
              <a href="https://land.copernicus.eu/en/products" target="_blank" class="btn btn-copernicus d-none d-sm-block">Other <img class="copernicus-img" src="img/copernicus_logo.jpg"> datasets</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="panel == 'about'" class="row no-gutters">
      <div class="col-12 col-sm-6">
        <div class="card h-100 ml-2">
          <div class="card-body">
            <p><b>The «LPIS Sustainability Compass» is designed to function as an online GIS-based environment that aggregates spatial information and generates policy-related insights for farmers. Operating primarily at the farm level, the tool leverages publicly available national Land Parcel Information System (LPIS) GIS data for parcels located within the Living Labs, and potentially beyond. This is part of DigitAF Deliverable 1.4.</b></p>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="card h-100 ml-2">
          <div class="card-body">
            <p><b>Spatial Insights into a Farm</b></p>
            <p>The following are some of the key features that the «LPIS Sustainability Compass» is expected to deliver in the near future.</p>
            <p><em><b>How representative is the farm compared to its surrounding area?</b></em></p>
            <p>Compare the land use of Living Lab farms to that of surrounding areas, providing insights into their representativeness within broader landscapes. This comparison could be made against various spatial contexts, such as NUTS3 or NUTS4 administrative regions, or a fixed e.g. 10 × 10 km bounding box - an approach particularly relevant for establishing standardized baselines. In addition to land use, agro-environmental indices calculated at the farm level will also be compared to those of the surrounding area. This functionality aims to contextualize farm performance and support more informed policy and management decisions.</p>
            <p><em><b>Land use classification challenges</b></em></p>
            <p>Accurate land use classification is crucial for policy compliance and sustainability monitoring. However, discrepancies often arise between different datasets. For instance, the EU Deforestation Regulation (EUDR) (2023/1115), effective from 30 December 2025, mandates that certain commodities, such as cattle, cocoa, coffee, oil palm, soya, wood, and rubber, must be proven to be deforestation-free and legally produced to be placed on the EU market or exported. A critical component of this regulation is the use of geospatial data to verify compliance. To support this, the Joint Research Centre (JRC) developed the Global Forest Cover (GFC) 2020 dataset, which provides a spatially explicit representation of forest presence and absence for the year 2020 at a 10m resolution. This dataset is integral to the EUDR's risk assessment framework, aiding in the identification of areas where deforestation has occurred since the cut-off date of 31 December 2020.</p>
            <p>Key questions arise around the degree of concordance between this dataset, and other with relatable impacts, and the available information within the LPIS: what types of discrepancies exist, at what spatial scales, and between which specific land uses? In particular, agricultural areas with tree cover, such as certain types of permanent crops, pastures with scattered trees, or agroforestry systems, are frequently misclassified as "forest" in global datasets like the one from the JRC. This misalignment can lead to major policy and compliance challenges.</p>
            <p>Understanding these discrepancies is vital for farmers. Misclassifications could impact eligibility for subsidies or support under this and multiple other EU policies. By being aware of how their land is classified, farmers can better navigate regulatory requirements and ensure compliance, thereby safeguarding their access to financial support and avoiding potential penalties.</p>
            <p><em><b>Identifying tree-rich and tree-poor farms</b></em></p>
            <p>Using satellite-based tree cover density data, such as the Copernicus Tree Cover Density (TCD) layers, it is possible to identify “tree desert” areas within agricultural land or even Trees Outside Forests (TOF). By overlaying this information with LPIS parcel data, specific patterns emerge, showing where tree presence in farmland is high (e.g. agroforestry systems) or nearly absent. The TCD dataset also enables tree density to be assessed at the parcel level, helping to classify farmland into categories such as grassland with trees or agroforestry based on thresholds (e.g. >5% or >10% tree cover).</p>
            <p>These insights are valuable for farmers by helping them understand how their land compares to regional tree cover baselines, identify opportunities for agroforestry expansion, and align with climate and biodiversity targets, potentially improving access to support under schemes like carbon farming or CAP eco-schemes.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
