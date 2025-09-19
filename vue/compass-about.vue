<script>
module.exports = {
  name: "compass-about",
  data() {
    return {
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
