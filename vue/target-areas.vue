<script>
module.exports = {
  name: "target-areas",
  data() {
    return {
      socioEconomicIndicators: [],
		  selectedMap: null,
      selectedGrid: 'targetareas',
      maps: {
        socioeconomicfactors: {
          socialcontexts: {
            code: 'socialcontexts',
            title: "Social contexts",
            caption: "<b>Socio-economic contexts 1, 2 and 3</b> in the EU27, UK and CH.",
            description: "<p>The analysis of the socio-economic context aimed at the characterization of the European regions. In that sense, different contexts were considered as a combination of the whole set of variables related to education, economy, and demography. Those variables have been described in previous paragraphs, and jointly regards the socioeconomic conditions or characteristics of the NUTS 2 regions across the European Union, Switzerland, and the United Kingdom.</p><p><b>Context number 1</b> captures regions with a confluence of positive characteristics, therefore, it was categorized as a <b>“high profile”</b> context. These regions are characterized by a higher prevalence of organic farming, a well-educated and younger farm management population, larger farms in terms of economic size, lower unemployment rates, and a predominantly urban character. These combined factors suggest a strong economic base, a modern and potentially more productive agricultural sector, and a favorable demographic profile.</p><p><b>Context number 3</b> encompasses regions facing several challenges, so it was categorized as <b>“low profile”</b>. These regions tend to have lower adoption of organic farming practices, a less educated and likely older farmer population, smaller farms in terms of economic size, higher unemployment rates, and a predominantly rural character. This combination suggests a potentially weaker economic base, a less modern agricultural sector, and a demographic profile that might face challenges in attracting young talent.</p><p><b>Context number 2</b> encompasses all regions not accounted for in contexts 1 and 3. While it serves as an intermediary between the two, it also encompasses unique combinations of attributes not present in either extreme. Notably, regions are classified into context 1 or 3 based on meeting a minimum of four (up to six) specified socioeconomic factors outlined in Table 23. Regions failing to meet this criterion for either context are categorized as context 2 regions.</p>",
            csv: 'contexts.csv',
            valueColClass: "context",
            classToFillStyle: { "3": "#B22222", "2": "#FFA500", "1": "#ADD8E6" },
            order: [ "1", "2", "3" ]
          },
          demography: {
            age: {
              code: 'age',
              title: "Ratio of young farm managers (< 40 y.o) to elderly farm managers (> 65 y.o.)",
              type: "Socio-economic",
              subtype: "Demography",
              caption: "<b>Ratio of young farm managers to elderly farm managers</b> in the NUTS 2 regions in the EU27, UK and CH. Source: Eurostat (2016, 2020).",
              description: "The indicator shows the ratio between young farm managers (< 40 years old) and elderly (> 65 years old) farm managers. Regions with higher proportions of young farmers are more likely to have sufficient generational renewal. On the contrary, regions where the proportion of elderly farm managers is higher probably will lack sufficient generation renewal, thus increasing land abandonment.",
              datasets: ['Eurostat (2023) Farm indicators by legal status of the holding, utilised agricultural area, type and economic size of the farm and NUTS2 region, Eurostat. https://ec.europa.eu/eurostat/databrowser/view/ef_m_farmleg/default/table?lang=en&category=agr.ef.ef_mainfarm'],
              valueColClass: "AGE_CLASS",
              valueCol: "AGE_VALUE",
              classToFillStyle: { "Very high": "#B22222", "High": "#F08080", "Medium to high": "#FFA500", "Medium to low": "#FFFF00", "Low": "#90EE90", "Very low": "#ADD8E6" },
              order: [ "Very high", "High", "Medium to high", "Medium to low", "Low", "Very low" ]
            },
            urbanisation: {
              code: 'urbanisation',
              title: "Degree of urbanisation",
              type: "Socio-economic",
              subtype: "Demography",
              caption: "<b>Degree of urbanisation</b> at NUTS 2. Values were subdivided into <b>three classes: predominantly urban, intermediate and predominantly rural</b>. Source: de Beer et al. (2014).",
              description: "<p>Degree of urbanisation is based on population density and size. This methodology captures settlements of different sizes and economic relations between cities and their surroundings (Eurostat, 2021). It classifies the territory of a country as an urban-rural continuum. The dataset used for this indicator was developed by de Beer et al., 2014, at the NUTS 2 level to maintain consistency with the spatial resolution of the rest of economic and social variables.</p><p>This indicator combines the population size and the population density thresholds to establish 3 mutually exclusive classes: cities, towns and suburbs, and rural areas. The methodology is based on cluster of cells to define population size thresholds and the population density of cells (inhabitants per km2).</p><p>This indicator offers a comprehensive classification of population distribution and concentration across European regions. It is useful to understand the character of a territory, allowing to identify regions dominated by rural landscapes or regions which are highly populated and concentrated, or intermediate regions.</p>",
              datasets: [ 'Eurostat (2021) Applying the Degree of Urbanisation — A methodological manual to define cities, towns and rural areas for international comparisons. Publications Office of the European Union. https://doi.org/10.2785/706535', 'de Beer, J., van der Gaag, N. and van der Erf, R. (2014) ‘New classification of urban and rural NUTS 2 regions in Europe’, Netherlands Interdisciplinary Demographic Institute (NIDI). Available at: https://www.nidi.nl/shared/content/output/papers/nidi-wp-2014-03.pdf' ],
              valueColClass: "URB_CLASS",
              valueCol: "URB_VALUE",
              classToFillStyle: { "Predominantly urban": "#A2F78D", "Intermediate": "#6EDB8B", "Predominantly rural": "#4CAF50" },
              order: [ "Predominantly urban", "Intermediate", "Predominantly rural" ]
            },
          },
          education: {
            organic: {
              code: 'organic',
              title: "Share of organic farming holdings in proportion to total farms (%)",
              type: "Socio-economic",
              subtype: "Education",
              caption: "<b>Share of organic farming holdings</b> in the NUTS 2 regions in the EU27, UK and CH. Source: Eurostat (2016, 2020).",
              description: "The share of organic farming holdings represented the agricultural area under organic farming as a proportion of the utilised agricultural area. Farming is considered organic if it complies with the EU regulations. Although this variable is not strictly related to education, it can be considered as a proxy to farmers’ willingness to adopt MF/AF, i.e., farmers in regions with higher proportions of organic farming holdings are more likely to adopt new practices and adapt to change. Datasets were provided by Eurostat.",
              datasets: [ "Eurostat (2020) Agriculture, forestry and fishery statistics. Publications Office of the European Union. https://doi.org/10.2785/143455" ],
              valueColClass: "ORG_CLASS",
              valueCol: "ORG_VALUE",
              classToFillStyle: { "Very high": "#B22222", "High": "#F08080", "Medium to high": "#FFA500", "Medium to low": "#FFFF00","Low": "#90EE90", "Very low": "#ADD8E6" },
              order: [ "Very high", "High", "Medium to high", "Medium to low", "Low", "Very low" ]
            },
            training: {
              code: 'training',
              title: "Ratio of farm managers with full training to farmers with basic knowledge and practical experience only",
              type: "Socio-economic",
              subtype: "Education",
              caption: "<b>Ratio of farm managers with full training to farm managers with basic knowledge and practical experience only</b> in the NUTS 2 regions in the EU27, UK and CH. Source: Eurostat (2023).",
              description: "The ratio of farm managers with full training to farm managers with basic knowledge and practical experience only provides information on the proportion of farm managers who have attained full and basic education levels in agriculture. This indicator contained three classes: basic agricultural training, full agricultural training, and practical experience only. The relevance of this indicator is that farmers with higher education levels in agriculture are more likely to possess the knowledge required for managing MF/AF, thus increasing their potential to adopt MF/AF practices. Datasets were provided by Eurostat (2023).",
              datasets: [ "Eurostat (2023) Agricultural holdings and utilised agricultural area by training, age and sex of farm managers. https://ec.europa.eu/eurostat/databrowser/view/ef_mp_training/default/table?lang=en&category=agr.ef.ef_mp" ],
              valueColClass: "TRN_CLASS",
              valueCol: "TRN_VALUE",
              classToFillStyle: { "Very high": "#B22222", "High": "#F08080", "Medium to high": "#FFA500", "Medium to low": "#FFFF00","Low": "#90EE90", "Very low": "#ADD8E6" },
              order: [ "Very high", "High", "Medium to high", "Medium to low", "Low", "Very low" ]
            },
          },
          economy: {
            economicsize: {
              code: 'economicsize',
              title: "Mean economic size of farms (euros)",
              type: "Socio-economic",
              subtype: "Economy",
              caption: "<b>Mean economic size of farms</b> of the NUTS 2 regions in the EU27, UK and CH. Data obtained from Eurostat (2016, 2020).",
              description: "<p>The economic size of farms is an indicator of the standard economic output reported for a year. In 2020, 3.3 out of 9.1 million farms in the EU had a standard output below 2000 euros per year and were responsible for only 1% of the EU’s total agricultural economic output (Eurostat, 2022).This means that approximately 35% of the total farms in the EU are semi-subsistence or small farms.</p><p>The standard output of an agricultural product is the average monetary value of the agricultural output at farm-gate price, in euro per hectare or per head of livestock (Eurostat, 2020). In this sense, regions were classified according to their economic size, using the mean economic size as a representative value of each region (Eurostat, 2023a). This is also one of the sectoral indicators used to assess the implementation of the Common Agricultural Policy (CAP).</p><p>For the normalization of the data, a regional standard output coefficient is applied for each product, which is the average value over a reference period of 5 years. Then, the economic size is the sum of all the standard output per hectare of crop and per head of livestock in a farm, expressed in euro (Eurostat, 2020).</p><p>The mean economic size of farms is an indicator of the economic feasibility of regions to implement MF/AF, as those regions with higher agricultural outputs are considered to have sufficient economic capacity to adopt MF/AF. Conversely, regions with lower economic outputs would need more financial support to implement MF/AF.</p><p>Data were provided by Eurostat (2023a) in euros, ranging from 0 to 500,000 or more euros, as the economic output. For each region mean values were calculated and then 6 classes were defined according to the level of income.</p>",
              datasets: [ "Eurostat (2020) Agriculture, forestry and fishery statistics. Publications Office of the European Union. https://doi.org/10.2785/143455", "Eurostat (2023) Farm indicators by legal status of the holding, utilised agricultural area, type and economic size of the farm and NUTS2 region, Eurostat. https://ec.europa.eu/eurostat/databrowser/view/ef_m_farmleg/default/table?lang=en&category=agr.ef.ef_mainfarm" ],
              valueColClass: "ECS_CLASS",
              valueCol: "ECS_VALUE",
              classToFillStyle: { "Very Large": "#B22222", "Large": "#F08080", "Medium to Large": "#FFA500", "Medium to Small": "#FFFF00","Small": "#90EE90", "Very Small": "#ADD8E6" },
              order: [ "Very Large", "Large", "Medium to Large", "Medium to Small", "Small", "Very Small" ]
            },
            unemployment: {
              code: 'unemployment',
              title: "Unemployment rates (%)",
              type: "Socio-economic",
              subtype: "Economy",
              caption: "<b>Unemployment rates</b> of the NUTS 2 regions in the EU27, UK and CH. Source: Eurostat (2016, 2020).",
              description: "Unemployment rates were obtained at the NUTS 2 level from Eurostat (2024). These represented the total unemployed persons as a percentage of the labour force. The labour force is the total number of people employed and unemployed. Unemployed persons comprise persons aged 15 to 74 who were: without work during the reference week, currently available for work, or actively seeking work. This is a relevant indicator to characterize and understand the needs of the labour market in the European regions.",
              datasets: [ "Eurostat (2024) Unemployment rate by NUTS 2 regions. https://doi.org/10.2908/TGS00010" ],
              valueColClass: "UNR_CLASS",
              valueCol: "UNR_VALUE",
              classToFillStyle: { "Very high": "#B22222", "High": "#F08080", "Medium to high": "#FFA500", "Medium to low": "#FFFF00","Low": "#90EE90", "Very low": "#ADD8E6" },
              order: [ "Very high", "High", "Medium to high", "Medium to low", "Low", "Very low" ]
            }
          }
        },
        environmentalpressures: {
          targetareas: {
            code: 'targetareas',
            title: "Target areas",
            caption: "<b>Target areas to introduce MF/AF</b>. Only <b>areas showing between 7 and 14 accumulated environmental pressures</b> were selected.",
            description: "<p>After combining the environmental indicators related to water, biodiversity, climate and soil, heat maps were produced to highlight the intensity of a total of 14 environmental risks. Areas showing 7 or more accumulated pressures were defined as target areas to introduce MF/AF. This threshold was applied according to the spatial distribution of pressures in the potential areas, selecting only those areas that were found between the upper two quintiles of the value's distribution, i.e., areas reporting between 7 and 14 environmental pressures.</p>",
            layer: "all_pressures_final_with_CY_def",
            min: 7,
            max: 14,
            colors: [
              "white", "#00FF00", "#66FF00", "#CCFF00", "#FFFF00", "#FFCC00",
              "#FF9900", "#FF6600", "#FF3300", "#FF0000", "#CC0000",
              "#990033", "#660066", "#330099", "#0000CC"
            ],
            filter: (cell) => cell.pressures >= 7 && cell.pressures <= 14
          },
          allenvironmentalpressures: {
            code: 'allenvironmentalpressures',
            title: "All environmental pressures",
            layer: "all_pressures_final_with_CY_def",
            caption: "<b>Spatial distribution of accumulated environmental pressures (0-14) in the potential agricultural area to introduce MF/AF</b> in the EU27, UK and CH.",
            description: "These areas represent the distribution of different accumulations of pressures according to the selected indicators, which are related to soil (water erosion, wind erosion and soil organic carbon saturation capacity), water (irrigated areas and nitrogen surplus), climate change (annual mean temperature, aridity index, drought frequency and heavy precipitation days) and biodiversity (pollinator potential, pest control index and potential threats to soil biodiversity). While in a small proportion of land no pressures were identified, conversely, some potential areas are affected by the 14 environmental pressures simultaneously.",
            min: 0,
            max: 14,
            colors: [
              "white", "#FFFF00", "#FFDD00", "#FFBB00", "#FF9900", "#FF7700",
              "#FF5500", "#FF3300", "#FF1100", "#FF0011", "#DD0011",
              "#BB0011", "#990099", "#6600CC", "#3300FF"
            ]
          },
          soil: {
            code: 'soil',
            title: 'Soil-related pressures',
            layer: 'soil_reclass_all_final_def',
            caption: "<b>Map of accumulated soil pressures (0-3 environmental pressures)</b> in the potential agricultural area to introduce agroforestry and mixed farming: water erosion, wind erosion, and soil organic carbon (SOC) saturation capacity.",
            description: "<p>The European Union Soil Observatory (EUSO) reported that the most common types of soil degradation in Europe are the loss of soil organic carbon, the loss of soil biodiversity, and soil erosion by water (ESDAC, 2023). These processes have a significant impact on soil health, resulting in reduced crop productivity, increased soil losses, and degraded water quality. Furthermore, additional research showed that most unhealthy soils in Europe are affected by more than one type of soil degradation. In that sense, reducing soil erosion and increasing soil organic carbon stocks can enhance resilience by improving soil health, water and air quality, biodiversity and crop productivity.</p><p>Maps at European scale of soil erosion by water (Panagos et al., 2015), soil erosion by wind (Borrelli et al., 2017) and erosion risk for arable land in Switzerland (FOAG, 2019) were used to assess soil loss in agricultural land. Soil losses greater than 2 t ha-1 yr-1 were considered areas under higher risk of soil erosion (Panagos et al., 2020).</p><p>The soil organic carbon (SOC) saturation capacity map was also considered in this analysis. This map expresses the ratio between actual and potential SOC stock in each pixel (Lugato, Bampa, et al., 2014; Lugato, Panagos, et al., 2014) where values close to 0 indicated a great potential of soil to store more carbon. Areas that showed a ratio below 0.4 were classified as pressure areas, since these agricultural areas were below 60% of their capacity to store carbon under optimal conditions as outlined by De Rosa et al., 2024.</p>",
            min: 0,
            max: 3,
            colors: [
              "white", "#FFFF00", "#FF9900", "#FF0011"
            ],
            pressures: {
              watererosion: {
                code: 'watererosion',
                title: "Water erosion",
                references: [ "Panagos, P. et al. (2015) ‘The new assessment of soil loss by water erosion in Europe’, Environmental Science and Policy, 54, pp. 438–447. https://doi.org/10.1016/j.envsci.2015.08.012", "FOAG (2019) ‘Erosion risk map for arable land, with average soil erosion in tonnes/(ha*year)’. Opendata.swiss. https://opendata.swiss/en/dataset/erosionsrisikokarte-der-schweiz-mittlerer-bodenabtrag-in-tonnen-hajahr"],
                threshold: "> 2 t ha-1 yr-1",
                threshold_source: [ "Panagos, P. et al. (2020) ‘A soil erosion indicator for supporting agricultural, environmental and climate policies in the European union’, Remote Sensing, 12(9). https://doi.org/10.3390/RS12091365" ]
              },
              winderosion: {
                code: 'winderosion',
                title: "Wind erosion",
                references: [ "Borrelli, P. et al. (2017) ‘A New Assessment of Soil Loss Due to Wind Erosion in European Agricultural Soils Using a Quantitative Spatially Distributed Modelling Approach’, Land Degradation & Development, 28(1), pp. 335–344.", "FOAG (2019) ‘Erosion risk map for arable land, with average soil erosion in tonnes/(ha*year)’. Opendata.swiss. https://opendata.swiss/en/dataset/erosionsrisikokarte-der-schweiz-mittlerer-bodenabtrag-in-tonnen-hajahr"],
                threshold: "> 2 t ha-1 yr-1",
                threshold_source: [ "Borrelli, P. et al. (2017) ‘A New Assessment of Soil Loss Due to Wind Erosion in European Agricultural Soils Using a Quantitative Spatially Distributed Modelling Approach’, Land Degradation & Development, 28(1), pp. 335–344." ]
              },
              soc: {
                code: 'soc',
                title: "Soil Organic Carbon (SOC) saturation capacity",
                references: [ "Lugato, E., Panagos, P., et al. (2014) ‘A new baseline of organic carbon stock in European agricultural soils using a modelling approach’, Global Change Biology, 20(1), pp. 313–326. Available at: https://doi.org/10.1111/gcb.12292", "Lugato, E., Bampa, F., et al. (2014) ‘Potential carbon sequestration of European arable soils estimated by modelling a comprehensive set of management practices’, Global Change Biology, 20(11), pp. 3557–3567. https://doi.org/10.1111/gcb.12551"],
                threshold: "Ratio between actual and potential SOC stock < 0.4",
                threshold_source: [ "De Rosa, D. et al. (2024) ‘Soil organic carbon stocks in European croplands and grasslands: How much have we lost in the past decade?’, Glob Change Biol, 30. https://doi.org/10.1111/gcb.16992" ]
              }
            }
          },
          biodiversity: {
            code: 'biodiversity',
            title: 'Biodiversity-related pressures',
            layer: 'bio_all_reclass_final',
            caption: "<b>Map of accumulated biodiversity-related pressures (0-5 environmental pressures)</b> in the potential agricultural area to introduce agroforestry and mixed farming: pest control index, pollinator potential, potential threats to soil biological functions, potential threats to soil fauna and potential threats to soil microorganisms.",
            description: "<p>The indicators used to present the risk of functional biodiversity loss were the pest control index, potential threats to soil biodiversity and pollinator potential. Natural pest control is important for crop productivity and food security, as it reduces crop losses and the need for pesticides. Soil biodiversity is also essential for soil health, as it influences soil formation, decomposition, nutrient cycling, water regulation, and pest control (Orgiazzi et al., 2016). Pollinators are necessary for crop yield and quality as many crops, such as fruits and vegetables, are dependent on pollinating insects to produce food for human consumption (Vallecillo et al., 2020).</p><p>For the whole extent of the countries considered in this study, no consistent and detailed spatial data bases on species richness, diversity, or related direct indicators of biodiversity are available. Therefore, other indicators expressing functional aspects of biodiversity were used as proxies for biodiversity related risks which are available for Europe. One indicator reflects the natural pest control (Rega et al., 2018) and the other represents crop pollination potential (Vallecillo et al., 2020).</p><p>For both datasets, the first two quintiles of the values' distribution were used to identify areas under risk. This means that areas with lower values have a higher risk of pest outbreaks and reduced crop yields due to lower potential for supporting natural pest control services and pollinators, respectively.</p><p>Additionally, potential threats to soil biodiversity were assessed based on Orgiazzi et al. (2016). The three major components of soil biodiversity were assessed: 1) soil microorganisms, 2) soil fauna, and 3) biological functions. Potential risk was ranked into five classes using the quantile classification method, according to Orgiazzi et al. (2016): low, low-moderate, moderate, moderate-high, and high levels. Areas falling into moderate-high and high levels were considered as areas under risk.</p><p>Regarding biodiversity indicators, Croatia, Cyprus and Switzerland were not included in some datasets, leading to a lack of data for these areas. To address this issue, mean values of each of the risk indicators were calculated for the different environmental zones in Europe and then, those mean values were assigned to the potential area in the countries lacking data and corresponding to the same environmental zones. The environmental zones were obtained from the dataset of Environmental Stratification of Europe (Metzger, 2018). This dataset distinguished between 84 strata that are relatively homogeneous in environmental conditions and can be aggregated in 13 environmental zones: Alpine North, Boreal, Nemoral, Atlantic North, Alpine South, Continental, Atlantic Central, Pannonian, Lusitanian, Anatolian, Mediterranean Mountains, Mediterranean North, and Mediterranean South.</p>",
            min: 0,
            max: 5,
            colors: [
              "white", "#FFFF00", "#FF9900", "#FF0011", "#BB0011", "#990099"
            ],
            pressures: {
              soilbiodiv: {
                code: 'soilbiodiv',
                title: "Threats to soil biodiversity (fauna, microorganisms, and biological functions)",
                references: [ "Orgiazzi, A. et al. (2016) ‘A knowledge-based approach to estimating the magnitude and spatial patterns of potential threats to soil biodiversity’, Science of the Total Environment, 545-546, pp. 11-20. https://doi.org/10.1016/j.scitotenv.2015.12.092" ],
                threshold: "Upper two quintiles of the values’ distribution",
                threshold_source: [ "Orgiazzi, A. et al. (2016) ‘A knowledge-based approach to estimating the magnitude and spatial patterns of potential threats to soil biodiversity’, Science of the Total Environment, 545-546, pp. 11-20. https://doi.org/10.1016/j.scitotenv.2015.12.092" ]
              },
              pestcontrol: {
                code: "pestcontrol",
                title: "Pest control index",
                references: [ "Rega, C. et al. (2018) ‘A pan-European model of landscape potential to support natural pest control services’, Ecological Indicators, 90(April), pp. 653-664. https://doi.org/10.1016/j.ecolind.2018.03.075" ],
                threshold: "First two quintiles of the values' distribution",
                threshold_source: [ "Rega, C. et al. (2018) ‘A pan-European model of landscape potential to support natural pest control services’, Ecological Indicators, 90(April), pp. 653-664. https://doi.org/10.1016/j.ecolind.2018.03.075" ]
              },
              pollinator: {
                code: 'pollinator',
                title: "Pollinator potential",
                references: [ "Vallecillo, S. et al. (2020) ‘INCA - Crop Pollination.’ European Commission, Joint Research Centre (JRC). http://data.europa.eu/89h/650331f3-e7ce-427b-8011-bd2c8f40599c" ],
                threshold: "First two quintiles of the values' distribution",
                threshold_source: [ "Vallecillo, S. et al. (2020) ‘INCA - Crop Pollination.’ European Commission, Joint Research Centre (JRC). http://data.europa.eu/89h/650331f3-e7ce-427b-8011-bd2c8f40599c" ]
              }
            }
          },
          water: {
            code: "water",
            title: "Water-related pressures",
            layer: "water_all_reclass_final",
            caption: "<b>Map of accumulated water pressures (0-2 environmental pressures)</b> in the potential agricultural area to introduce agroforestry and mixed farming: nitrogen surplus and percentage of irrigated areas.",
            description: "<p>The Global Map of Irrigation Areas version 5 (Siebert et al., 2013) was used to find areas where the impact of irrigation on water resources was high. The map used stood for the total area equipped for irrigation around the year 2005 in percentage of the total area on a raster with a resolution of 5 minutes. Areas that presented more than 30% of its agricultural land equipped for irrigation were defined as pressure areas.</p><p>The map of nitrogen (N) surplus (inputs minus crop removal) for the year 2010, as calculated with the model INTEGRATOR, was used to identify pressure areas with more than 50 kg N ∙ ha-1 yr-1(EEA, 2022a), as this critical threshold was recommended by the Knowledge for Integrated Nutrient Management Action Plan of the European Commission (Grizzetti et al., 2023). In the case of Switzerland, the map of nitrogen input into waters provided by the Federal Office of the Environmental (FOEN, 2022) was used.</p><p>Reducing irrigated areas and managing nitrogen excess are crucial for building agricultural resilience. These actions improve water availability and quality, mitigate climate change, and boost biodiversity. Strategies like minimizing nitrogen and phosphorus leaching, conserving soil moisture, diversifying crops, modifying microclimates, and adopting sustainable intensification methods further enhance this resilience, ensuring agriculture can adapt to a changing climate (Godfray & Garnett, 2014; Smith & Olesen, 2010).</p>",
            min: 0,
            max: 2,
            colors: [
              "white", "#FFFF00", "#FF0011"
            ],
            pressures: {
              irrigated: {
                code: 'irrigated',
                title: "Irrigated areas",
                references: [ "Siebert, S. et al. (2013) Update of the digital global map of irrigation areas to version 5. https://doi.org/10.13140/2.1.2660.6728" ],
                threshold: "> 30% irrigated land",
                threshold_source: [ "Based on the values’ distribution" ]
              },
              nitrogen: {
                code: 'nitrogen',
                title: "Nitrogen surplus",
                references: [ "EEA (2022a) ‘Concentrations of nitrogen and phosphorus in European agricultural soils’. European Environment Agency. https://www.eea.europa.eu/data-and-maps/data/concentrations-of-nitrogen-and-phosphorus.", "FOEN. (2022). Diffuse nitrogen inputs into waters, modelled values. https://data.geo.admin.ch/browser/index.html#/collections/ch.bafu.gewaesserschutz-diffuse_eintraege_stickstoff" ],
                threshold: "> 50 kg N ha-1 yr-1",
                threshold_source: [ "Grizzetti, B. et al. (2023) Knowledge for Integrated Nutrient Management Action Plan (INMAP). https://doi.org/10.2760/692320" ]
              }
            }
          },
          climatechange: {
            code: 'climatechange',
            title: "Climate change-related pressures",
            layer: "all_climate_final",
            caption: "<b>Map of accumulated climate change pressures (0-4 environmental pressures)</b> in the potential agricultural area to introduce agroforestry and mixed farming: annual mean temperature change, aridity index, drought frequency and heavy precipitation days.",
            description: "<p>To conduct an analysis of the risks associated with climate change, specific variables such as the annual mean temperature, aridity index, drought frequency and heavy precipitation were chosen.</p><p>Climate change affects agriculture in various ways, influencing several aspects such as altering crop phenology, water availability, pest and disease incidence, and crop yield and quality. Different studies have highlighted the significance of climate change on agricultural productivity through temperature increases, changes in water availability, and the occurrence of extreme environmental events like floods, droughts, storms, cyclones, and landslides (Awopegba et al., 2022).</p><p>Climate datasets were obtained from the Copernicus Climate Change Service (Berg, Photiadou, Bartosova, et al., 2021; Berg, Photiadou, Simonsson, et al., 2021; Nobakht et al., 2019) and the European Environmental Agency (EEA, 2019). To compare current climate and future climate conditions, the reference period of 1971-2000 and the forecast for 2041-2070 were used to predict change in annual mean temperature, aridity index and heavy precipitation days. While for the indicator of drought frequency, the reference period was 1981-2010 and the forecast was 2041-2070, due to data availability. In both cases, the Representative Concentration Pathway (RCP) 8.5 and the HadGEM2-ES model were used.</p>",
            min: 0,
            max: 4,
            colors: [
              "white", "#FFFF00", "#FF9900", "#FF0011", "#BB0011"
            ],
            pressures: {
              meantemperature: {
                code: 'meantemperature',
                title: "Annual mean temperature",
                references: [ "Berg, P., Photiadou, C., Simonsson, L., et al. (2021). Temperature and precipitation climate impact indicators from 1970 to 2100 derived from European climate projections. Copernicus Climate Change Service (C3S) Climate Data Store (CDS). https://doi.org/10.24381/cds.9eed87d5" ],
                threshold: "2-4ºC",
                threshold_source: [ "Hart, K. et al. (2012), Methodologies for Climate Proofing Investments and Measures under Cohesion and Regional Policy and the Common Agricultural Policy Technical Guidance for Common Agricultural Policy, A report for DG Climate" ]
              },
              aridity: {
                code: 'aridity',
                title: "Aridity index",
                references: [ "Berg, P., Photiadou, C., Bartosova, A. et al. (2021). Hydrology related climate impact indicators from 1970 to 2100 derived from bias adjusted European climate projections. Copernicus Climate Change Service (C3S) Climate Data Store (CDS). https://doi.org/10.24381/cds.73237ad6" ],
                threshold: "Upper two quintiles of the values’ distribution",
                threshold_source: [ "Based on the values’ distribution" ]
              },
              drought: {
                code: 'drought',
                title: "Drought frequency",
                references: [ "EEA (2019) ‘Projected change in meteorological drought frequency between the present (1981-2010) and the mid-century 21st century (2041-2070) in Europe, under two emissions scenarios’. European Environment Agency. https://www.eea.europa.eu/data-and-maps/figures/projected-change-in-meteorological-drought." ],
                threshold: "Upper two quintiles of the values’ distribution",
                threshold_source: [ "Based on the values’ distribution" ]
              },
              precipitation: {
                code: 'precipitation',
                title: "Heavy precipitation",
                references: [ "Nobakht, M. et al. (2019) ‘Agroclimatic indicators from 1951 to 2099 derived from climate projections’. Copernicus Climate Change Service (C3S) Climate Data Store (CDS). https://doi.org/10.24381/CDS.DAD6E055." ],
                threshold: "Upper two quintiles of the values’ distribution",
                threshold_source: [ "Based on the values’ distribution" ]
              }
            }
          }
        }
      }
      
    }
  },
  created() {
    this.loadData()
	},
  mounted() {
    this.selectGrid(this.maps.environmentalpressures.targetareas);
  },
  computed: {
  },
  methods: {
		loadData() {
			fetch('data/socioeconomiccontexts/stacked_indicators.csv')
				.then(response => response.text())
				.then(csv => {
					const rows = Papa.parse(csv).data
					const headers = rows[0]
					this.socioEconomicIndicators = rows.slice(1).map(values => {
						return headers.reduce((obj, header, index) => {
							obj[header.trim()] = values[index].trim();
							return obj;
						}, {});
					});
				});
		},
		getMapTitle() {
			if (this.selectedMap) {
				return this.selectedMap.title
			} else if (this.selectedGrid) {
				return this.selectedGrid.title // TODO
			}
		},
		currentMap() {
			return this.selectedMap ? this.selectedMap : this.selectedGrid
		},
		selectMap(map) {
			var this_ = this
			var getTooltipText = function(rg, mp) {
				var buf = []
				var indicator = this_.socioEconomicIndicators.filter(function(ind) {
					return ind["NUTS_ID"] == rg.properties.id
				})[0]

				if (rg.properties.id) {
					//name and code
					buf.push(
							'<div class="estat-vis-tooltip-bar">' +
									rg.properties.na +
									' (' +
									rg.properties.id +
									')</div>'
					)
				} else {
						//region name
						buf.push(
								'<div class="estat-vis-tooltip-bar">' +
										rg.properties.na +
										'</div>'
						)
				}
				if (map.csv) {
					buf.push(`
							<div class="estat-vis-tooltip-text">
							Context ${ mp.statData().get(rg.properties.id).value }
							</div>
					`)
				} else {
					buf.push(`
							<div class="estat-vis-tooltip-text">
							${indicator[map.valueColClass] + ' (' + (+indicator[map.valueCol]).toFixed(2) + ')' }
							</div>
					`)
				}
				return buf.join('')
			}
			
			$("#map").html("");
			$("#grid").html("");

			this.selectedGrid = null
			this.selectedMap = map

			eurostatmap
				.map("ct")
				.width(600)
				.height(410)
				//.title(map.title)
				.fontFamily('Poppins')
				.countriesToShow(['BE', 'EL', 'LT', 'PT', 'BG', 'ES', 'LU', 'RO', 'CZ', 'FR', 'HU', 'SI', 'DK', 'HR', 'MT', 'SK', 'DE', 'IT', 'NL', 'FI', 'EE', 'CY', 'AT', 'SE', 'IE', 'LV', 'PL', 'UK', 'CH'])
				.titleFontSize(16)
				.scale("60M")
				.nutsYear(2016)
				.nutsLvl(2)
				.stat({ csvURL: map.csv ? 'data/socioeconomiccontexts/' + map.csv : 'data/socioeconomiccontexts/stacked_indicators.csv', geoCol: "NUTS_ID", valueCol: map.valueColClass } )
				.classToFillStyle(map.classToFillStyle)
				.legend({ x: 10, y: 40 , noData: false, order: map.order })
				.tooltip({ textFunction: ((rg, mp) => { return getTooltipText(rg, mp) }) })
				.build()
		},
		selectGrid(map) {
			$("#map").html("");
			$("#grid").html("");

			this.selectedMap = null
			this.selectedGrid = map
			
			var grid = new gridviz.Map(document.getElementById('grid'), { x: 5000000, y: 3400000, z: 9000 })
			.addZoomButtons()

			var dataset = new gridviz.MultiResolutionDataset(
				[ 1000, 5000, 10000, 15000, 25000 ], // the resolutions
				resolution => new gridviz.TiledGrid(grid, 'data/environmentalpressures/' + map.layer + "_" + resolution + '/', // the function returning each dataset from the resolution
				{ preprocess: map.filter ? map.filter : (cell) => cell.pressures <= 14 })
			)

			// define color for each cell
			const colorFunction = (cell, resolution) => {
				const density = cell.pressures
				if (density > map.colors.length) {
					console.log('cell.pressures > map.colors.length [ ' + cell.pressures + ' ]')
					return map.colors[map.colors.length - 1]
				}
				return map.colors[density]
			}
			
			// define style
			var style = new gridviz.ShapeColorSizeStyle({
				color: colorFunction,
				alpha: (z) => z < 100 ? 0.75 : 1.0
			})

			var colorLabels = []
			for (var i = map.min; i < map.max+1; i++) {
				if (i > 1) {
					colorLabels.push([ map.colors[i], i + " pressures" ])
				} else if (i == 1) {
					colorLabels.push([ map.colors[i], i + " pressure" ])
				} /* else if (i == 0) {
					colorLabels.push([ map.colors[i], "No pressure" ])
				} */
				else {
					console.log(map.code + " legend problem: " + i)
				}
			}

			//define legend
			const legend = new gridviz.ColorCategoryLegend({
        title: map.title,
        colorLabel: colorLabels
			})

			//link legend to style
			style.legends = [legend]

			var dataLayer = new gridviz.GridLayer(dataset, [style])
			var backgroundLayer = new gridviz.BackgroundLayer(gridviz_eurostat.giscoBackgroundLayer("OSMCartoComposite", 18, "EPSG3035"))

			// add layers to map
			grid.layers = [ backgroundLayer, dataLayer ]
			grid.redraw()
		},
  }
}
</script>

<template>
  <div class="target-regions text-center">
    <div class="row no-gutters">
        <div class="col-2 text-left">
            <router-link class="btn btn-back" to="/" tag="button">
            <span class="d-none d-sm-block">Back to <b>homepage</b></span>
            <i class="fa fa-home d-sm-none"></i>
            </router-link>
        </div>
        <div class="col-8">
            <h3 class="target-regions-title text-center">
            European <b>target areas</b> for Agroforestry and Mixed systems
            </h3>
        </div>
        <div class="col-2"></div>
    </div>
    <div class="row no-gutters">
      <div class="col-3 text-left">
        <div><p class="map-title">Target areas</p></div>
        <div>
          <div class="map-item pointer" :class="{ 'show active': selectedGrid && maps.environmentalpressures.targetareas.code == selectedGrid.code }" :id="'map-' + maps.environmentalpressures.targetareas.code + '-tab'" @click="selectGrid(maps.environmentalpressures.targetareas)"><p><i class="fas fa-globe"></i> {{maps.environmentalpressures.targetareas.title}}</p></div>
        </div>
        <p class="map-title mt-4">Environmental pressures</p>
        <div>
          <div class="map-item pointer" :class="{ 'show active': selectedGrid && maps.environmentalpressures.allenvironmentalpressures.code == selectedGrid.code }" :id="'map-' + maps.environmentalpressures.allenvironmentalpressures.code + '-tab'" @click="selectGrid(maps.environmentalpressures.allenvironmentalpressures)"><p><i class="fas fa-globe"></i> {{maps.environmentalpressures.allenvironmentalpressures.title}}</p></div>
          <div class="map-item pointer ml-4" :class="{ 'show active': selectedGrid && maps.environmentalpressures.soil.code == selectedGrid.code }" :id="'map-' + maps.environmentalpressures.soil.code + '-tab'" @click="selectGrid(maps.environmentalpressures.soil)"><p><i class="fas fa-globe"></i> {{maps.environmentalpressures.soil.title}}</p></div>
          <div class="map-item pointer ml-4" :class="{ 'show active': selectedGrid && maps.environmentalpressures.biodiversity.code == selectedGrid.code }" :id="'map-' + maps.environmentalpressures.biodiversity.code + '-tab'" @click="selectGrid(maps.environmentalpressures.biodiversity)"><p><i class="fas fa-globe"></i> {{maps.environmentalpressures.biodiversity.title}}</p></div>
          <div class="map-item pointer ml-4" :class="{ 'show active': selectedGrid && maps.environmentalpressures.water.code == selectedGrid.code }" :id="'map-' + maps.environmentalpressures.water.code + '-tab'" @click="selectGrid(maps.environmentalpressures.water)"><p><i class="fas fa-globe"></i> {{maps.environmentalpressures.water.title}}</p></div>
          <div class="map-item pointer ml-4" :class="{ 'show active': selectedGrid && maps.environmentalpressures.climatechange.code == selectedGrid.code }" :id="'map-' + maps.environmentalpressures.climatechange.code + '-tab'" @click="selectGrid(maps.environmentalpressures.climatechange)"><p><i class="fas fa-globe"></i> {{maps.environmentalpressures.climatechange.title}}</p></div>
        </div>
        <div class="map-caption card text-justify">
          <div class="card-body">
            <p v-html="this.selectedMap ? this.selectedMap.caption : this.selectedGrid.caption "></p>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="map-title card">
            {{getMapTitle()}}
        </div>
        <svg id="map" v-show="selectedMap" style="height: 410px; width: 600px"></svg>
        <div id="grid" v-show="selectedGrid" style="height: 410px; width: 600px"></div>
      </div>
      <div class="col-3 text-left">
        <div><p class="map-title">Socio-economic factors</p></div>
        <div class="ml-4">
          <div class="map-item pointer" :class="{ 'show active': selectedMap && maps.socioeconomicfactors.socialcontexts.code == selectedMap.code }" :id="'map-' + maps.socioeconomicfactors.socialcontexts.code + '-tab'" @click="selectMap(maps.socioeconomicfactors.socialcontexts)"><p><i class="fas fa-globe-europe"></i> {{maps.socioeconomicfactors.socialcontexts.title}}</p></div>
          <p class="mt-2 map-title">Economic variables</p>
          <div>
            <div class="map-item pointer" :class="{ 'show active': selectedMap && map.code == selectedMap.code }" :id="'map-' + map.code + '-tab'" v-for="map in maps.socioeconomicfactors.economy" :key="'map-' + map.code + '-tab'" @click="selectMap(map)"><p><i class="fas fa-globe-europe"></i> {{map.title}}</p></div>
          </div>
          <p class="mt-2 map-title">Demographic variables</p>
          <div>
            <div class="map-item pointer" :class="{ 'show active': selectedMap && map.code == selectedMap.code }" :id="'map-' + map.code + '-tab'" v-for="map in maps.socioeconomicfactors.demography" :key="'map-' + map.code + '-tab'" @click="selectMap(map)"><p><i class="fas fa-globe-europe"></i> {{map.title}}</p></div>
          </div>
          <p class="mt-2 map-title">Education variables</p>
          <div>
            <div class="map-item pointer" :class="{ 'show active': selectedMap && map.code == selectedMap.code }" :id="'map-' + map.code + '-tab'" v-for="map in maps.socioeconomicfactors.education" :key="'map-' + map.code + '-tab'" @click="selectMap(map)"><p><i class="fas fa-globe-europe"></i> {{map.title}}</p></div>
          </div>
        </div>
      </div>
    </div>
    <div class="row no-gutters my-4 detailed-info">
      <div class="card w-100 text-left">
        <div class="card-body">
          <div class="row">
            <div class="col-12"><p><b>More detailed information:</b></p></div>
            <div class="col-12" v-if="currentMap.description"><p v-html="currentMap.description"></p></div>
            <div class="col-12" v-if="currentMap.pressures">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">Pressure</th>
                    <th scope="col">Threshold</th>
                    <th scope="col">Threshold source</th>
                    <th scope="col">References</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pressure in currentMap.pressures">
                    <th scope="row">{{ pressure.title }}</th>
                    <td>{{ pressure.threshold }}</td>
                    <td><p v-for="thsource in pressure.threshold_source" v-html="thsource"></p></td>
                    <td><p v-for="reference in pressure.references" v-html="reference"></p></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-12" v-if="currentMap.datasets">
              <p><b>Datasets and references:</b></p>
              <p v-for="dataset in currentMap.datasets" v-html="dataset"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
