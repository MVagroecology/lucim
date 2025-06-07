<script>
module.exports = {
  name: "contents",
  created() {
	},
  computed: {
  },
  methods: {
  }
}
</script>

<template>
  <div id="intro" class="row text-center">
    <div class="intro-title col-12 col-sm-7 text-left">
      <h2 class="d-none d-sm-block ml-4"><b>LUCIM - Land Use Change Interactive Mapping</b></h2>
      <h5 class="ml-4">Driving the transition towards more resilient and efficient land use in Europe</h5>
    </div>
    <div class="intro-image col-12 col-sm-5 p-0">
      <div id="landusesexamples" class="carousel slide" data-ride="carousel" data-interval="2000">
        <div class="carousel-inner">
          <div class="carousel-item active" style="background-image: url(img/land_uses/SE_forest_grazing_agromix_01.jpg);">
          </div>
          <div class="carousel-item" style="background-image: url(img/land_uses/SE_grazed_orchard_chickens.jpg);">
          </div>
          <div class="carousel-item" style="background-image: url(img/land_uses/WCE_linear_woody_feature_windbreak.jpg);">
          </div>
          <div class="carousel-item" style="background-image: url(img/land_uses/SE_agrosilvopastoral.jpg);">
          </div>
          <div class="carousel-item" style="background-image: url(img/land_uses/NE_intercropped_orchard.jpg);">
          </div>
        </div>
      </div>
    </div>
    <div class="intro-submenu col-12">
      <div class="row no-gutters align-items-center">
        <div class="col-6 text-left">
          <div class="card m-4 bg-hover">
            <img src="img/digitaf_white.png" class="logo">
            <div class="card-body">
              <h5 class="card-title"><b><a href="#lpis-sustainability-compass">LPIS Sustainability Compass</a></b></h5>
              <router-link to="/lpis-sustainability-compass" tag="button" class="btn west text-center">Explore Insights for Your Land</router-link>
            </div>
          </div>
        </div>
        <div class="col-6 text-left">
          <div class="card m-4 bg-hover">
            <img src="img/digitaf_white.png" class="logo">
            <div class="card-body">
              <h5 class="card-title"><b><a href="#tree-deserts">Tree Deserts in Europe</a></b></h5>
              <router-link to="/tree-deserts" tag="button" class="btn west text-center">Where Are Trees Missing in Agricultural Areas?</router-link>
            </div>
          </div>
        </div>
        <div class="col-6 text-left">
          <div class="card m-4 bg-hover">
            <img src="img/agromix_white.png" class="logo">
            <div class="card-body">
              <h5 class="card-title"><b><a href="#target-areas-section">European target areas for agroforestry and integrated crop/livestock systems</a></b></h5>
              <router-link to="/target-areas" tag="button" class="btn west text-center">View Multi-Factor Target Areas Maps</router-link>
            </div>
          </div>
        </div>
        <div class="col-6 text-left">
          <div class="card m-4 bg-hover">
            <img src="img/agromix_white.png" class="logo">
            <div class="card-body">
              <h5 class="card-title"><b><a href="#land-uses-section">Land use change models for increased resilience to climate change</a></b></h5>
              <router-link to="/resilient-land-uses" tag="button" class="btn west text-center">Find Resilient Land Use Options</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="intro-text" class="col-12 text-justify">
      <h2 class="text-center mb-4"><b>Introduction</b></h2>
      <p>In the face of future climate challenges, it is of the utmost importance to drive the transition towards more resilient and efficient land use in Europe. <b>Agroecological approaches such as agroforestry and integrated crop and livestock systems (also called mixed farming) have been recognized as “highly effective adaptation options that enhance resilience to climate change”</b> (IPCC, 2022). But can we target the areas where such systems should be established? And what kind of systems should be established according to the farms’s environment, and what are the particular characteristics or mechanisms of these agroecological systems that enhance their resilience, compared with conventional systems?</p>
      <p>The <span class="app-title"> LUCIM - Land Use Change Interactive Mapping</span> - tries to bring these two components together. The first part explores a spatial approach to identify target areas in Europe where resilient and climate-smart agroforestry and mixed farming systems should have high priority for introduction considering existing environmental pressures and socio-economic contexts. The second part establishes a guided cascade of context settings and suggests future scenarios of land use/resilience strategies where different models of land use change can be evaluated as pathways towards increased resilience to climate change.</p>
    </div>
    <div id="intro-who" class="col-12 text-justify">
      <h2 class="text-center mb-2"><b>Who is this tool for?</b></h2>
      <p class="who-title"><b>Farmers and Land managers</b></p>
      <p>Provides inspiration on the resilience path they could take by 1) <span class="highlight">contextualising their region into climate and environmental risks where an agroforestry approach could be implemented</span> and then 2) <span class="highlight">identifying a range of agroforestry and mixed farming systems that could increase resilience to climate change</span>, illustrated with existing peer examples from across Europe.</p>
      <p class="who-title"><b>Policy makers</b></p>
      <p>Outcomes of the spatial modelling and land use change pathway development could be used to <span class="highlight">inform policy development to support the uptake of AF in priority areas while addressing potential social and economic factors that may be barriers to, or conversely, opportunities for implementation</span>.</p>              
    </div>
    <div id="target-areas-section" class="col-12">
      <h2 class="text-center"><b><span class="title">European target regions for Agroforestry and Mixed systems</span></b></h2>
      <div class="row align-items-center">
        <div class="offset-2 col-3">
          <div class="img-icon"><img src="img/target_areas.png"></div>
        </div>
        <div class="col-5">
          <p>Interactive maps that explore <b>environmental and climate change pressures</b> across Europe <b>to identify target areas</b> for agroforestry and mixed systems, while also considering the <b>socio-economic context in which the transition of land use needs to occur</b>.</p>
        </div>
        <div class="w-100"></div>
        <div class="button col-12">
          <router-link to="/target-areas" tag="button" class="btn west text-center">What are the target regions for agroforestry and integrated crop/livestock systems?</router-link>
        </div>
        <div class="col-12">
          <div class="background row align-items-center">
            <div class="col-12 pt-2 text-justify">
              <p class="text-center"><b>Susanne Schnabel, J. Francisco Lavado Contador, Anthony Gabourel Landaverde - University of Extremadura / INTERRA</b></p>
            </div>
            <div class="col-7 pt-2 text-justify">
              <p>The aim of this research was to define target areas where the introduction of mixed farming or agroforestry would provide environmental benefits and also be more resilient to climate change. <span class="highlight">The selection of these target areas was based on a spatial approach which consists of four steps</span>: (1) <b>selection of suitable potential areas from the total agricultural area</b> in Europe, excluding nature conservation sites and MF/AF areas identified in the land use/land cover cartography, (2) <b>analysis of environmental risks</b> in the potential areas, (3) <b>definition of target areas</b>, and (4) <b>analysis of the socio-economic context</b>. The output of this work is a series of maps illustrating the environmental and climate change pressures to highlight the target areas for agroforestry and mixed farming, and maps describing the socio-economic context of the regions.</p>
            </div>
            <div class="col-5 img-scheme text-center">
              <img src="img/target_areas_scheme.png">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="land-uses-section" class="col-12">
      <h2 class="text-center"><b><span class="title">Land use change models for increased resilience to climate change</span></b></h2>
      <div class="row align-items-center">
        <div class="offset-2 col-5">
          <p>Step by step guide through a land use change journey to increase resilience to climate change, by <b>transitioning from a baseline agricultural or forestry system towards more agroecological land use models</b>.</p>
        </div>
        <div class="col-3">
          <div class="img-icon"><img src="img/pathway.png"></div>
        </div>
        <div class="w-100"></div>
        <div class="button col-12">
          <router-link to="/resilient-land-uses" tag="button" class="btn west text-center">Which pathway of land-use change to take?</router-link>
        </div>
        <div class="col-12">
          <div class="background row">
            <div class="col-12 pt-2 text-justify">
              <p class="text-center"><b>Jo Smith, Ana Tomás and João Palma - Moinhos de Vento Agroecology Research Centre</b></p>
            </div>
            <div class="col-6 pt-2 text-justify">
              <p>Agroforestry and Mixed Farming systems are not 'one size fits all' approaches, and a better understanding of the particular characteristics, properties and potential trade-offs of these diverse land use models is needed to provide policy makers, land managers and farmers with the tools they need to make informed decisions regarding a transition towards a more resilient agricultural system for Europe. <span class="highlight">The aim of this research was to identify which specific land use models increased resilience to which specific climate impact drivers in different regions of Europe, and to identify the key factors driving this higher resilience.</span> As there are significant research and evidence gaps in knowledge concerning the resilience of mixed farming and agroforestry land use models to climate change, <b>an iterative expert knowledge-based approach called the Delphi method was used to bridge knowledge gaps.</b> Delphi is an effective method of facilitating a group of individuals as a whole to deal with a complex problem and reach consensus through an iterative feedback process involving several rounds of questionnaires. In all, <b>70 researchers from across Europe were involved in this study.</b> The experts were asked to rate the resilience of each land use model compared with the agricultural or forestry baseline and then asked to explain what were the key characteristics of the land use model that made it more resilient, providing scientific references as evidence. After each Round, responses were aggregated and anonymous feedback provided to the participants. Participants were asked to review and confirm or amend their previous responses, considering the opinions and elements that were suggested by the other participants during the preceding round. <b>Consensus was reached when at least 70% of participants have agreed on the same level of resilience for a particular agroforestry type.</b> The LUCIM brings you these results in an interactive way (a peer reviewed publication is undergoing and a link will be added here when it's ready).</p>
            </div>
            <div class="col-6 pt-2 text-justify">
              <p>Within expert round tables, there is often no consensus on some themes. That is normal and healthy in a discussion group. <b>The lack of consensus towards more resiliency in certain combinations of land use change strengthens a clear sight of where the knowledge gaps are. Such gaps are needed research avenues to pursue.</b> See below for the list of no consensus.</p>
              <ul>
                <li><p class="badge north">Northern Europe <b>Forestry x all climate impact combinations</b>, i.e. building resilience to any climate impact in an established forest with changing to other land use, is unknown or there was no consensus;</p></li>
                <li><p class="badge south">Southern Europe <b>Forestry x Cold extremes</b>, <b>Forestry x Extreme precipitation</b> and <b>Forestry x Windstorms</b>, i.e. building resilience to 1) cold extremes, 2) extreme precipitation or 3) windstorms in an established forest with changing to other land use, is unknown or there was no consensus;</p></li>
                <li><p class="badge west">Western and Central Europe <b>Forestry x Cold extremes</b>, <b>Forestry x Mean precipitation</b> and <b>Forestry x Windstorms</b>, i.e. building resilience to 1) cold extremes, 2) mean precipitation or 3) windstorms decrease in an established forest with changing to other land use, is unknown or there was no consensus;</p></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="intro-agromix" class="col-12 text-justify">
      <h2 class="text-center mb-2"><b>The AGROMIX project</b></h2>
      <p>This tool is a deliverable of the AGROMIX project (https://agromixproject.eu/), a European project funded by the European Union’s Horizon 2020 programme. <span class="highlight">AGROMIX brings together farmers, researchers and policymakers to explore agroecological solutions for more resilient land use in Europe, developing tools to implement these practices.</span> The research behind this tool is summarized above; for more information, please refer to Deliverable 3.5 of the AGROMIX project (weblink D3.5 - to be updated when final version available).</p>
    </div>
    <div id="intro-digitaf" class="col-12 text-justify">
      <h2 class="text-center m-4"><b>The DigitAF project</b></h2>
      <p>LUCIM has been improved within the DigitAF project, a European project funded by the European Union's Horizon Europe programme. <span class="highlight">Starting from a full understanding of benefits of Agroforestry in terms of climate change mitigation, biodiversity and farming sustainability goals, DigitAF provides tailored, user-friendly and open-source digital tools for everyone involved in the farming industry, from policy makers and farmers to final consumers.</span> For more information, please refer to Deliverable 1.4 of the DigitAF project (weblink D1.4 - to be updated when final version available).</p>
    </div>
  </div>
</template>
