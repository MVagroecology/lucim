<!-- filepath: c:\xampp\htdocs\tools\dev\lucim\vue\compass-layer-status.vue -->
<script>
module.exports = {
  name: "compass-layer-status",
  data() {
    return {
      layers: [], // Will be filled from parent or imported
      pingResults: {}, // { layer_id: 'OK' | 'FAIL' | '...' }
      pingURLs: {}, // { layer_id: 'url' }
      pingPreview: {}
    }
  },
  mounted() {
    this.layers = MAP_LAYERS;
    this.testAllLayers();
  },
  methods: {
    getBogusTransformedExtent(countryCode) {
      const extents = {
        PT: "-7.116183121792107,41.81546759475739,-7.115109344117372,41.81588805806942",
        CZ: "-733426.0754281293,-1057198.753020176,-730811.0009606997,-1055588.992125351",
      };
      return extents[countryCode] || [0, 0, 0, 0];
    },
    async pingLayer(url, id) {
      try {
        const response = await fetch(url, { method: 'GET' });
        this.$set(this.pingResults, id, response.ok ? 'OK' : 'FAIL');
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          let preview = '';
          if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            preview = JSON.stringify(json, null, 2).substring(0, 100) + '...';
          } else {
            const text = await response.text();
            preview = text.substring(0, 100) + '...';
          }
          this.$set(this.pingPreview, id, preview);
        } else {
          this.$set(this.pingPreview, id, 'Failed to load');
        }
      } catch (e) {
        this.$set(this.pingResults, id, 'FAIL');
      }
    },
    parseUrlToObject(url) {
      const u = new URL(url);
      const params = {};
      u.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return {
        baseUrl: u.origin + u.pathname,
        params
      };
    },
    getWMSURL(layer, urlObj) {
      // Default params
      const defaultParams = {
        request: 'GetMap',
        bbox: "1622910.9845508635,6441501.247648373,1624133.9770034263,6442724.240100936",
        width: 256,
        height: 256,
        crs: MAP_PROJECTION,
        format: "image/png"
      };

      // Use params from urlObj if present, otherwise use default
      const params = {};
      Object.keys(defaultParams).forEach(key => {
        const lowerKey = key.toLowerCase();
        params[lowerKey] = urlObj.params[lowerKey] !== undefined ? urlObj.params[lowerKey] : defaultParams[key];
      });

      // Add any other params from urlObj that are not in defaultParams
      Object.keys(urlObj.params).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (!(lowerKey in params)) {
          params[lowerKey] = urlObj.params[key];
        }
      });

      // Build query string
      const query = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      return `${urlObj.baseUrl}?${query}`;
    },
    testAllLayers() {
      Object.values(this.layers).forEach(layer => {
        const bogus_transformed_extent = this.getBogusTransformedExtent(layer.country_code);
      
        var url = layer.source_url.slice()
        .replaceAll('[layer_name]', layer.layer_name)
        .replaceAll('[layer_name_detail]', layer.layer_name_detail)
        .replaceAll('[layer_projection]', layer.layer_projection)
        .replaceAll('[extent]', bogus_transformed_extent)
        .replaceAll('{z}', 13)
        .replaceAll('{y}', 4426)
        .replaceAll('{x}', 2779)
        
        const urlObj = this.parseUrlToObject(url);
        
        if (layer.type == "WMS") {
          url = this.getWMSURL(layer, urlObj);
          this.$set(this.pingURLs, layer.id, url);
          // Do NOT call pingLayer for WMS, let <img> handle it
          this.$set(this.pingResults, layer.id, '...');
        } else {
          this.$set(this.pingURLs, layer.id, url);
          if (url) {
            this.pingLayer(url, layer.id);
          } else {
            this.$set(this.pingResults, layer.id, 'N/A');
          }
        }
      });
    },
    githubLink(id) {
      // Example: convert local url to github path
      // Assumes url like 'js/layers/clc_2018.json'
      return 'https://github.com/MVagroecology/lucim/blob/master/js/layers/' + id + '.json';
    }
  }
}
</script>

<template>
  <div class="lpis-sustainability-compass">
    <div class="row">
      <div class="col-12 mb-2">
        <div class="card">
          <div class="card-body">
            <p class="text-center"><strong>Available layers current status</strong></p>
            <table class="table table-bordered ping-table">
              <thead>
                <tr>
                  <th style="width:20%" class="align-middle">Name</th>
                  <th style="width:35%" class="align-middle">URL</th>
                  <th style="width:15%" class="text-center align-middle">Preview</th>
                  <th style="width:15%" class="text-center align-middle">Ping</th>
                  <th style="width:15%" class="text-center align-middle">GitHub</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="layer in layers" :key="layer.id">
                  <td>{{ layer.name || layer.id }}</td>
                  <td class="wrap-url text-smaller">
                    <a :href="pingURLs[layer.id]" target="_blank">{{ pingURLs[layer.id] }}</a>
                  </td>
                  <td class="preview text-smaller text-center">
                    <template v-if="layer.type === 'WMS'">
                      <img
                        :src="pingURLs[layer.id]"
                        alt="WMS preview"
                        style="max-width:100px; margin-top:4px;"
                        @load="pingResults[layer.id] = 'OK'"
                        @error="pingResults[layer.id] = 'FAIL'"
                      />
                    </template>
                    <template v-if="layer.type === 'tileXYZ'">
                      <img
                        :src="pingURLs[layer.id]"
                        alt="tileXYZ preview"
                        style="max-width:100px; margin-top:4px;"
                      />
                    </template>
                    <template v-if="layer.type === 'WFS'">
                      <p>{{ pingPreview[layer.id] }}</p>
                    </template>
                  </td>
                  <td class="text-center">
                    <span v-if="pingResults[layer.id] == 'OK'" class="text-success"><i class="fas fa-check-square"></i> {{ pingResults[layer.id] }}</span>
                    <span v-else-if="pingResults[layer.id] == 'FAIL'" class="text-danger"><i class="fas fa-exclamaion-triangle"></i> {{ pingResults[layer.id] }}</span>
                    <span v-else>...</span>
                  </td>
                  <td class="text-center">
                    <a :href="githubLink(layer.id)" target="_blank">Edit file</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>