<script>
module.exports = {
    name: "layer-wms",
    props: [ 'layerProps' ],
	data() {
		return {
            layer: null,
            featureIndex: {},
            TDCPointGridLayer: null,
            MAX_TCD_POINTS: 100
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
        VueBus.$on('toggleLayer', function(id, toShow) {
            if (_this.layerProps.id == id) {
                _this.show = toShow
            }
        })

        VueBus.$on('calculateAvg', function(gridSpacing) {
            if (_this.layerProps.id == 'tree_cover_density_2021') {
                _this.calculateAvg(gridSpacing)
            }
        })

        VueBus.$on('clearCalculateAvg', this.clearTCDPointGrid)

        VueBus.$on('toggleTDCPointGridLayer', this.toggleTDCPointGridLayer)
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
			}
        },
        map() {
            return this.$parent.$data.map
        },
        TCDDetails() {
            return this.$parent.$data.TCDDetails
        },
        layers() {
            return this.$parent.$data.layers
        },
    },
    methods: {
        createLayer() {
            var _this = this

            this.layer = new ol.layer.Tile({
                source: this.layerProps.source,
                zIndex: this.layerProps.zIndex
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

                if (!url) return;

                fetch(url)
                    .then(res => res.json())
                    .then(function (data) {
                    if (!data.features || data.features.length === 0) return;

                    const feature = data.features[0];
                    const idx = feature.properties?.PALETTE_INDEX;

                    const newFeatureInfo = {
                        layerId: _this.layerProps.id,
                        layerName: _this.layerProps.name_en,
                        legendId: _this.layerProps.getLegendId(idx),
                        feature: data,
                        info: _this.layerProps.infoFn(idx),
                    };

                    if (evt.originalEvent.shiftKey) {
                        // Multi-selection mode
                        if (!_this.layerProps.selectedFeatures) {
                        _this.$set(_this.layerProps, 'selectedFeatures', []);
                        }

                        const alreadySelected = _this.layerProps.selectedFeatures.some(f =>
                            f.feature.features[0].id === feature.id
                        );

                        if (!alreadySelected) {
                            _this.layerProps.selectedFeatures.push(newFeatureInfo);
                        }
                    } else {
                        // Single selection mode
                        _this.$set(_this.layerProps, 'selectedFeatures', [newFeatureInfo]);
                    }
                    return true;
                    })
                    .catch(err => console.error(err));
                });

            this.layerProps.source.on('tileloadstart', function () {
                _this.$set(_this.layerProps, 'isLoading', true)
            });

            this.layerProps.source.on('tileloadend', function () {
                _this.$set(_this.layerProps, 'isLoading', false)
            });

            this.layerProps.source.on('tileloaderror', function () {
                // TODO What error? Display message?
                _this.$set(_this.layerProps, 'isLoading', false)
            });
        },
        toggleTDCPointGridLayer(toShow) {
            this.TDCPointGridLayer?.setVisible(toShow);
        },
        clearTCDPointGrid() {
            this.TDCPointGridLayer?.getSource().clear()
            for (var layerID in this.layers) {
                var layer = this.layers[layerID]
                if ('avgTCD' in layer) {
                    this.$delete(layer, 'avgTCD')
                    for (var match of layer.selectedFeatures) {
                        this.$delete(match.feature, 'avgTCD')
                    }
                }
            }
        },
        calculateAvg(distance) {
            if (!distance) {
                distance = 10
            }
            var smallestNewDistance = distance

            const _this = this;

            const geojsonFormat = new ol.format.GeoJSON();

            if (!this.TDCPointGridLayer) {
                this.TDCPointGridLayer = new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    visible: _this.TCDDetails,
                    style: new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 3,
                            fill: new ol.style.Fill({ color: 'red' }),
                            stroke: new ol.style.Stroke({ color: 'white', width: 1 })
                        })
                    }),
                    zIndex: 1000
                });

                this.map.addLayer(this.TDCPointGridLayer);
            }
            
            const pointGridSource = this.TDCPointGridLayer.getSource()
            pointGridSource.clear()

            let layerLevelPromises = [];
            
            for (var layerID in this.layers) {
                var layer = this.layers[layerID]

                if (!layer.show) {
                    continue
                }
                
                var matches = layer.selectedFeatures;

                if (!matches || matches.length == 0) {
                    continue
                }
    
                for (var match of matches) {
                    var feature = match.feature
                    var newDistance = null
                    
                    const geojson = geojsonFormat.writeFeatureObject(feature, {
                        featureProjection: 'EPSG:3857',
                        dataProjection: 'EPSG:4326'
                    });

                    const geometry = geojson.geometry;
                    if (!geometry) continue;

                    const bbox = turf.bbox(geojson);
                    var points = turf.pointGrid(bbox, distance, {
                        mask: geojson,
                        units: 'meters'
                    });

                    // console.log(points.features.length)

                    if (points.features.length > this.MAX_TCD_POINTS) {
                        const area = turf.area(geojson); // in square meters
                        const desiredPointCount = 100;
                        const cellArea = area / desiredPointCount;
                        newDistance = Math.floor(Math.sqrt(cellArea)); // meters
                        smallestNewDistance = Math.min(smallestNewDistance, newDistance)

                        /*alert('Too many sample points at a ' + distance + 'm x ' + distance + 'm for parcel ' + layer.getIdentifier(feature) + '. Re-doing grid with ' + desiredPointCount + ' points, with a grid spacing of ' + newDistance + 'm x ' + newDistance + 'm.')*/

                        points = turf.pointGrid(bbox, newDistance, {
                            mask: geojson,
                            units: 'meters'
                        });
                    }
                    
                    const matchPointPromises = points.features.map(pt => {
                        const olFeature = geojsonFormat.readFeature(pt, {
                            featureProjection: 'EPSG:3857'
                        });
                        pointGridSource.addFeature(olFeature);

                        const coord = pt.geometry.coordinates;
                        return _this.getValueAt(coord, layer, match);
                    });

                    // Handle results per match
                    const matchPromise = Promise.allSettled(matchPointPromises).then(results => {
                        const valid = results
                            .filter(r => r.status === "fulfilled" && r.value && r.value.value !== null)
                            .map(r => r.value.value);

                        const total = valid.reduce((a, b) => a + b, 0);
                        const avg = valid.length > 0 ? total / valid.length : 0;

                        var match = results[0].value.match
                        var layer = results[0].value.layer
                        _this.$set(match, 'avgTCD', avg);
                        return { layer, match, avg };
                    });

                    layerLevelPromises.push(matchPromise);
                }
            }

            // When all match-level averages are ready, summarize per layer
            Promise.allSettled(layerLevelPromises).then(results => {
                const layerAvgs = {};

                for (const res of results) {
                    if (res.status !== "fulfilled" || !res.value) continue;
                    const { layer, avg } = res.value;

                    if (!layerAvgs[layer.id]) {
                        layerAvgs[layer.id] = { total: 0, count: 0 };
                    }

                    layerAvgs[layer.id].total += avg;
                    layerAvgs[layer.id].count += 1;
                }

                for (const id in layerAvgs) {
                    const data = layerAvgs[id];
                    const finalAvg = data.count > 0 ? data.total / data.count : 0;
                    this.$set(this.layers[id], 'avgTCD', finalAvg);
                }
            });
            
            VueBus.$emit('updatedGridSpacing', newDistance == null ? distance : newDistance)
            
            // Fit view
            if (pointGridSource.getFeatures().length > 0) {
                const extent = pointGridSource.getExtent();
                _this.map.getView().fit(extent, {
                    padding: [50, 50, 50, 50],
                    maxZoom: 19,
                    duration: 1000
                });
            }
        },
        getValueAt(coord, layer, match) {
            const [lon, lat] = coord;
            const delta = 0.01; // small bbox around the point
            const bbox = `${lat - delta},${lon - delta},${lat + delta},${lon + delta}`;

            const url = `https://geoserver.vlcc.geoville.com/geoserver/ows?` +
                `service=WMS&version=1.3.0&request=GetFeatureInfo&` +
                `layers=HRL_TCF:TCD_S2021&query_layers=HRL_TCF:TCD_S2021&` +
                `info_format=application/json&crs=EPSG:4326&` +
                `bbox=${bbox}&width=101&height=101&i=50&j=50`;

            return fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then(json => {
                    var value = json.features?.[0]?.properties?.PALETTE_INDEX;
                    value = value !== undefined ? parseFloat(value) : null
                    value = (value !== null && !isNaN(value)) ? value : null;
                    return { layer, match, value };
                })
                .catch(err => {
                    console.error("GetFeatureInfo error:", err);
                    return null;
                });
        }
    }
}
</script>

<template>
    <div class="form-check ml-2">
        <input class="form-check-input" type="checkbox"
            :disabled="layerProps.disabled"
            :value="layerProps.id"
            v-model="show">
        <label class="form-check-label">{{ layerProps.name_en }} <img src="img/copernicus_logo.png"></label>
    </div>
</template>