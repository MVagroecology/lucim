<script>
module.exports = {
  name: "resilient-land-uses",
  data() {
    return {
		  currentScreen: 'region',
		  imgSrc: 'ipcc_ar6_wg2_chp13_fig13.1.png',
      selectedRegion: null,
      selectedBaselineSystem: null,
      selectedClimateImpact: null,
      selectedLandUse: null,
      selectedCaseStudy: null,
      descriptions: [],
      themes_list: [],
      filteredDescriptions: [],
      resilientLandUses: [], // All resilient land uses from CSV
      filteredResilientLandUses: [], // Resilient land uses based on user's selections
      caseStudies: [], // All resilient land uses from CSV
      filteredCaseStudies: [], // Resilient land uses based on user's selections
      themeReferences: {
        trade_offs: [],
        caveats: [],
        exposure: [],
        adaptive_capacity: [],
        sensitivity: []
      },
      references: [],
    }
  },
  created() {
    this.loadData()
	},
  computed: {
		currentCaseStudy() {
			return this.caseStudies[this.selectedCaseStudy-1]
		},
		filteredReferences() {
			var adaptive_capacity = this.themeReferences.adaptive_capacity.reduce((accum, curr) => accum.concat(curr[1]), [])
			var exposure = this.themeReferences.exposure.reduce((accum, curr) => accum.concat(curr[1]), [])
			var sensitivity = this.themeReferences.sensitivity.reduce((accum, curr) => accum.concat(curr[1]), [])
			var caveats = this.themeReferences.caveats.reduce((accum, curr) => accum.concat(curr[1]), [])
			var trade_offs = this.themeReferences.trade_offs.reduce((accum, curr) => accum.concat(curr[1]), [])
			var refs = adaptive_capacity.concat(exposure).concat(caveats).concat(trade_offs).concat(sensitivity)
			
			refs = [...new Set(refs)];
			refs.sort((a, b) => a.id - b.id)
			return refs
		}
  },
  methods: {
		selectRegion(region) {
			this.selectedApp = 'Land-use models'
			this.selectedRegion = region;
			this.filterDescriptions();
			this.currentScreen = 'baselineSystem';
		},
		switchMap(region_code) {
			if (region_code == 'original') {
				this.imgSrc = 'ipcc_ar6_wg2_chp13_fig13.1.png'
			} else {
				this.imgSrc = 'ipcc_ar6_wg2_chp13_fig13.1_' + region_code + '.png'
			}
		},
		goBack() {
			if (this.currentScreen === 'map') {
				this.currentScreen = 'intro';
			} else if (this.currentScreen === 'region') {
				this.currentScreen = 'intro';
			} else if (this.currentScreen === 'baselineSystem') {
				this.selectedRegion = null;
				this.currentScreen = 'region';
			} else if (this.currentScreen === 'climateImpact') {
				this.selectedBaselineSystem = null;
				this.currentScreen = 'baselineSystem';
			} else if (this.currentScreen === 'resilientLandUses') {
				this.selectedClimateImpact = null;
				this.currentScreen = 'climateImpact';
			}
		},
		goToRegion() {
			this.currentScreen = 'region';
		},
		goToBaselineSystem() {
			this.currentScreen = 'baselineSystem';
		},
		goToClimateImpact() {
			this.currentScreen = 'climateImpact';
		},
		goToLandUses() {
			var _this = this
			this.currentScreen = 'resilientLandUses';
			if (this.selectedLandUse) {
				this.$nextTick(function() {
					var idx = _this.filteredResilientLandUses.map(x => x["Agroforestry/Mixed farming type"]).indexOf(_this.selectedLandUse)
					_this.addChart(idx)
				})
			}
		},
		goToCaseStudy(id) {
			this.currentScreen = 'caseStudy';
			this.selectedCaseStudy = id
		},
		selectBaselineSystem(baselineSystem) {
			this.selectedBaselineSystem = baselineSystem;
			this.currentScreen = 'climateImpact';
		},
		selectClimateImpact(climateImpact) {
			this.selectedClimateImpact = climateImpact;
			this.clearReferences()
			this.currentScreen = 'resilientLandUses';
			this.filterResilientLandUses();
			$('#proposed-resilient-land-uses button').on('click', function (event) {
				event.preventDefault()
				$(this).tab('show')
			})
			if (!this.selectedLandUse && this.filteredResilientLandUses.length > 0) {
				this.selectLandUse(this.filteredResilientLandUses[0], 0)
				/*this.selectedLandUse = this.filteredResilientLandUses[0]['Agroforestry/Mixed farming type']
				this.$nextTick(function () {
					this_.addChart(0)
					$(function () {
						$('[data-toggle="tooltip"]').tooltip()
						$('[data-toggle=tooltip]').on('shown.bs.tooltip', function () {
							$(".tooltip-inner").click(function(e){
									$('[data-toggle=tooltip]').tooltip("hide");
							});
					});
					})
				})*/
			}
		},
		selectLandUse(landuse, idx) {
			var this_ = this
			this.selectedApp = 'Land-use models'
			this.clearReferences()
			this.selectedLandUse = landuse['Agroforestry/Mixed farming type'];
			this.filterCaseStudies();
			this.getThemeAdaptiveCapacityStrings(landuse)
			this.getThemeCaveatsStrings(landuse)
			this.getThemeExposureStrings(landuse)
			this.getThemeSensitivityStrings(landuse)
			this.getThemeTradeOffsStrings(landuse)
			this.$nextTick(function () {
				this_.addChart(idx)
				$(function () {
					$('[data-toggle="tooltip"]').tooltip()
					$('[data-toggle=tooltip]').on('shown.bs.tooltip', function () {
						$(".tooltip-inner").click(function(e){
								$('[data-toggle=tooltip]').tooltip("hide");
						});
				});
				})
			})
		},
		returnToRegion() {
			this.selectedRegion = null;
			this.currentScreen = 'region';
		},
		returnToBaselineSystem() {
			this.selectedBaselineSystem = null;
			this.currentScreen = 'baselineSystem';
		},
		returnToClimateImpact() {
			this.selectedClimateImpact = null;
			this.currentScreen = 'climateImpact';
		},    
		filterResilientLandUses() {
			// Filter resilient land uses based on user's selections
			this.filteredResilientLandUses = this.resilientLandUses.filter(item => {
				return (
					(item["Climate region"] === "All" || item["Climate region"] === this.selectedRegion) &&
					item["Baseline system"] === this.selectedBaselineSystem &&
					(item[this.selectedClimateImpact] === 'Much higher' || item[this.selectedClimateImpact] === 'Higher' || item[this.selectedClimateImpact] === 'Considerably higher' || item[this.selectedClimateImpact] === 'Same')
				);
			})//.map(item => item["Agroforestry/Mixed farming type"]);
		},
		filterCaseStudies() {
			this.filteredCaseStudies = this.caseStudies.filter(item => {
				return (
					item["climate_zone"] === this.selectedRegion &&
					item["land_use"] === this.selectedLandUse
				);
			})
		},
		hasCaseStudies() {
			return this.filteredCaseStudies.length > 0
		},
		hasLiterature() {
			return this.filteredReferences.length > 0
		},
		filterDescriptions() {
			this.filteredDescriptions = this.descriptions.filter(item => {
				return item["Climate region"] === this.selectedRegion
			});
		},
		getClimateImpactDescription(climateImpact) {
			return this.descriptions.filter(item => {
				return item["Climate region"] === this.selectedRegion && item["Climate impact driver"] === climateImpact
			})[0]['Description'];
		},
		getClimateImpactProjection(climateImpact) {
			return this.descriptions.filter(item => {
				return item["Climate region"] === this.selectedRegion && item["Climate impact driver"] === climateImpact
			})[0]['Projection'];
		},
		addChart(idx) {
			var classesArr = [
				[ "Much higher", 5],
				[ "Higher", 4],
				[ "Same", 3],
				[ "Lower", 2],
				[ "Much lower", 1],
				[ "Unknown/No consensus", 0]
			]

			var landUse = this.filteredResilientLandUses[idx]
			
			function getValue(climateImpact) {
				if (landUse[climateImpact] == "Unknown" || landUse[climateImpact] == "No consensus") return 0
				return classesArr.filter(arr => arr[0] == landUse[climateImpact])[0][1]
			}

			var data = [
				{ value: getValue('Cold extremes'), axis: 'Cold extremes' },
				{ value: getValue('Heat extremes'), axis: 'Heat extremes' },
				{ value: getValue('Mean temperature'), axis: 'Mean temperature' },
				{ value: getValue('Windstorms'), axis: 'Windstorms' },
				{ value: getValue('Extreme precipitation'), axis: 'Extreme precipitation' },
				{ value: getValue('Drought'), axis: 'Drought' },
				{ value: getValue('Mean precipitation'), axis: 'Mean precipitation' },
			];

			var el_width = 450
			var el_height = 300

			// Set the dimensions and margins of the graph
			var margin = {top: 60, right: 70, bottom: 70, left: 140}
			var height = el_height - margin.top - margin.bottom
			var width = height// el_width - margin.left - margin.right
			var innerRadius = 20
			var outerRadius = (Math.min(width, height) / 2)

			//Remove whatever chart with the same id/class was present before
			d3.select("#chart-" + idx).select("svg").remove();

			// Append the SVG object
			var svg = d3.select("#chart-" + idx)
				.append("svg")
					.attr("width", el_width) //width + margin.left + margin.right)
					.attr("height", el_height) //height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

			// Color scale
			var colorScale = d3.scaleSequential()
				.interpolator(d3.interpolateRdYlGn) // Red to green color scale
				.domain([0, 5]); // value range

			// Scales
			var x = d3.scaleBand()
					.range([0, 2 * Math.PI])
					.align(0)
					.domain(data.map(function(d) { return d.axis; }));

			var y = d3.scaleRadial()
					.range([innerRadius, outerRadius])
					.domain([0, 5]);

			// Add the bars
			svg.append("g")
				.selectAll("path")
				.data(data)
				.enter()
				.append("path")
					.attr("fill", function(d) { return colorScale(d.value); }) // Color based on the value
					.attr("d", d3.arc()
							.innerRadius(innerRadius)
							.outerRadius(function(d) { return y(d['value']); })
							.startAngle(function(d) { return x(d.axis); })
							.endAngle(function(d) { return x(d.axis) + x.bandwidth(); })
							.padAngle(0.01)
							.padRadius(innerRadius));

			// Add the labels
			svg.append("g")
				.selectAll("g")
				.data(data)
				.enter()
				.append("g")
					.attr("text-anchor", function(d) { return (x(d.axis) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
					.attr("transform", function(d) {
						return "rotate(" + ((x(d.axis) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" +
									"translate(" + (y(d['value']) + 10) + ",0)" +
									((x(d.axis) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : ""); 
					})
				.selectAll("text")
				.data(function(d) { return d.axis.split(' '); }) // Split country names at space character
				.enter()
				.append("text")
					.text(function(d) { return d; })
					.style("font-size", "11px")
					.style("font-family", "Poppins")
					.attr("dy", function(d,i) {
						if (i == 0) {
							return "-0.5em"
						} else {
							return "0.5em"
						}
					})

			// Add legend
			var legend = svg.append("g")
					//.attr("transform", "translate(" + (-width+margin.left) + "," + height + ")");
					.attr("transform", "translate(-220," + (-height+30) + ")")

			var legendRectSize = 10;
			var legendSpacing = 3;

			var legendItems = legend.selectAll(".legend-item")
					.data(classesArr)
					.enter()
					.append("g")
					.attr("class", "legend-item")
					.attr("transform", function(d, i) { return "translate(0," + i * (legendRectSize + legendSpacing) + ")"; });

			legendItems.append("rect")
					.attr("width", legendRectSize)
					.attr("height", legendRectSize)
					.style("fill", function(d,i) {
						if (d[1] === 0) return "white"
						return colorScale(d[1])
					})
					.style("stroke", function(d,i) {
						if (d[1] === 0) return "gray"
						return colorScale(d[1])
					})

			legendItems.append("text")
					.attr("x", legendRectSize + legendSpacing)
					.attr("y", legendRectSize - legendSpacing+1)
					.text(function(d) { return d[0]; })
					.style("font-size", "10px")
					.style("font-family", "Poppins")
		},
		hasTheme(str, resilientLandUse) {
			return this.themeReferences[str.substring(0, str.length - 1)].length > 0
		},
		hasThemeExposure(resilientLandUse) {
			return this.hasTheme("exposure_", resilientLandUse)
		},
		hasThemeSensitivity(resilientLandUse) {
			return this.hasTheme("sensitivity_", resilientLandUse)
		},
		hasThemeAdaptiveCapacity(resilientLandUse) {
			return this.hasTheme("adaptive_capacity_", resilientLandUse)
		},
		hasThemeCaveats(resilientLandUse) {
			return this.hasTheme("caveats_", resilientLandUse)
		},
		hasThemeTradeOffs(resilientLandUse) {
			return this.hasTheme("trade_offs_", resilientLandUse)
		},
		getThemeStrings(str, resilientLandUse, toGetRefs = false) {
			var this_ = this
			var i = 1
			var key = str + i
			var arr = []
			while (Object.keys(resilientLandUse).includes(key)) {
				if (resilientLandUse[key].toLowerCase() == 'x') {
					var theme = this.themes_list.filter(row => row.code == key)[0]
					var references = []
					if (toGetRefs) {
						references = this.references.filter(function(reference) {
							return reference[key].toLowerCase() == 'x' && reference[this_.selectedRegion].toLowerCase() == 'x' && reference[this_.selectedLandUse].toLowerCase() == 'x' 
						})
					}
					arr.push([theme, references])
				}
				i++
				key = str + i
			}
			this.$set(this.themeReferences, str.substring(0, str.length - 1), arr.slice())
		},
		getThemeExposureStrings(resilientLandUse) {
			return this.getThemeStrings('exposure_', resilientLandUse, true)
		},
		getThemeSensitivityStrings(resilientLandUse) {
			return this.getThemeStrings('sensitivity_', resilientLandUse, true)
		},
		getThemeAdaptiveCapacityStrings(resilientLandUse) {
			return this.getThemeStrings('adaptive_capacity_', resilientLandUse, true)
		},
		getThemeCaveatsStrings(resilientLandUse) {
			return this.getThemeStrings('caveats_', resilientLandUse)
		},
		getThemeTradeOffsStrings(resilientLandUse) {
			return this.getThemeStrings('trade_offs_', resilientLandUse)
		},
		smallAbstract(reference) {
			var nr_words = 100
			return '<p class="text-justify">' + reference['Abstract Note'].split(" ").splice(0, nr_words).join(" ") + '...' + (reference.Url ? ' <a href="' + reference.Url  + '" target="_blank">Keep reading in original publication - DOI</a></p>' : '')
		},
		smallAuthor(reference) {
			if (reference.Author.split(";").length > 1) {
				return reference.Author.substring(0, reference.Author.indexOf(',')) + ' et al.'
			} else {
				return reference.Author.substring(0, reference.Author.indexOf(','))
			}
		},
		clearReferences() {
			this.themeReferences = {
				trade_offs: [],
				caveats: [],
				exposure: [],
				adaptive_capacity: [],
				sensitivity: []
			}
		},
		loadData() {
			// Load CSV data on component mount
			fetch('data/data.csv')
				.then(response => response.text())
				.then(csv => {
					const rows = Papa.parse(csv).data
					const headers = rows[0]
					this.resilientLandUses = rows.slice(1).map(values => {
						return headers.reduce((obj, header, index) => {
							obj[header.trim()] = values[index].trim();
							return obj;
						}, {});
					});
				});

			fetch('data/descriptions.csv')
				.then(response => response.text())
				.then(csv => {
					const rows = Papa.parse(csv).data
					const headers = rows[0]
					this.descriptions = rows.slice(1).map(values => {
						return headers.reduce((obj, header, index) => {
							obj[header.trim()] = values[index].trim();
							return obj;
						}, {});
					});
				});
				
			fetch('data/themes_list.csv')
				.then(response => response.text())
				.then(csv => {
					const rows = Papa.parse(csv).data
					const headers = rows[0]
					this.themes_list = rows.slice(1).map(values => {
						return headers.reduce((obj, header, index) => {
							obj[header.trim()] = values[index].trim();
							return obj;
						}, {});
					});
				});

			fetch('data/case_studies.csv')
				.then(response => response.text())
				.then(csv => {
					const rows = Papa.parse(csv).data
					const headers = rows[0]
					this.caseStudies = rows.slice(1).map(values => {
						return headers.reduce((obj, header, index) => {
							obj[header.trim()] = values[index].trim();
							return obj;
						}, {});
					});
				});

			fetch('data/literature_review.csv')
				.then(response => response.text())
				.then(csv => {
					const rows = Papa.parse(csv).data
					const headers = rows[0]
					headers.push('id')
					var i = 1
					this.references = rows.slice(1).map(values => {
						return headers.reduce((obj, header, index) => {
							if (header == 'id') {
								obj.id = i
								i++
							} else {
								obj[header.trim()] = values[index].trim();
							}
							return obj;
						}, {});
					});
				});
		}
  }
}
</script>

<template>
  <div class="text-center">
    <div class="sticky-top bg-white border-top text-center">
      <div class="row no-gutters my-2">
        <div class="col-2">
          <div class="row no-gutters">
            <div class="col-10 mt-1">
              <router-link class="btn btn-back" to="/" tag="button">Back to <b>homepage</b></router-link>
            </div>
            <div class="col-2 mt-2">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
        <div class="col-10">
          <div class="row no-gutters">
            <div class="col-3">
              <div class="row no-gutters">
                <div class="col-10">
                  <p class="pointer" @click="currentScreen = 'region'">Step 1. <b>Climate Region</b></p>
                  <p v-if="selectedRegion" class="badge" :class="{ 'north': selectedRegion === 'Northern Europe', 'west': selectedRegion === 'Western and Central Europe', 'south': selectedRegion === 'Southern Europe' }">{{ selectedRegion }}</p>
                  <p v-else>-</p>
                </div>
                <div class="col-2 mt-2">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="row no-gutters">
                <div class="col-10">
                  <p class="pointer" @click="currentScreen = 'baselineSystem'">Step 2. <b>Baseline System</b></p>
                  <p v-if="selectedBaselineSystem" class="badge" :class="{ 'bg-crops': selectedBaselineSystem === 'Annual crops', 'bg-livestock': selectedBaselineSystem === 'Livestock', 'bg-orchards': selectedBaselineSystem === 'Orchards', 'bg-forestry': selectedBaselineSystem === 'Forestry' }">{{ selectedBaselineSystem }}</p>
                  <p v-else>-</p>
                </div>
                <div class="col-2 mt-2">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="row no-gutters">
                <div class="col-10 align-middle">
                  <p class="pointer" @click="goToClimateImpact()">Step 3. <b>Climate Impact Driver</b></p>
                  <p v-if="selectedClimateImpact" class="badge" :class="{ 'bg-temperature': ['Cold extremes', 'Heat extremes', 'Mean temperature'].includes(selectedClimateImpact), 'bg-precipitation': ['Extreme precipitation', 'Drought', 'Mean precipitation'].includes(selectedClimateImpact), 'bg-wind': ['Windstorms'].includes(selectedClimateImpact) }">{{ selectedClimateImpact }}</p>
                  <p v-else>-</p>
                </div>
                <div class="col-2 mt-2">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="row no-gutters">
                <div class="col-10">
                  <p class="pointer" @click="goToLandUses()"><b>Resilient Land Use</b></p>
                  <p class="land-use badge bg-land-use" v-if="selectedLandUse">{{ selectedLandUse }}</p>
                  <p v-else>-</p>
                </div>
                <div class="col-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="currentScreen === 'region'">
        <h2>
          Step 1. Choose your <b>Climate Region</b>
        </h2>
        <div class="region">
          <div class="card mb-4">
            <div class="card-body row">
              <div class="col-1"></div>
              <div class="col-4 text-left badges">
                <p class="mb-4"><b>Please select your climate region</b> from the three subdivisions of land area for Europe:</p>
                <p :class="{ 'selected': selectedRegion === 'Northern Europe' }"><p class="badge north pointer mb-0" @click="selectRegion('Northern Europe')" @mouseover="switchMap('north')" @mouseleave="switchMap('original')">Northern Europe</p></p>
                <p :class="{ 'selected': selectedRegion === 'Western and Central Europe' }"><p class="badge west pointer mb-0" @click="selectRegion('Western and Central Europe')" @mouseover="switchMap('west')" @mouseleave="switchMap('original')">Western and Central Europe</p></p>
                <p :class="{ 'selected': selectedRegion === 'Southern Europe' }"><p class="badge south pointer mb-0" @click="selectRegion('Southern Europe')" @mouseover="switchMap('south')" @mouseleave="switchMap('original')">Southern Europe</p></p>
              </div>
              <div class="col-7">
                <img id="ipcc-regions" :src='"img/climate_regions/" + imgSrc'>
              </div>
            </div>
          </div>
          <p class="note text-left">These subdivisions are based on the Sixth Assessment Report (<a href="https://doi.org/10.1017/9781009325844.015" target="_blank">Bednar-Friedl et al., 2022</a>), specifically Chapter 13 (Europe), by the Intergovernmental Panel on Climate Change (IPCC).</p>
        </div>
      </template>

      <div v-else-if="currentScreen === 'baselineSystem'">
        <h2>
          Step 2. Select a <b>Baseline System</b>
        </h2>
        <div class="baseline row">
          <div class="col-3 mb-3">
            <div class="card pointer">
              <div class="card-body" :class="{ 'selected': selectedBaselineSystem === 'Annual crops' }">
                <h5 class="card-title"><p class="badge bg-crops pointer" @click="selectBaselineSystem('Annual crops')">Annual crops</p></h5>
                
                <div id="cropsExamples" class="carousel slide" data-ride="carousel">
                  <ol class="carousel-indicators">
                    <li data-target="#cropsExamples" data-slide-to="0" class="active"></li>
                    <li data-target="#cropsExamples" data-slide-to="1"></li>
                    <li data-target="#cropsExamples" data-slide-to="2"></li>
                  </ol>
                  <div class="carousel-inner">
                    <div class="carousel-item active" style="background-image: url(img/baseline_systems/crops_02.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/crops_01.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/crops_03.jpg);">
                    </div>
                  </div>
                  <a class="carousel-control-prev" href="#cropsExamples" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#cropsExamples" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-3 mb-3">
            <div class="card pointer">
              <div class="card-body" :class="{ 'selected': selectedBaselineSystem === 'Livestock' }">
                <h5 class="card-title"><p class="badge bg-livestock pointer" @click="selectBaselineSystem('Livestock')">Livestock</p></h5>
                
                <div id="livestockExamples" class="carousel slide" data-ride="carousel">
                  <ol class="carousel-indicators">
                    <li data-target="#livestockExamples" data-slide-to="0" class="active"></li>
                    <li data-target="#livestockExamples" data-slide-to="1"></li>
                    <li data-target="#livestockExamples" data-slide-to="2"></li>
                  </ol>
                  <div class="carousel-inner">
                    <div class="carousel-item active" style="background-image: url(img/baseline_systems/livestock_01.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/livestock_02.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/livestock_03.jpg);">
                    </div>
                  </div>
                  <a class="carousel-control-prev" href="#livestockExamples" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#livestockExamples" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-3 mb-3">
            <div class="card pointer">
              <div class="card-body" :class="{ 'selected': selectedBaselineSystem === 'Orchards' }">
                <h5 class="card-title"><p class="badge bg-orchards pointer" @click="selectBaselineSystem('Orchards')">Orchards</p></h5>
                
                <div id="orchardsExamples" class="carousel slide" data-ride="carousel">
                  <ol class="carousel-indicators">
                    <li data-target="#orchardsExamples" data-slide-to="0" class="active"></li>
                    <li data-target="#orchardsExamples" data-slide-to="1"></li>
                    <li data-target="#orchardsExamples" data-slide-to="2"></li>
                  </ol>
                  <div class="carousel-inner">
                    <div class="carousel-item active" style="background-image: url(img/baseline_systems/orchards_02.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/orchards_01.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/orchards_03.jpg);">
                    </div>
                  </div>
                  <a class="carousel-control-prev" href="#orchardsExamples" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#orchardsExamples" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-3 mb-3">
            <div class="card pointer">
              <div class="card-body" :class="{ 'selected': selectedBaselineSystem === 'Forestry' }">
                <h5 class="card-title"><p class="badge bg-forestry pointer" @click="selectBaselineSystem('Forestry')">Forestry</p></h5>
                
                <div id="forestryExamples" class="carousel slide" data-ride="carousel">
                  <ol class="carousel-indicators">
                    <li data-target="#forestryExamples" data-slide-to="0" class="active"></li>
                    <li data-target="#forestryExamples" data-slide-to="1"></li>
                    <li data-target="#forestryExamples" data-slide-to="2"></li>
                  </ol>
                  <div class="carousel-inner">
                    <div class="carousel-item active" style="background-image: url(img/baseline_systems/forestry_01.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/forestry_02.jpg);">
                    </div>
                    <div class="carousel-item" style="background-image: url(img/baseline_systems/forestry_03.jpg);">
                    </div>
                  </div>
                  <a class="carousel-control-prev" href="#forestryExamples" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#forestryExamples" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentScreen === 'climateImpact'">
        <h2>
          Step 3. Select a <b>Climate Impact Driver</b>
        </h2>
        <div class="row impacts">
          <div class="col-sm-4 temperature">
            <h5 class="impact-title"><i class="fas fa-thermometer-three-quarters"></i> Temperature</h5>
            <div class="my-3" v-for="climateImpactDriver in [ 'Cold extremes', 'Heat extremes', 'Mean temperature' ]">
              <div class="card pointer" @click="selectClimateImpact(climateImpactDriver)">
                <div class="card-body" :class="{ 'selected': selectedClimateImpact === climateImpactDriver }">
                  <div class="row">
                    <div class="col-12"><h5 class="card-title"><p class="badge pointer">{{ climateImpactDriver }}</p> <i :class="{ 'fa-arrow-trend-up': getClimateImpactProjection(climateImpactDriver) === 'Increase', 'fa-arrow-trend-down': getClimateImpactProjection(climateImpactDriver) === 'Decrease', 'fa-arrows-alt-v': getClimateImpactProjection(climateImpactDriver) === 'Unknown' }" class="fas"></i></h5></div>
                    <div class="col-12"><p class="card-text text-left" v-html="getClimateImpactDescription(climateImpactDriver)"></p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-4 precipitation">
            <h5 class="impact-title"><i class="fas fa-cloud-showers-heavy"></i> Precipitation</h5>
            <div class="my-3" v-for="climateImpactDriver in [ 'Extreme precipitation', 'Drought', 'Mean precipitation' ]">
              <div class="card pointer" @click="selectClimateImpact(climateImpactDriver)">
                <div class="card-body" :class="{ 'selected': selectedClimateImpact === climateImpactDriver }">
                  <div class="row">
                    <div class="col-12"><h5 class="card-title"><p class="badge pointer">{{ climateImpactDriver }}</p> <i :class="{ 'fa-arrow-trend-up': getClimateImpactProjection(climateImpactDriver) === 'Increase', 'fa-arrow-trend-down': getClimateImpactProjection(climateImpactDriver) === 'Decrease', 'fa-arrows-alt-v': getClimateImpactProjection(climateImpactDriver) === 'Unknown' }" class="fas"></i></h5></div>
                    <div class="col-12"><p class="card-text text-left" v-html="getClimateImpactDescription(climateImpactDriver)"></p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-4 wind">
            <h5 class="impact-title"><i class="fas fa-wind"></i> Wind</h5>
            <div class="my-3" v-for="climateImpactDriver in [ 'Windstorms' ]">
              <div class="card pointer" @click="selectClimateImpact(climateImpactDriver)">
                <div class="card-body" :class="{ 'selected': selectedClimateImpact === climateImpactDriver }">
                  <div class="row">
                    <div class="col-12"><h5 class="card-title"><p class="badge pointer" @click="selectClimateImpact(climateImpactDriver)">{{ climateImpactDriver }}</p> <i :class="{ 'fa-arrow-trend-up': getClimateImpactProjection(climateImpactDriver) === 'Increase', 'fa-arrow-trend-down': getClimateImpactProjection(climateImpactDriver) === 'Decrease', 'fa-arrows-alt-v': getClimateImpactProjection(climateImpactDriver) === 'Unknown' }" class="fas"></i></h5></div>
                    <div class="col-12"><p class="card-text text-left" v-html="getClimateImpactDescription(climateImpactDriver)"></p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentScreen === 'resilientLandUses'">
        <h2>
          <b>Resilient Land Uses</b>
        </h2>
        <div class="land-uses row">
          <div class="col-12">
            <div class="nav flex-row nav-pills" id="proposed-resilient-land-uses" role="tablist" aria-orientation="horizontal">
              <button class="nav-link" :class="{ 'show active': selectedLandUse == resilientLandUse['Agroforestry/Mixed farming type'] }" :id="'landuse-' + idx + '-tab'" stype="button" role="tab" v-for="resilientLandUse, idx in filteredResilientLandUses" :key="'landuse-' + idx + '-tab'" @click="selectLandUse(resilientLandUse, idx)">
                <p>{{resilientLandUse['Agroforestry/Mixed farming type']}}</p>
              </button>
            </div>
          </div>
          <div class="col-12">
            <div class="tab-content">
              <div class="tab-pane text-left" :class="{ 'show active': selectedLandUse == resilientLandUse['Agroforestry/Mixed farming type'] }" :id="'landuse-' + idx" role="tabpanel" v-for="resilientLandUse, idx in filteredResilientLandUses" :key="'landuse-' + idx">
                  <div class="card">
                    <div class="card-body">
                      <div class="row land-use-title-row">
                        <div class="col-4 text-center">
                          <div :id="'chart-' + idx"></div>
                        </div>
                        <div class="col-8 text-center">
                          <div class="row">
                            <div class="col-6">
                              <h5 class="badge land-use-title">{{resilientLandUse['Agroforestry/Mixed farming type']}}</h5>
                              <div class="row text-left">
                                <div class="col-5"><p><b>Climate region</b></p></div>
                                <div class="col-7"><h5 class="badge" :class="{ 'north': selectedRegion === 'Northern Europe', 'west': selectedRegion === 'Western and Central Europe', 'south': selectedRegion === 'Southern Europe' }">{{ selectedRegion }}</h5></div>
                                <div class="col-5"><p><b>Baseline system</b></p></div>
                                <div class="col-7"><h5 class="badge" :class="{ 'bg-crops': resilientLandUse['Baseline system'] === 'Annual crops', 'bg-livestock': resilientLandUse['Baseline system'] === 'Livestock', 'bg-orchards': resilientLandUse['Baseline system'] === 'Orchards', 'bg-forestry': resilientLandUse['Baseline system'] === 'Forestry' }">{{resilientLandUse['Baseline system']}}</h5></div>
                              </div>
                            </div>
                            <div class="col-6 land-use-img">
                              <img v-if="resilientLandUse['Image']" class="card-img mb-4" :src="'img/land_uses/' + resilientLandUse['Image']">
                            </div>
                            <div class="col-12 text-justify"><p>{{resilientLandUse['Description']}}</p></div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-4 resilience-column">
                          <div class="row">
                            <div class="col-12">
                              <p><b>Why this system is more resilient:</b></p>
                              <p v-if="!hasThemeExposure(resilientLandUse) && !hasThemeSensitivity(resilientLandUse) && !hasThemeAdaptiveCapacity(resilientLandUse)"><em>Content being updated.</em></p>
                              <div class="text-smaller" v-if="hasThemeExposure(resilientLandUse)">
                                <p class="pl-2"><b data-toggle="tooltip" data-placement="top" title="The way and extent to which a system is exposed to climate variations.">Exposure</b></p>
                                <ul>
                                  <li v-for="element in themeReferences.exposure"><span data-toggle="tooltip" data-placement="top" :data-original-title="element[0].description">{{element[0].theme}}</span><span v-if="element[1].length > 0"> [<span v-for="ref, idx in element[1]"><span class="pointer" v-if="ref['Abstract Note']" data-toggle="tooltip" data-placement="top" data-trigger="click" data-html="true" :data-original-title="smallAbstract(ref)">{{ref.id}}</span><span v-else>{{ref.id}}</span><span v-if="idx < element[1].length-1">, </span></span>]</span></li>
                                </ul>
                              </div>
                              <div class="text-smaller" v-if="hasThemeSensitivity(resilientLandUse)">
                                <p class="pl-2"><b data-toggle="tooltip" data-placement="top" title="The extent to which a system is affected (negatively or positively) by climate variability or change.">Sensitivity</b></p>
                                <ul>
                                  <li v-for="element in themeReferences.sensitivity"><span data-toggle="tooltip" data-placement="top" :data-original-title="element[0].description">{{element[0].theme}}</span><span v-if="element[1].length > 0"> [<span v-for="ref, idx in element[1]"><span class="pointer" v-if="ref['Abstract Note']" data-toggle="tooltip" data-placement="top" data-trigger="click" data-html="true" :data-original-title="smallAbstract(ref)">{{ref.id}}</span><span v-else>{{ref.id}}</span><span v-if="idx < element[1].length-1">, </span></span>]</span></li>
                                </ul>
                              </div>
                              <div class="text-smaller" v-if="hasThemeAdaptiveCapacity(resilientLandUse)">
                                <p class="pl-2"><b data-toggle="tooltip" data-placement="top" title="The ability (or potential) of a system to adjust successfully to: (i) moderate potential damages, (ii) to take advantage of opportunities and (iii) to cope with the consequences.">Adaptive Capacity</b></p>
                                <ul>
                                  <li v-for="element in themeReferences.adaptive_capacity"><span data-toggle="tooltip" data-placement="top" :data-original-title="element[0].description">{{element[0].theme}}</span><span v-if="element[1].length > 0"> [<span v-for="ref, idx in element[1]"><span class="pointer" v-if="ref['Abstract Note']" data-toggle="tooltip" data-placement="top" data-trigger="click" data-html="true" :data-original-title="smallAbstract(ref)">{{ref.id}}</span><span v-else>{{ref.id}}</span><span v-if="idx < element[1].length-1">, </span></span>]</span></li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="row">
                            <div class="col-12">
                              <p><b>Caveats:</b></p>
                              <p v-if="!hasThemeCaveats(resilientLandUse)"><em>Content being updated.</em></p>
                              <div class="text-smaller" v-if="hasThemeCaveats(resilientLandUse)">
                                <ul>
                                  <li v-for="element in  themeReferences.caveats">{{element[0].theme}}</li>
                                </ul>
                              </div>
                            </div>
                            <div class="col-12">
                              <p><b>Trade-offs:</b></p>
                              <p v-if="!hasThemeTradeOffs(resilientLandUse)"><em>Content being updated.</em></p>
                              <div class="text-smaller" v-if="hasThemeTradeOffs(resilientLandUse)">
                                <ul>
                                  <li v-for="element in themeReferences.trade_offs">{{element[0].theme}}</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="row case-study-cards">
                            <div class="col-12"><p><b>Case studies:</b></p></div>
                            <div class="col-12" v-if="!hasCaseStudies()"><p><em>Content being updated.</em></p>
                            </div>
                            <div class="col-12" v-for="casestudy in filteredCaseStudies" :key="'case-study-' + casestudy['id']">
                              <div class="card mb-2 pointer" @click="goToCaseStudy(casestudy['id'])">
                                <div class="card-body">
                                  <div class="row">
                                    <div class="col-4">
                                      <img :src="'img/case_studies/' + casestudy['photo']" class="card-img">
                                    </div>
                                    <div class="col-8">
                                      <p class="card-title case-study-title">{{casestudy['name']}}</p>
                                      <p class="card-subtitle mt-2 text-muted">{{casestudy['country']}}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="row evidence-base">
                            <div class="col-12"><p><b>Evidence base:</b></p></div>
                            <div class="col-12 text-smaller" v-if="hasLiterature()">
                              <span v-for="ref in filteredReferences">
                                <p>[{{ref.id}}<span class="pointer" v-if="ref['Abstract Note']" data-toggle="tooltip" data-placement="top" data-trigger="click" data-html="true" :data-original-title="smallAbstract(ref)"><i class="far fa-file-alt"></i></span>] {{smallAuthor(ref)}} ({{ref['Publication Year']}}) {{ref.Title}}. <a :href="ref.Url" target="_blank">{{ref.Url}}</a></p>
                              </span>
                            </div>
                            <div class="col-12" v-else><p>Literature review being updated.</p></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <div class="col-12" v-if="filteredResilientLandUses.length == 0">
            <div class="card no-land-use">
              <div class="card-body">
              <p>None of the agroforestry land use models are considered more resilient to this climate impact driver than their forest or orchard baseline system.</p>
              </div>
            </div>
          </div>
        </div>
        <!--div class="card">
          <div class="card-body">
            <h5 class="card-title">Proposed Solutions</h5>
            <ul class="list-group">
              <li v-for="resilientLandUse in filteredResilientLandUses" :key="resilientLandUse" class="list-group-item">{{ resilientLandUse }}</li>
            </ul>
          </div>
        </div-->
      </div>

      <div class="mb-4" v-if="currentScreen === 'caseStudy'">
        <div class="case-studies">
          <div class="card">
            <div class="case-study-title-row">
              <div class="text-center">
                <h5><span class="badge case-study-title">{{currentCaseStudy['name']}}</span> <em>case study</em></h5>
              </div>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-2">
                  <img v-if="currentCaseStudy['photo']" class="img-fluid" :src="'img/case_studies/' + currentCaseStudy['photo']">
                </div>
                <div class="col-5">
                  <div class="row text-left">
                    <div class="col-4"><p><b>Land use</b></p></div>
                    <div class="col-8"><h5 class="badge land-use-title">{{currentCaseStudy['land_use']}}</h5></div>
                  </div>
                  <div class="row text-left">
                    <div class="col-4"><p><b>Climate region</b></p></div>
                    <div class="col-8"><h5 class="badge" :class="{ 'north': currentCaseStudy['climate_zone'] === 'Northern Europe', 'west': currentCaseStudy['climate_zone'] === 'Western and Central Europe', 'south': currentCaseStudy['climate_zone'] === 'Southern Europe' }">{{currentCaseStudy['climate_zone']}}</h5></div>
                  </div>
                </div>
                <div class="col-5">
                  <div class="row">
                    <div class="col-6">
                      <p><i class="fas fa-map-marker-alt"></i> {{currentCaseStudy.country}}</p>
                    </div>
                    <div class="col-6">
                      <p><i class="far fa-map"></i> {{currentCaseStudy.farm_size}} ha</p>
                    </div>
                    <div v-if="currentCaseStudy.website_official_link" class="col-12 text-smaller text-left">
                      <p><i class="fas fa-link"></i> <a :href="currentCaseStudy.website_official_link" target="_blank">{{currentCaseStudy.website_official_text}}</a></p>
                    </div>
                    <div v-if="currentCaseStudy.website_other_1_link" class="col-12 text-smaller text-left">
                      <p><i class="fas fa-link"></i> <a :href="currentCaseStudy.website_other_1_link" target="_blank">{{currentCaseStudy.website_other_1_text}}</a></p>
                    </div>
                    <div v-if="currentCaseStudy.website_other_2_link" class="col-12 text-smaller text-left">
                      <p><i class="fas fa-link"></i> <a :href="currentCaseStudy.website_other_2_link" target="_blank">{{currentCaseStudy.website_other_2_text}}</a></p>
                    </div>
                    <div v-if="currentCaseStudy.website_other_3_link" class="col-12 text-smaller text-left">
                      <p><i class="fas fa-link"></i> <a :href="currentCaseStudy.website_other_3_link" target="_blank">{{currentCaseStudy.website_other_3_text}}</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card mt-4 text-left">
            <div class="card-body">
              <div class="row">
                <div class="col-2"><p><b>Description</b></p></div>
                <div class="col-10"><p>{{currentCaseStudy.description}}</p></div>
              </div>
              <div class="row">
                <div v-if="currentCaseStudy.tree" class="col-4 component-title bg-forestry"><p class="text-center"><i class="fas fa-tree"></i> Tree</p></div>
                <div v-if="currentCaseStudy.tree" class="col-8 component-text bg-forestry-light"><p>{{currentCaseStudy.tree}}</p></div>
                <div v-if="currentCaseStudy.crop" class="col-4 component-title bg-crops"><p class="text-center"><i class="fas fa-seedling"></i> Crops</p></div>
                <div v-if="currentCaseStudy.crop" class="col-8 component-text bg-crops-light"><p>{{currentCaseStudy.crop}}</p></div>
                <div v-if="currentCaseStudy.livestock" class="col-4 component-title bg-livestock"><p class="text-center"><i class="fas fa-horse"></i> Livestock</p></div>
                <div v-if="currentCaseStudy.livestock" class="col-8 component-text bg-livestock-light"><p>{{currentCaseStudy.livestock}}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>
