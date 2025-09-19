<script>
module.exports = {
  name: "compass-log",
  data() {
    return {
    }
  }
}
</script>

<template>
  <div class="lpis-sustainability-compass">
    <div class="row">
      <div class="col-6 mb-2">
        <div class="card">
          <div class="card-body">
            <p>GitHub Code Repository</p>
            <p><a target="_blank" href="https://github.com/MVagroecology/lucim">https://github.com/MVagroecology/lucim</a></p>
          </div>
        </div>
      </div>
      <div class="col-6 mb-2">
        <div class="card">
          <div class="card-body">
            <p><b>Log of latest improvements:</b></p>
            <div class="row">
              <div class="col-3"><p><em>2025-09-19</em></p></div>
              <div class="col-9"><p>Improved layer list display; LPIS layers filtered by countries currently in view; map center, zoom and active layers in the url query params; implemented layer status checker at <router-link to="/lpis-sustainability-compass/layer-status">/lpis-sustainability-compass/layer-status</router-link></p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
