<script>
module.exports = {
  name: "compass-header",
  data() {
    return {
    }
  }
}
</script>

<template>
  <div class="lpis-sustainability-compass">
    <div class="row"> <!-- top -->
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
      <div class="col-2 text-right">
        <div class="dropdown">
          <button class="btn btn-back btn-copernicus pointer dropdown-toggle" type="button" id="menuDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fas fa-bars"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-right" aria-labelledby="menuDropdown">
            <router-link class="dropdown-item pointer" to="/lpis-sustainability-compass/about">About</router-link>
            <router-link class="dropdown-item pointer" to="/lpis-sustainability-compass/">Map viewer</router-link>
            <router-link class="dropdown-item pointer" to="/lpis-sustainability-compass/layer-status">Layer status</router-link>
            <a class="dropdown-item" href="https://docs.google.com/forms/d/e/1FAIpQLSfpRQTzxsG4rifDJK5qVnv1yfuQl1Gf5hqWRZZf962Nc5Y6zQ/viewform?usp=dialog" target="_blank">Feedback & Ideas</a>
            <router-link class="dropdown-item pointer" to="/lpis-sustainability-compass/log">Latest improvements</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
