<script>
module.exports = {
    name: "toggle-layer",
    props: [ 'layerProps' ],
	data() {
		return {
            tileJSON: {},
            layer: null,
            featureIndex: {},
		}
	},
    created() {
        this.createLayer()
    },
    mounted() {
        var _this = this

        VueBus.$on('hideBaselayers', function(id) {
            if (_this.layerProps.id == id) {
                return // ignore
            } else if (_this.layerProps.baselayer) {
                _this.show = false
            }
        })

        VueBus.$on('buildFeatureIndex', function() {
            if (_this.layerProps.id == 'lpis_pt_alentejo_2020') {
                _this.buildFeatureIndex()
            }
        })

        VueBus.$on('goToParcel', function(searchValue) {
            if (_this.layerProps.id == 'lpis_pt_alentejo_2020') {
                _this.goToParcel(searchValue)
            }
        })

        VueBus.$on('calcAvg', function() {
            if (_this.layerProps.id == 'lpis_pt_alentejo_2020') {
                _this.calculateAvg()
            }
        })
    },
    computed: {
        show: {
            get() {
				return this.layerProps.show
			},
			set(toShow) {
				this.$set(this.layerProps, 'show', toShow)
                if (this.layer) {
                    this.layer.setVisible(toShow)
                    if (this.layerProps.baselayer && toShow) {
                        VueBus.$emit('hideBaselayers', this.layerProps.id)
                    }
                }
                /*if (toShow && this.layer) {
                    if (this.layerProps.baselayer) {
                        if (this.map.getLayers().getLength() == 0) {
                            this.map.addLayer(this.layer);
                        } else {
                            this.map.getLayers().setAt(0, this.layer);
                        }
                        VueBus.$emit('hideBaselayers', this.layerProps.id)
                    } else {
                        this.map.addLayer(this.layer);
                    }
                } else {
                    this.layer ? this.map.removeLayer(this.layer) : null
                }*/
			}
        },
        map() {
            return this.$parent.$data.map
        },
    },
    methods: {
        createLayer() {
            var _this = this

            if (this.layerProps.id == 'osm') {
                this.layer = new ol.layer.Tile({
                    my_layer_id: this.layerProps.id,
                    source: new ol.source.OSM(),
                    opacity: this.layerProps.baselayer ? 0.5 : 1
                });
                this.map.addLayer(this.layer);
                this.show = this.layerProps.show

            } else if (this.layerProps.tileXYZ) {
                this.layer = new ol.layer.Tile({
                    my_layer_id: this.layerProps.id,
                    source: new ol.source.XYZ({
                        url: this.layerProps.url,
                        attributions:  this.layerProps.attributions,
                        maxZoom: this.layerProps.maxZoom,
                        minZoom: this.layerProps.minZoom
                    }),
                    opacity: this.layerProps.baselayer ? 0.5 : 1
                });
                this.map.addLayer(this.layer);
                this.show = this.layerProps.show

            } else if (this.layerProps.tileWMS) {
                this.layer = new ol.layer.Tile({
                    source: new ol.source.TileWMS(this.layerProps.source)
                });
                this.map.addLayer(this.layer);
                this.show = this.layerProps.show

                this.map.on('singleclick', function (evt) {
                    const viewResolution = _this.map.getView().getResolution();
                    const viewProjection = _this.map.getView().getProjection();
                    const source = _this.layer.getSource();

                    const url = source.getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {
                        'INFO_FORMAT': 'application/json',
                        'QUERY_LAYERS': 'HRL_TCF:TCD_S2021',
                    });

                    if (url) {
                        fetch(url)
                        .then(res => res.json())
                        .then(function(data) {
                            var idx = data.features[0]?.properties.PALETTE_INDEX
                            _this.$set(_this.layerProps, 'selectedFeatures', {
                                layerId: _this.layerProps.id,
                                legendId: _this.layerProps.getLegendId(idx),
                                feature: data,
                                info: _this.layerProps.infoFn(idx)
                            })
                        })
                        .catch(err => console.error(err));
                    }
                });
            
            } else if (this.layerProps.WFS) {
                this.layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: function (extent) {
                            return 'https://www.ifap.pt/isip/ows/isip.data/wfs?' +
                            'service=WFS&' +
                            'version=1.1.0&request=GetFeature&typename=isip.data:ocupacoes.solo.2022jun10&' +
                            'outputFormat=application/json&' +
                            'srsname=EPSG:3857&' +
                            'bbox=' + extent.join(',') + ',EPSG:3857';
                        },
                        strategy: ol.loadingstrategy.bbox
                    }),
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'blue',
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(0, 0, 255, 0.1)'
                        })
                    })
                });
                this.map.addLayer(this.layer);
                this.show = this.layerProps.show


                
            } else if (this.layerProps.vectorTile) {
                if (this.layerProps.jsonURL) {
                    fetch(this.layerProps.jsonURL)
                        .then(response => response.json())
                        .then(json => {
                            _this.tileJSON = json
                            _this.layer = new ol.layer.VectorTile({
                                my_layer_id: _this.layerProps.id,
                                source: new ol.source.VectorTile({
                                    format: new ol.format.MVT(),
                                        urls: json.tiles,
                                        tileGrid: ol.tilegrid.createXYZ({
                                        minZoom: json.minzoom,
                                        maxZoom: json.maxzoom,
                                        tileSize: 512 // Optional: match your tile server
                                    })
                                }),
                                style: _this.layerProps.styleFn(_this.layerProps)
                            });
                            _this.map.addLayer(_this.layer);
                            _this.show = _this.layerProps.show

                            _this.map.on('singleclick', function (e) {
                                _this.$set(_this.layerProps, 'selectedFeatures', {})
                                _this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                                    if (_this.layerProps.id == layer.get('my_layer_id')) {
                                        _this.$set(_this.layerProps, 'selectedFeatures', {
                                            layerId: _this.layerProps.id,
                                            legendId: _this.layerProps.getLegendId(feature),
                                            feature: feature,
                                            info: _this.layerProps.infoFn(feature)
                                        })
                                        _this.layer.changed(); // Re-render styles
                                    }
                                    return true;
                                });
                            });
                        });
                }
            }
        },
        goToParcel(searchValue) {
            this.$set(this.layerProps, 'currentHighlight', null)
            
            const matches = this.featureIndex[searchValue];

            if (!matches || matches.length === 0) {
                alert('Parcel not found. Make sure relevant tiles are loaded.');
                return;
            }

            this.$set(this.layerProps, 'currentHighlight', searchValue)
            this.layer.changed(); // Re-render styles

            const extents = matches.map(f => f.getGeometry().getExtent());
            const fullExtent = extents.reduce((acc, e) => ol.extent.extend(acc, e));
            this.map.getView().fit(fullExtent, { duration: 600, maxZoom: 17 });
        },
        calculateAvg() {
            var features = this.featureIndex[this.layerProps.currentHighlight]
            var feature = features[0]
            const mvtFormat = new ol.format.MVT();
            const projection = this.map.getView().getProjection();

            const realFeature = mvtFormat.readFeature(feature, {
                featureProjection: projection
            });
            const geojsonFormat = new ol.format.GeoJSON();
            const turfFeature = geojsonFormat.writeFeatureObject(realFeature, {
                featureProjection: 'EPSG:3857',    // the projection used in OL
                dataProjection: 'EPSG:4326'        // what Turf expects (WGS84)
            });
            console.log(turf.area(turfFeature))
        },
    }
}
</script>

<template>
    <div class="form-check ml-2">
        <input class="form-check-input" type="checkbox"
            :disabled="layerProps.disabled"
            :value="layerProps.id"
            v-model="show">
        <label class="form-check-label">Show {{ layerProps.name_en }}</label>
    </div>
</template>