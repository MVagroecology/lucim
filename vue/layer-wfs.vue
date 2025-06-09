<script>
module.exports = {
    name: "layer-wfs",
    props: [ 'layerProps' ],
	data() {
		return {
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
        VueBus.$on('toggleLayer', function(id, toShow) {
            if (_this.layerProps.id == id) {
                _this.show = toShow
            }
        })

        VueBus.$on('goToParcel', function(searchValue) {
            if (_this.layerProps.id == 'lpis_pt_parcelas_2024') {
                _this.goToParcel(searchValue)
            }
        })

        VueBus.$on('calcAvg', function() {
            if (_this.layerProps.id == 'lpis_pt_ocupacaosolo_2024') {
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
			}
        },
        map() {
            return this.$parent.$data.map
        },
    },
    methods: {
        createLayer() {
            var _this = this

            var source = _this.layerProps.source
                
            this.layer = new ol.layer.Vector({
                my_layer_id: _this.layerProps.id,
                source: source,
                style: _this.layerProps.styleFn(_this.layerProps, _this.map),
                minZoom: _this.layerProps.minZoom,
                maxZoom: _this.layerProps.maxZoom,
                zIndex: this.layerProps.zIndex
            });
            this.map.addLayer(this.layer);
            this.show = this.layerProps.show

            _this.layerProps.source.on('featuresloadstart', function (ev) {
                _this.$set(_this.layerProps, 'isLoading', true)
            });

            _this.layerProps.source.on('featuresloadend', function (ev) {
                _this.$set(_this.layerProps, 'isLoading', false)
            });

            _this.layerProps.source.on('featuresloaderror', function (ev) {
                console.log(ev.error)
                _this.$set(_this.layerProps, 'isLoading', false)
            });

            var isSameFeature = function(fA, fB) {
                return _this.layerProps.getIdentifier(fA) === _this.layerProps.getIdentifier(fB)
            }

            this.map.on('singleclick', function (evt) {
                let featureFound = false
                _this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                    featureFound = true

                    const newFeatureInfo = {
                        layerId: _this.layerProps.id,
                        layerName: _this.layerProps.name_en,
                        legendId: _this.layerProps.getLegendId(feature),
                        feature: feature,
                        info: _this.layerProps.infoFn(feature)
                    };

                    const alreadySelected = _this.layerProps.selectedFeatures.some(f =>
                            isSameFeature(f.feature, feature)
                        );

                    if (evt.originalEvent.shiftKey) { // mouse click + shift key
                        // Multi-selection mode

                        if (!_this.layerProps.selectedFeatures) {
                            _this.$set(_this.layerProps, 'selectedFeatures', []);
                        }

                        if (alreadySelected) {
                            // clicking in an alreadySelected feature removes its selection
                            _this.$set(_this.layerProps, 'selectedFeatures', _this.layerProps.selectedFeatures.filter(f =>
                                !isSameFeature(f.feature, feature)
                            ))
                        } else {
                            // if not selected, adds feature to selection
                            _this.layerProps.selectedFeatures.push(newFeatureInfo);
                        }

                    } else { // only mouse click

                        if (alreadySelected) {

                            if (_this.layerProps.selectedFeatures.length > 1) {
                                // if various features selected, clear all, keep this
                                _this.$set(_this.layerProps, 'selectedFeatures', []);
                                _this.layerProps.selectedFeatures.push(newFeatureInfo);

                            } else {
                                // if only this is selected, remove it
                                _this.$set(_this.layerProps, 'selectedFeatures', []);
                            }

                        } else {
                            // Single selection mode
                            _this.$set(_this.layerProps, 'selectedFeatures', [newFeatureInfo]);
                        }
                    }
                    _this.layer.changed();
                    return true;
                },
                {
                    layerFilter: function (layer) {
                        return layer.get('my_layer_id') === _this.layerProps.id && layer.getVisible()
                    }
                })

                if (!featureFound) {
                    if (!evt.originalEvent.shiftKey) {
                        // clicking in a place where there are no fetures, clears the selection
                        _this.$set(_this.layerProps, 'selectedFeatures', []);
                        _this.layer.changed();
                    }
                }
            });
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
        <label class="form-check-label">{{ layerProps.name_en }}</label>
    </div>
</template>