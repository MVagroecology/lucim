<!-- filepath: c:\xampp\htdocs\tools\dev\lucim\vue\compass-layer-status.vue -->
<script>
module.exports = {
  name: "compass-layer-status",
  data() {
    return {
      layers: [], // Will be filled from parent or imported
      pingResults: {}, // { layer_id: 'OK' | 'FAIL' | '...' }
      pingURLs: {} // { layer_id: 'url' }
    }
  },
  mounted() {
    this.layers = MAP_LAYERS;
    this.testAllLayers();
  },
  methods: {
    getBogusTransformedExtent(countryCode) {
      const extents = {
        PT: "-8.527690206713487,40.933804668527586,-8.510509763917733,40.94039663564075",
        CZ: "739045.375671455,-1059667.7755058946,-728606.277951264,-1053395.8028445581",
      };
      return extents[countryCode] || [0, 0, 0, 0];
    },
    async pingLayer(url, id) {
      try {
        const response = await fetch(url, { method: 'GET' });
        this.$set(this.pingResults, id, response.ok ? 'OK' : 'FAIL');
      } catch (e) {
        this.$set(this.pingResults, id, 'FAIL');
      }
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
        this.$set(this.pingURLs, layer.id, url);
        
        if (url) {
          this.pingLayer(url, layer.id);
        } else {
          this.$set(this.pingResults, layer.id, 'N/A');
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
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th style="width:25%">Name</th>
                  <th style="width:45%">URL</th>
                  <th style="width:15%" class="text-center">Ping</th>
                  <th style="width:15%" class="text-center">GitHub</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="layer in layers" :key="layer.id">
                  <td>{{ layer.name || layer.id }}</td>
                  <td class="wrap-url text-smaller">
                    <a :href="pingURLs[layer.id]" target="_blank">{{ pingURLs[layer.id] }}</a>
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