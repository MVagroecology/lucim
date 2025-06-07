var MAP_LAYERS = {

  esri_world_imagery: {
    id: "esri_world_imagery",
    name_en: "ESRI World Imagery",
    show: false,
    baselayer: true,
    tileXYZ: true,
    source: new ol.source.XYZ({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attributions: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    }),
    opacity: 1,
    zIndex: 0, // Base layer at bottom
  },

  osm: {
    id: "osm",
    name_en: "OSM",
    show: true,
    baselayer: true,
    tileXYZ: true,
    source: new ol.source.OSM(),
    opacity: 0.5,
    zIndex: 0 // Base layer at bottom
  },

  carto: {
    id: "carto",
    name_en: "Carto",
    show: false,
    baselayer: true,
    url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    tileXYZ: true,
    source: new ol.source.XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        attributions:  "© OpenStreetMap contributors © CARTO"
    }),
    opacity: 0.5,
    zIndex: 0 // Base layer at bottom
  },

  lpis_pt_parcelas_2024: {
    // https://www.ifap.pt/isip/ows/isip.data/wfs?service=wfs&request=getcapabilities
    id: "lpis_pt_parcelas_2024",
    name: "LPIS PT - Parcelas 2024",
    name_en: "LPIS PT - Parcels 2024",
    WFS: true,
    show: false,
    minZoom: 12,
    maxZoom: 20,
    selectedFeatures: [],
    typename: "isip.data:parcelas.2024jun10",
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON({
            dataProjection: 'EPSG:4326', // Server data is in EPSG:4326
            featureProjection: 'EPSG:3857' // Map projection is EPSG:3857
        }),
        url: function (extent) {
            var transformedExtent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
            return 'https://www.ifap.pt/isip/ows/isip.data/wfs?' +
            'service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=iisip.data:parcelas.2024jun10&' +
            'outputFormat=application/json&' +
            'srsname=EPSG:4326&' +
            'bbox=' + transformedExtent.join(',') + ',EPSG:4326';
        },
        strategy: ol.loadingstrategy.bbox
    }),
    zIndex: 1,
    infoFn: function(feature) {
      var props = feature.getProperties();
      return [
        { name: "Parcel ID", value: props.PAR_ID },
        { name: "Parcel number", value: props.PAR_NUM }
      ]
    },
    getIdentifier: function(feature) {
      return feature.getProperties().PAR_ID
    },
    getLegendId: function (feature) {
      return feature.getProperties().PAR_CAMPANHA;
    },
    getLegendLabel: function(legendEl) {
      return legendEl.label_en
    },
    legend: {
      "2024": {
        label: "Parcela 2024",
        label_en: "Parcel 2024",
        color: null
      },
    },
    styleFn: function (layerProps, map) {
      return function (feature) {

        const isSelected =
          Array.isArray(layerProps.selectedFeatures) &&
          layerProps.selectedFeatures.some(f =>
            f.feature.getProperties().PAR_ID === feature.get("PAR_ID")
          );

        const zoom = map.getView().getZoom();

        return new ol.style.Style({

          stroke: new ol.style.Stroke({
            color: "black",
            width: 0.5,
          }),

          fill: new ol.style.Fill({
            color: isSelected ? 'yellow' : '#FFFFFF80'
          }),

          text: zoom > 17 ? new ol.style.Text({
            text: String(feature.getProperties().PAR_ID ?? ''),
            font: '12px Calibri,sans-serif',
            fill: new ol.style.Fill({ color: '#000' }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
            overflow: true,
          }) : null,
        });
      };
    },
  },

  lpis_pt_ocupacaosolo_2024: {
    // https://www.ifap.pt/isip/ows/isip.data/wfs?service=wfs&request=getcapabilities
    /*
        {
            "type": "Feature",
            "id": "ocupacoes.solo.2024jun10.2024.40919370",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -885494.83402914,
                            4578260.42717048
                        ],
                        ...
                    ]
                ]
            },
            "geometry_name": "OSA_POLIGONO",
            "properties": {
                "OSA_CAMPANHA": "2024",
                "OSA_ID": 46076550,
                "PAR_ID": 8704714,
                "OSA_NUM": 29,
                "OSA_AREA": 3082.19,
                "CAT_OCU_SIGLA": "SAG",
                "CAT_OCU_DESCR": "Superfície agrícola",
                "CLA_OCU_SIGLA": "CAB-CP",
                "CLA_OCU_DESCR": "Cabeceiras e áreas envolventes",
                "OSA_ELE_LIN_PAI": "N",
                "OSA_IQFP": "2",
                "OSA_ABN": "0",
                "GRA_COB_SIGLA": null,
                "GRA_COB_DESCR": null,
                "OSA_PRO_BIO": null,
                "OSA_SIE": null,
                "OSA_PRA_PER": "N"
            }
        }
    */
    id: "lpis_pt_ocupacaosolo_2024",
    name: "LPIS PT - Ocupação de Solo 2024",
    name_en: "LPIS PT - Land Cover 2024",
    WFS: true,
    show: false,
    minZoom: 17,
    maxZoom: 20,
    selectedFeatures: [],
    typename: "isip.data:ocupacoes.solo.2024jun10",
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON({
            dataProjection: 'EPSG:4326', // Server data is in EPSG:4326
            featureProjection: 'EPSG:3857' // Map projection is EPSG:3857
        }),
        url: function (extent) {
            var transformedExtent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
            return 'https://www.ifap.pt/isip/ows/isip.data/wfs?' +
            'service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=isip.data:ocupacoes.solo.2024jun10&' +
            'outputFormat=application/json&' +
            'srsname=EPSG:4326&' +
            'bbox=' + transformedExtent.join(',') + ',EPSG:4326';
        },
        strategy: ol.loadingstrategy.bbox
    }),
    zIndex: 2,
    getIdentifier: function(feature) {
      return feature.getProperties().OSA_ID
    },
    infoFn: function (feature) {
      var props = feature.getProperties();
      return [
        { name: "Parcel ID", value: props.PAR_ID },
        { name: "Sub-Parcel number", value: props.OSA_ID },
        { name: "Land-use", value: props.CLA_OCU_SIGLA + " - " + props.CLA_OCU_DESCR },
        { name: "Area", value: (props.OSA_AREA/10000).toFixed(2) + " ha" },
      ];
    },
    getLegendId: function (feature) {
      return feature.getProperties().CLA_OCU_SIGLA;
    },
    getLegendLabel: function(legendEl) {
      return legendEl.CLA_OCU_DESCR_en
    },
    legend: {
      "CTP-CA": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "CTP-CA",
        CLA_OCU_DESCR: "Culturas Temporárias",
        CLA_OCU_DESCR_en: "Temporary Crops",
        color: "#f8d568"
      },
      "TCR-FL": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "TCR-FL",
        CLA_OCU_DESCR: "Talhadia de Curta Duração",
        CLA_OCU_DESCR_en: "Short Rotation Coppice",
        color: "#f5b642"
      },
      "PPE-PP": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PPE-PP",
        CLA_OCU_DESCR: "Prado e Pastagem Permanente",
        CLA_OCU_DESCR_en: "Permanent Pasture",
        color: "#7ec850"
      },
      "PPE-QU": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PPE-QU",
        CLA_OCU_DESCR: "Pastagem Permanente sob Quercíneas",
        CLA_OCU_DESCR_en: "Permanent Pasture under Oaks",
        color: "#68a838"
      },
      "PPE-PM": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PPE-PM",
        CLA_OCU_DESCR: "Pastagem Permanente sob Pinheiro Manso ou Castanheiro",
        CLA_OCU_DESCR_en: "Permanent Pasture under Stone Pine or Chestnut",
        color: "#6bbf4d"
      },
      "PPE-OL": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PPE-OL",
        CLA_OCU_DESCR: "Pastagem Permanente sob Olival",
        CLA_OCU_DESCR_en: "Permanent Pasture under Olives",
        color: "#5faa3b"
      },
      "PPE-MX": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PPE-MX",
        CLA_OCU_DESCR: "Pastagem Permanente sob Árvores Mistas",
        CLA_OCU_DESCR_en: "Permanent Pasture under Mixed Trees",
        color: "#60ba42"
      },
      "PPE-AR": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PPE-AR ",
        CLA_OCU_DESCR: "Prado e Pastagem Permanente Arbustiva",
        CLA_OCU_DESCR_en: "Shrubby Permanent Pasture",
        color: "#87c965"
      },
      "PPE-PL": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PPE-PL",
        CLA_OCU_DESCR: " Prado e Pastagem Permanente Prática Local",
        CLA_OCU_DESCR_en: "Local Practice Permanent Pasture",
        color: "#96dc7b"
      },
      "POM-PM": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "POM-PM",
        CLA_OCU_DESCR: "Culturas Frutícolas",
        CLA_OCU_DESCR_en: "Fruit Crops",
        color: "#ffcc66"
      },
      "VIN-VN": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "VIN-VN",
        CLA_OCU_DESCR: "Vinha",
        CLA_OCU_DESCR_en: "Vineyard",
        color: "#dda027"
      },
      "OLI-OL": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "OLI-OL",
        CLA_OCU_DESCR: "Olival",
        CLA_OCU_DESCR_en: "Olive Grove",
        color: "#c2b266"
      },
      "MXP-MX": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "MXP-MX",
        CLA_OCU_DESCR: "Misto de Culturas Permanentes",
        CLA_OCU_DESCR_en: "Mixed Permanent Crops",
        color: "#e2c96d"
      },
      "OUT-PE": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "OUT-PE",
        CLA_OCU_DESCR: "Outras Culturas Permanentes",
        CLA_OCU_DESCR_en: "Other Permanent Crops",
        color: "#e7ad4a"
      },
      "SOB-CO": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "SOB-CO",
        CLA_OCU_DESCR: "Sobreiros para Cortiça",
        CLA_OCU_DESCR_en: "Cork oaks for cork production",
        color: "#b37d4d"
      },
      "CAB-CP": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "CAB-CP",
        CLA_OCU_DESCR: "Cabeceiras de Culturas Permanentes",
        CLA_OCU_DESCR_en: "Permanent Crop Headlands",
        color: "#d6b76f"
      },
      "CPR-OA": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "CPR-OA",
        CLA_OCU_DESCR: "Culturas Protegidas",
        CLA_OCU_DESCR_en: "Protected Crops",
        color: "#ffdf8d"
      },
      "PEQ-FR": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "PEQ-FR",
        CLA_OCU_DESCR: "Pequenos Frutos",
        CLA_OCU_DESCR_en: "Berry Fruits",
        color: "#7b5ea3"
      },
      "VIV-AG": {
        CAT_OCU_SIGLA: "SAG",
        CAT_OCU_DESCR: "Superfície Agrícola",
        CAT_OCU_DESCR_en: "Agricultural Area",
        CLA_OCU_SIGLA: "VIV-AG",
        CLA_OCU_DESCR: "Viveiros",
        CLA_OCU_DESCR_en: "Nurseries",
        color: "#4caf50"
      },
      "FFL-FL": {
        CAT_OCU_SIGLA: "SFL",
        CAT_OCU_DESCR: "Superfície Florestal",
        CAT_OCU_DESCR_en: "Forested Area",
        CLA_OCU_SIGLA: "FFL-FL",
        CLA_OCU_DESCR: "Espaço Florestal Arborizado",
        CLA_OCU_DESCR_en: "Forested Area",
        color: "#267300"
      },
      "SAR-FL": {
        CAT_OCU_SIGLA: "SFL",
        CAT_OCU_DESCR: "Superfície Florestal",
        CAT_OCU_DESCR_en: "Forested Area",
        CLA_OCU_SIGLA: "SAR-FL",
        CLA_OCU_DESCR: "Vegetação Arbustiva",
        CLA_OCU_DESCR_en: "Shrubland",
        color: "#4d9140"
      },
      "FBQ-FL": {
        CAT_OCU_SIGLA: "SFL",
        CAT_OCU_DESCR: "Superfície Florestal",
        CAT_OCU_DESCR_en: "Forested Area",
        CLA_OCU_SIGLA: "FBQ-FL",
        CLA_OCU_DESCR: "Bosquete",
        CLA_OCU_DESCR_en: "Grove",
        color: "#78ab78"
      },
      "ACE-ON": {
        CAT_OCU_SIGLA: "SFL",
        CAT_OCU_DESCR: "Superfície Florestal",
        CAT_OCU_DESCR_en: "Forested Area",
        CLA_OCU_SIGLA: "ACE-ON",
        CLA_OCU_DESCR: "Aceiros Florestais",
        CLA_OCU_DESCR_en: "Firebreaks",
        color: "#bfbf9d"
      },
      "ZPC-ON": {
        CAT_OCU_SIGLA: "SFL",
        CAT_OCU_DESCR: "Superfície Florestal",
        CAT_OCU_DESCR_en: "Forested Area",
        CLA_OCU_SIGLA: "ZPC-ON",
        CLA_OCU_DESCR: "Zonas de Proteção/Conservação",
        CLA_OCU_DESCR_en: "Protection/Conservation Zones",
        color: "#a0bf8d"
      },
      "FBQ-EP": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "FBQ-EP",
        CLA_OCU_DESCR: "ELP - Bosquete",
        CLA_OCU_DESCR_en: "LF - Grove",
        color: "#78ab78"
      },
      "GRP-EP": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "GRP-EP",
        CLA_OCU_DESCR: "ELP - Galeria Ripícola",
        CLA_OCU_DESCR_en: "LF - Riparian Gallery",
        color: "#88cbaa"
      },
      "LAG-EL": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "LAG-EL",
        CLA_OCU_DESCR: "ELP - Linha de Água",
        CLA_OCU_DESCR_en: "LF - Waterline",
        color: "#4da6ff"
      },
      "ORI-EL": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "ORI-EL",
        CLA_OCU_DESCR: "ELP - Orizicultura",
        CLA_OCU_DESCR_en: "LF - Rice Cultivation",
        color: "#b0d5e9"
      },
      "SEB-EL": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "SEB-EL",
        CLA_OCU_DESCR: "ELP - Sebes",
        CLA_OCU_DESCR_en: "LF - Hedges",
        color: "#7da87f"
      },
      "TLD-EL": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "TLD-EL",
        CLA_OCU_DESCR: "ELP - Talude",
        CLA_OCU_DESCR_en: "LF - Slope/Embankment",
        color: "#a4957d"
      },
      "PCA-EP": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "PCA-EP",
        CLA_OCU_DESCR: "ELP - Património cultural e arqueológico",
        CLA_OCU_DESCR_en: "LF - Cultural and Archaeological Heritage",
        color: "#c78ab8"
      },
      "CHL-EP": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "CHL-EP",
        CLA_OCU_DESCR: "ELP - Lagoas e charcas sem revestimento",
        CLA_OCU_DESCR_en: "LF - Unlined Ponds and Pools",
        color: "#84c2d6"
      },
      "VAL-EL": {
        CAT_OCU_SIGLA: "ELP",
        CAT_OCU_DESCR: "Elementos Lineares e da Paisagem",
        CAT_OCU_DESCR_en: "Linear and Landscape Elements",
        CLA_OCU_SIGLA: "VAL-EL",
        CLA_OCU_DESCR: "ELP - Vala de drenagem/rega sem revestimento",
        CLA_OCU_DESCR_en: "LF - Unlined Drainage/Irrigation Ditch",
        color: "#5a9bcf"
      }
    },
    styleFn: function (layerProps) {
      return function (feature) {
        const isSelected =
          Array.isArray(layerProps.selectedFeatures) &&
          layerProps.selectedFeatures.some(f =>
            f.feature.getProperties().PAR_ID === feature.get("PAR_ID") && f.feature.getProperties().OSA_ID === feature.get("OSA_ID")
          );
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "black",
            width: 0.5,
          }),
          fill: new ol.style.Fill({
            color: isSelected ? 'yellow' : layerProps.legend[feature.get("CLA_OCU_SIGLA")]?.color,
          }),
        });
      };
    },
  },

  lpis_cz_referenceparcel: {
    /*
    "geometry_name": "geom",
            "properties": {
                "OBJECTID": 145061,
                "ORIG_FID": 145061,
                "ORIG_FID_1": 145061,
                "referenceParcelId": "724105902/5",
                "referenceParcelIdNameSpace": "https://hub.agrigis.cz/LPIS/referenceParcelId/",
                "geometry": "polygon",
                "beginLifespanVersion": "2024-02-01T00:00:00Z",
                "endLifespanVersion": "2025-07-31T00:00:00Z",
                "validFrom": "2024-08-01T00:00:00Z",
                "validTo": "2025-07-31T00:00:00Z",
                "ReferenceParcelArea": 0.800000011920929,
                "ReferenceParcelArea_uom": "ha",
                "Shape_Length": 405.0572647733612,
                "Shape_Area": 8014.0161722807015
            }
                */
    id: "lpis_cz_referenceparcel",
    name: "LPIS CZ - Reference Parcel",
    name_en: "LPIS CZ - Reference Parcel",
    WFS: true,
    show: false,
    minZoom: 12,
    maxZoom: 20,
    selectedFeatures: [],
    typename: "mze_lpis:referenceparcel",
    _source: new ol.source.Vector({
        format: new ol.format.GeoJSON({
            dataProjection: 'EPSG:5514', // Server data is in EPSG:4326
            featureProjection: 'EPSG:3857' // Map projection is EPSG:3857
        }),
        url: function (extent) {
          var transformedExtent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:5514');
          return (
            'https://gis.cenia.cz/geoserver/mze_lpis/wfs?' +
            'service=WFS&' +
            'version=1.1.0&' +
            'request=GetFeature&' +
            'typename=mze_lpis:referenceparcel&' +
            'outputFormat=application/json&' +
            'srsname=EPSG:5514&' +
            'bbox=' + transformedExtent.join(',') + ',EPSG:5514'
          );
        },
        strategy: ol.loadingstrategy.bbox
    }),
    source: new ol.source.Vector({
      loader: function (extent, resolution, projection, success, failure) {
        var extent5514 = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:5514');
        var url = 'https://gis.cenia.cz/geoserver/mze_lpis/wfs?' +
                  'service=WFS&version=1.1.0&request=GetFeature&' +
                  'typename=mze_lpis:referenceparcel&' +
                  'outputFormat=application/json&' +
                  'srsname=EPSG:5514&' +
                  'bbox=' + extent5514.join(',') + ',EPSG:5514';

        vectorSource = MAP_LAYERS.lpis_cz_referenceparcel.source

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', url);
        xhr.onerror = function() {
          vectorSource.removeLoadedExtent(extent);
          failure();
        };
        xhr.onload = function() {
          if (xhr.status == 200) {
            var json = xhr.response
            
            // The problem comes from the LPIS CZ WFS GeoJSON response having a property named "geometry" inside the "properties" object, which is a string ("polygon"), shadowing the actual geometry of the feature. OpenLayers’ readFeatures() method assigns all properties under "properties" as feature properties. So, first I remove the properties > geometry before creating the features.
            json.features.forEach(feature => {
              if (feature.properties && feature.properties.geometry) {
                delete feature.properties.geometry;
              }
            });

            var features = new ol.format.GeoJSON({
              dataProjection: 'EPSG:5514',
              featureProjection: 'EPSG:3857'
            }).readFeatures(json);
            vectorSource.addFeatures(features);
            success(features);
          } else {
            onError();
          }
        }
        xhr.send();
      },
      strategy: ol.loadingstrategy.bbox
    }),
    zIndex: 1,
    getIdentifier: function(feature) {
      return feature.getProperties().referenceParcelId
    },
    infoFn: function(feature) {
      var props = feature.getProperties();
      return [
        { name: "Reference parcel ID", value: props.referenceParcelId },
        { name: "Area (ha)", value: parseFloat(props.ReferenceParcelArea).toFixed(2) }
      ]
    },
    getLegendId: function(feature) {
      return 'parcel'
    },
    getLegendLabel: function(legendEl) {
      return legendEl.label_en
    },
    legend: {
      "parcel": {
        label: "Reference parcel",
        label_en: "Reference parcel",
        color: null
      },
    },
    styleFn: function (layerProps) {
      return function (feature) {
        const isSelected =
          Array.isArray(layerProps.selectedFeatures) &&
          layerProps.selectedFeatures.some(f =>
            f.feature.getProperties().referenceParcelId === feature.get("referenceParcelId")
        );
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "black",
            width: 0.5,
          }),
          fill: new ol.style.Fill({
            color: isSelected ? 'yellow' : '#FFFFFF80'
          }),
        });
      }
    },
  },

  lpis_cz_agriculturalarea: {
    /*
    "geometry_name": "geom",
    "properties": {
        "OBJECTID": 3,
        "agriculturalAreaID": "737107105/7",
        "agriculturalAreaIDNameSpace": "https://hub.agrigis.cz/LPIS/AgriculturalAreaId/",
        "agriculturalAreaType": "ArableLand",
        "geometry": "polygon",
        "beginLifespanVersion": "2024-04-16T00:00:00Z",
        "endLifespanVersion": "2025-07-31T00:00:00Z",
        "validFrom": "2024-08-01T00:00:00Z",
        "validTo": "2025-07-31T00:00:00Z",
        "agriculturalAreaArea": 0.430000007152557,
        "agriculturalAreaArea_uom": "ha",
        "Shape_Length": 1501.8935182082,
        "Shape_Area": 4299.229112984
  }
                */
    id: "lpis_cz_agriculturalarea",
    name: "LPIS CZ - Agricultural Area",
    name_en: "LPIS CZ - Agricultural Area",
    WFS: true,
    show: false,
    minZoom: 12,
    maxZoom: 20,
    selectedFeatures: [],
    typename: "mze_lpis:agriculturalarea",
    _source: new ol.source.Vector({
        format: new ol.format.GeoJSON({
            dataProjection: 'EPSG:5514', // Server data is in EPSG:4326
            featureProjection: 'EPSG:3857' // Map projection is EPSG:3857
        }),
        url: function (extent) {
          var transformedExtent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:5514');
          return (
            'https://gis.cenia.cz/geoserver/mze_lpis/wfs?' +
            'service=WFS&' +
            'version=1.1.0&' +
            'request=GetFeature&' +
            'typename=mze_lpis:agriculturalarea&' +
            'outputFormat=application/json&' +
            'srsname=EPSG:5514&' +
            'bbox=' + transformedExtent.join(',') + ',EPSG:5514'
          );
        },
        strategy: ol.loadingstrategy.bbox
    }),
    source: new ol.source.Vector({
      loader: function (extent, resolution, projection, success, failure) {
        var extent5514 = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:5514');
        var url = 'https://gis.cenia.cz/geoserver/mze_lpis/wfs?' +
                  'service=WFS&version=1.1.0&request=GetFeature&' +
                  'typename=mze_lpis:agriculturalarea&' +
                  'outputFormat=application/json&' +
                  'srsname=EPSG:5514&' +
                  'bbox=' + extent5514.join(',') + ',EPSG:5514';

        vectorSource = MAP_LAYERS.lpis_cz_agriculturalarea.source

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', url);
        xhr.onerror = function() {
          vectorSource.removeLoadedExtent(extent);
          failure();
        };
        xhr.onload = function() {
          if (xhr.status == 200) {
            var json = xhr.response
            
            // The problem comes from the LPIS CZ WFS GeoJSON response having a property named "geometry" inside the "properties" object, which is a string ("polygon"), shadowing the actual geometry of the feature. OpenLayers’ readFeatures() method assigns all properties under "properties" as feature properties. So, first I remove the properties > geometry before creating the features.
            json.features.forEach(feature => {
              if (feature.properties && feature.properties.geometry) {
                delete feature.properties.geometry;
              }
            });

            var features = new ol.format.GeoJSON({
              dataProjection: 'EPSG:5514',
              featureProjection: 'EPSG:3857'
            }).readFeatures(json);
            vectorSource.addFeatures(features);
            success(features);
          } else {
            onError();
          }
        }
        xhr.send();
      },
      strategy: ol.loadingstrategy.bbox
    }),
    zIndex: 2,
    getIdentifier: function(feature) {
      return feature.getProperties().agriculturalAreaID
    },
    infoFn: function(feature) {
      var props = feature.getProperties();
      return [
        { name: "ID", value: props.agriculturalAreaID },
        { name: "Type", value: props.agriculturalAreaType },
        { name: "Area (ha)", value: parseFloat(props.agriculturalAreaArea).toFixed(2) }
      ]
    },
    getLegendId: function (feature) {
      return feature.getProperties().agriculturalAreaType
    },  
    getLegendLabel: function(legendEl) {
      return legendEl.label_en
    },  
    legend: {
      "Agroforestry": {
        label: "Agroforestry",
        label_en: "Agroforestry",
        color: "#2e8b57"
      },
      "ArableLand": {
        label: "Arable land",
        label_en: "Arable land",
        color: "#f8d568"
      },
      "PermanentGrassland": {
        label: "Permanent grassland",
        label_en: "Permanent grassland",
        color: "#7ec850"
      },
      "PermanentCrop": {
        label: "Permanent crop",
        label_en: "Permanent crop",
        color: "#e2c96d"
      },
    },
    styleFn: function (layerProps) {
      return function (feature) {
        const isSelected =
          Array.isArray(layerProps.selectedFeatures) &&
          layerProps.selectedFeatures.some(f =>
            f.feature.getProperties().agriculturalAreaID === feature.get("agriculturalAreaID")
          );
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "black",
            width: 0.5,
          }),
          fill: new ol.style.Fill({
            color: isSelected ? "yellow" : layerProps.legend[feature.get("agriculturalAreaType")]?.color,
          }),
        });
      }
    },
  },

  lpis_cz_ecologicalfocusarea: {
    /*
    "properties": {
                "OBJECTID": 43612,
                "ecologicalFocusAreaId": "E730-1070_7301/18",
                "ecologicalFocusAreaIdNameSpace": "https://hub.agrigis.cz/LPIS/ecologicalFocusAreaId/",
                "geometry": "polygon",
                "convertedArea": 0,
                "ecologicalFocusAreaType": "landscapeFeatureIsolatedTree",
                "beginLifespanVersion": "2020-06-02T00:00:00Z",
                "endLifespanVersion": "2025-07-31T00:00:00Z",
                "validFrom": "2024-08-01T00:00:00Z",
                "validTo": "2025-07-31T00:00:00Z",
                "convertedArea_uom": "ha",
                "Shape_Length": 18.772037522847647,
                "Shape_Area": 27.81123821468148
            }
                */
    id: "lpis_cz_ecologicalfocusarea",
    name: "LPIS CZ - Ecological Focus Area",
    name_en: "LPIS CZ - Ecological Focus Area",
    WFS: true,
    show: false,
    minZoom: 17,
    maxZoom: 20,
    selectedFeatures: [],
    typename: "mze_lpis:ecologicalfocusarea",
    _source: new ol.source.Vector({
        format: new ol.format.GeoJSON({
            dataProjection: 'EPSG:5514', // Server data is in EPSG:4326
            featureProjection: 'EPSG:3857' // Map projection is EPSG:3857
        }),
        url: function (extent) {
          var transformedExtent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:5514');
          return (
            'https://gis.cenia.cz/geoserver/mze_lpis/wfs?' +
            'service=WFS&' +
            'version=1.1.0&' +
            'request=GetFeature&' +
            'typename=mze_lpis:ecologicalfocusarea&' +
            'outputFormat=application/json&' +
            'srsname=EPSG:5514&' +
            'bbox=' + transformedExtent.join(',') + ',EPSG:5514'
          );
        },
        strategy: ol.loadingstrategy.bbox
    }),
    source: new ol.source.Vector({
      loader: function (extent, resolution, projection, success, failure) {
        var extent5514 = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:5514');
        var url = 'https://gis.cenia.cz/geoserver/mze_lpis/wfs?' +
                  'service=WFS&version=1.1.0&request=GetFeature&' +
                  'typename=mze_lpis:ecologicalfocusarea&' +
                  'outputFormat=application/json&' +
                  'srsname=EPSG:5514&' +
                  'bbox=' + extent5514.join(',') + ',EPSG:5514';

        vectorSource = MAP_LAYERS.lpis_cz_ecologicalfocusarea.source

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', url);
        xhr.onerror = function() {
          vectorSource.removeLoadedExtent(extent);
          failure();
        };
        xhr.onload = function() {
          if (xhr.status == 200) {
            var json = xhr.response
            
            // The problem comes from the LPIS CZ WFS GeoJSON response having a property named "geometry" inside the "properties" object, which is a string ("polygon"), shadowing the actual geometry of the feature. OpenLayers’ readFeatures() method assigns all properties under "properties" as feature properties. So, first I remove the properties > geometry before creating the features.
            json.features.forEach(feature => {
              if (feature.properties && feature.properties.geometry) {
                delete feature.properties.geometry;
              }
            });

            var features = new ol.format.GeoJSON({
              dataProjection: 'EPSG:5514',
              featureProjection: 'EPSG:3857'
            }).readFeatures(json);
            vectorSource.addFeatures(features);
            success(features);
          } else {
            onError();
          }
        }
        xhr.send();
      },
      strategy: ol.loadingstrategy.bbox
    }),
    zIndex: 3,
    getIdentifier: function(feature) {
      return feature.getProperties().ecologicalFocusAreaId
    },
    infoFn: function(feature) {
      var props = feature.getProperties();
      return [
        { name: "ID", value: props.ecologicalFocusAreaId },
        { name: "Type", value: props.ecologicalFocusAreaType },
        { name: "Area (ha)", value: parseFloat(props.convertedArea).toFixed(2) }
      ]
    },
    getLegendId: function(feature) {
      return feature.getProperties().ecologicalFocusAreaType
    },  
    getLegendLabel: function(legendEl) {
      return legendEl.label_en
    },  
    legend: {
      "hectaresOfArgoForestry": {
        label: "hectaresOfArgoForestry",
        label_en: "Agroforestry",
        color: "#2e8b57"
      },
      "terraces": {
        label: "terraces",
        label_en: "Terraces",
        color: "#a97451"
      },
      "landscapeFeatureIsolatedTree": {
        label: "landscapeFeatureIsolatedTree",
        label_en: "LF - Isolated Tree",
        color: "#5c9e4d"
      },
      "landscapeFeatureGroupOfTrees": {
        label: "landscapeFeatureGroupOfTrees",
        label_en: "LF - Group of Trees",
        color: "#78ab78"
      },
      "landscapeFeatureTreesinLine": {
        label: "landscapeFeatureTreesinLine",
        label_en: "LF - Trees in Line",
        color: "#7da87f"
      },
      "landscapeFeaturesHedgesWoodedStrips": {
        label: "landscapeFeaturesHedgesWoodedStrips",
        label_en: "LF - Hedges / Wooded Strips",
        color: "#7da87f"
      },
    },
    styleFn: function (layerProps) {
      return function (feature) {
        const isSelected =
          Array.isArray(layerProps.selectedFeatures) &&
          layerProps.selectedFeatures.some(f =>
            f.feature.getProperties().ecologicalFocusAreaId === feature.get("ecologicalFocusAreaId")
          );
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "black",
            width: 0.5,
          }),
          fill: new ol.style.Fill({
            color: isSelected ? "yellow" : layerProps.legend[feature.get("ecologicalFocusAreaType")]?.color,
          }),
        });
      }
    },
  },

  /* lpis_pt_alentejo_2020: {
    id: "lpis_pt_alentejo_2020",
    name: "LPIS PT Alentejo 2020",
    jsonURL:
      "https://mvarc.eu/tools/dev/tileserver/LPIS_PT_ALENTEJO_2020_v1.json",
    vectorTile: true,
    show: false,
    disabled: false,
    selectedFeatures: [],
    getLegendId: function (feature) {
      return feature.getProperties().VDO_CODE;
    },
    infoFn: function (feature) {
      var props = feature.getProperties();
      return [
        { name: "Parcel number", value: props.PAR_NUM },
        { name: "Sub-Parcel number", value: props.OSA_ID },
        { name: "Land-use", value: props.VDO_CODE + " - " + props.VDO_DESCRI },
        { name: "Area", value: props.AREA_HA + " ha" },
      ];
    },
    styleFn: function (layerProps) {
      return function (feature) {
        const code = feature.get("VDO_CODE")?.toString();
        const isSelected =
          layerProps.selectedFeatures && layerProps.selectedFeatures.feature
            ? feature.get("PAR_NUM") ==
                layerProps.selectedFeatures.feature.getProperties().PAR_NUM &&
              feature.get("OSA_ID") ==
                layerProps.selectedFeatures.feature.getProperties().OSA_ID
            : false;
        const color = ol.color
          .asArray(layerProps.legendColorNames[code]?.color || "#eeeeee")
          .slice();
        color[3] = 0.5; // change the alpha of the color
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "black",
            width: 0.5,
          }),
          fill: new ol.style.Fill({
            color: isSelected ? "yellow" : color,
          }),
        });
      };
    },
    legendColorNames: {
      11: {
        color: "#f8d568",
        label_pt: "Culturas Temporárias",
        label_en: "Temporary Crops",
      },
      12: {
        color: "#f5b642",
        label_pt: "Talhadia de Curta Duração",
        label_en: "Short Rotation Coppice",
      },
      13: {
        color: "#7ec850",
        label_pt: "Pastagem Permanente",
        label_en: "Permanent Pasture",
      },
      14: {
        color: "#68a838",
        label_pt: "PPE-QU",
        label_en: "Permanent Pasture under Oaks",
      },
      15: {
        color: "#6bbf4d",
        label_pt: "PPE-PM",
        label_en: "Permanent Pasture under Stone Pine or Chestnut",
      },
      16: {
        color: "#5faa3b",
        label_pt: "PPE-OL",
        label_en: "Permanent Pasture under Olives",
      },
      17: {
        color: "#60ba42",
        label_pt: "PPE-MX",
        label_en: "Permanent Pasture under Mixed Trees",
      },
      18: {
        color: "#87c965",
        label_pt: "Pastagem Permanente Arbustiva",
        label_en: "Shrubby Permanent Pasture",
      },
      19: {
        color: "#96dc7b",
        label_pt: "Pastagem Permanente Prática Local",
        label_en: "Local Practice Pasture",
      },
      110: {
        color: "#ffcc66",
        label_pt: "Culturas frutícolas",
        label_en: "Fruit Crops",
      },
      111: { color: "#dda027", label_pt: "Vinha", label_en: "Vineyard" },
      112: { color: "#c2b266", label_pt: "Olival", label_en: "Olive Grove" },
      113: {
        color: "#e2c96d",
        label_pt: "Misto de culturas permanentes",
        label_en: "Mixed Permanent Crops",
      },
      114: {
        color: "#e7ad4a",
        label_pt: "Outras culturas permanentes",
        label_en: "Other Permanent Crops",
      },
      115: {
        color: "#b37d4d",
        label_pt: "Sobreiros destinados à produção de cortiça",
        label_en: "Cork oaks intended for cork production",
      },
      116: {
        color: "#d6b76f",
        label_pt: "Cabeceiras de Culturas Permanentes",
        label_en: "Permanent Crop Headlands",
      },
      117: {
        color: "#ffdf8d",
        label_pt: "Culturas protegidas",
        label_en: "Protected Crops",
      },

      21: {
        color: "#267300",
        label_pt: "Espaço florestal arborizado",
        label_en: "Forested Area",
      },
      22: {
        color: "#4d9140",
        label_pt: "Superfície com Vegetação Arbustiva",
        label_en: "Shrubland",
      },
      23: { color: "#2d862d", label_pt: "Bosquetes", label_en: "Groves" },
      24: {
        color: "#bfbf9d",
        label_pt: "Aceiros florestais",
        label_en: "Firebreaks",
      },
      25: {
        color: "#a0bf8d",
        label_pt: "Zonas de Protecção",
        label_en: "Protection Zones",
      },
      26: {
        color: "#8fc57f",
        label_pt: "Galeria Ripícola em Espaço Florestal",
        label_en: "Riparian Gallery in Forest Area",
      },
      31: {
        color: "#999999",
        label_pt: "Área social",
        label_en: "Social Area",
      },
      32: { color: "#cccccc", label_pt: "Vias", label_en: "Roads" },
      33: {
        color: "#aaaaaa",
        label_pt: "Improdutivo",
        label_en: "Unproductive",
      },
      34: {
        color: "#5f9eea",
        label_pt: "Massas de água",
        label_en: "Water Bodies",
      },
      35: { color: "#a3d5e3", label_pt: "Zonas Húmidas", label_en: "Wetlands" },
      36: {
        color: "#e0e0e0",
        label_pt: "Outras Superfícies",
        label_en: "Other Surfaces",
      },
      37: {
        color: "#cc66cc",
        label_pt: "Ocupação por classificar",
        label_en: "Unclassified Occupation",
      },
      38: {
        color: "#f2e36b",
        label_pt: "Culturas sem contacto com o solo",
        label_en: "Soilless Crops",
      },
      39: {
        color: "#a8d3a2",
        label_pt: "Superfície com árvores a identificar",
        label_en: "Surface with Unidentified Trees",
      },
      41: {
        color: "#78ab78",
        label_pt: "Elemento de Paisagem Bosquete",
        label_en: "Landscape Element – Grove",
      },
      42: {
        color: "#88cbaa",
        label_pt: "Elemento de Paisagem Galeria Ripícola",
        label_en: "Landscape Element – Riparian Gallery",
      },
      43: {
        color: "#4da6ff",
        label_pt: "Elemento Linear Linha de Água",
        label_en: "Linear Element – Waterline",
      },
      44: {
        color: "#b0d5e9",
        label_pt: "Elemento Linear em Orizicultura",
        label_en: "Linear Element – Rice Cultivation",
      },
      45: {
        color: "#7da87f",
        label_pt: "Elemento Linear Sebe ou Corta-Vento",
        label_en: "Linear Element – Hedge/Windbreak",
      },
    },
  },*/

  tree_cover_density_2021: {
    id: "tree_cover_density_2021",
    name_en: "Tree Cover Density 2021",
    isCopernicus: true,
    show: false,
    baselayer: false,
    WMS: true,
    isLoading: false,
    selectedFeatures: [],
    source: new ol.source.TileWMS({
      my_layer_id: "tree_cover_density_2021",
      url: "https://geoserver.vlcc.geoville.com/geoserver/ows",
      params: {
        LAYERS: "HRL_TCF:TCD_S2021",
        TILED: true,
        VERSION: "1.3.0",
      },
      serverType: "geoserver",
      transition: 0,
    }),
    zIndex: 4,
    infoFn: function (idx) {
      return [{ name: "Tree cover density (at the clicked pixel)", value: idx + "%" }];
    },
    getLegendId: function (idx) {
      if (idx > 1 && idx < 50) {
        return 2;
      } else if (idx > 50 && idx < 100) {
        return 51;
      } else {
        return idx;
      }
    },
    getLegendLabel: function(legendEl) {
      return legendEl.label_en
    },
    legend: {
      0: { color: "#f0f0f0", label_en: "0% - Non-tree covered areas" },
      1: { color: "#fdff73", label_en: "1% Tree cover" },
      2: {
        color: "linear-gradient(#fdff73, #4ce600)",
        label_en: "2–49% Tree cover",
      },
      50: { color: "#4ce600", label_en: "50% Tree cover" },
      51: {
        color: "linear-gradient(#4ce600, #1c5c24)",
        label_en: "51–99% Tree cover",
      },
      100: { color: "#1c5c24", label_en: "100% Tree cover" },
    },
  },
};
