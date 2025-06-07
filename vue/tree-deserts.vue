<script>
module.exports = {
  name: "tree-deserts",
  data() {
      return {
        map: null
      }
  },
  mounted() {
    this.createMap()
  },
  methods: {
    createMap() {
        this.map = eurostatmap
            .map("ch")
            .title("Tree cover density in agricultural areas")
            .scale("60M") // "03M" "10M" "20M" "60M "010"
            .nutsYear(2021)
            .nutsLvl(3)
            .stat({ csvURL: "data/tree-deserts/all_clean.csv", geoCol: "NUTS3", valueCol: "p_zero" } )
            .classifMethod("threshold").threshold([0,10,20,30,40,50,60,70,80,90,100])
            .tooltip({ showFlags: false })
            .colors(["#fff5f0","#fee3d6","#fdc9b4","#fcaa8e","#fc8a6b","#f9694c","#ef4533","#d92723","#bb151a","#970b13","#67000d"])
            .legend({ x:500, y:80, title: "% agricultural hectares with zero trees"  })
            .showSourceLink(false)
            
        this.map.svgId("tree-deserts-map")
        this.map.build();
    },
    saveAsPNG() {
        this.map.exportMapToPNG()
    },
    saveAsSVG() {
        this.map.exportMapToSVG()
    }
  }
}
</script>

<template>
    <div class="tree-deserts">
        <div class="row no-gutters">
            <div class="col-2">
                <router-link class="btn btn-back" to="/" tag="button">
                <span class="d-none d-sm-block">Back to <b>homepage</b></span>
                <i class="fa fa-home d-sm-none"></i>
                </router-link>
            </div>
            <div class="col-8">
                <h3 class="tree-deserts-title text-center">
                Tree Deserts in Europe
                </h3>
            </div>
            <div class="col-2"></div>
        </div>
        <div class="row">
            <div class="col-5">
                <div class="card text-justify">
                    <div class="card-body">
                        <p class="mb-0"><a target="_blank" href="https://land.copernicus.eu/en/products/high-resolution-layer-tree-cover-density">Copernicus tree-cover-density data</a> superimposed on <a href="https://land.copernicus.eu/en/products/corine-land-cover/clc2018" target="_blank">Corine grassland and cropland land-cover at 100m resolution (2018)</a>. Data shows the % of grassland/cropland with zero tree cover. See EURAF <a href="https://zenodo.org/record/8075187" target="_blank">Policy Briefing #26</a> for further details.</p>
                    </div>
                </div>
            </div>
            <div class="col-7 text-center">
                <svg id="tree-deserts-map"></svg>
                <div>
                    <button @click="saveAsPNG()" class="btn">&#8595; png</button>
                    <button @click="saveAsSVG()" class="btn">&#8595; svg</button>
                </div>
            </div>
        </div>
    </div>
</template>