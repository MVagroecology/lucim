var layer_mixin = {
    // avoid using data() {...} in mixins because references get lost when merging with components own data objects
    computed: {
        map() {
            return this.$parent.$data.map
        },
        source() {
            return this.layer?.getSource()
        }
    },
    created() {
        var _this = this

        // create Layer
        var source_props = {
            format: _this.format,
            url: _this.url,
            attributions: _this.attributions,
            strategy: _this.strategy,
            params: _this.params, // only for wms
            serverType: _this.serverType, // only for wms
        }

        this.setLoaderIfNeeded(source_props)

        var source = new ol.source[_this.olSourceType](source_props)
        
        this.layer = new ol.layer[_this.olLayerType]({
            my_layer_id: _this.layer_id,
            source: source,
            style: _this.style,
            minZoom: _this.minZoom,
            maxZoom: _this.maxZoom,
            zIndex: _this.zIndex,
            opacity: _this.opacity
        });
        
        
        this.map.addLayer(this.layer);
        
        this.setShow(this.show)
        
        // toggle events
        
        VueBus.$on('hideBaselayers', function(id) {
            if (_this.layer_id != id && _this.baselayer) {
                _this.setShow(false)
            }
        })
        
        VueBus.$on('updateLayerVisibility', function(id, toShow) {
            if (_this.layer_id == id) {
                _this.setShow(toShow)
            }
        })

        // loading events

        this.source.on(this.eventResource + 'loadstart', function(ev) {
            _this.isLoading = true
        });

        this.source.on(this.eventResource + 'loadend', function(ev) {
            _this.isLoading = false
        });
        
        this.source.on(this.eventResource + 'loaderror', function(ev) {
            console.log('loaderror: ' + _this.layer_id + ': ' + ev.error);
            _this.isLoading = false;
        });

        this.addClickListener()
    },
    methods: {
        setLoaderIfNeeded(source_props) {
            if ([
                "lpis_cz_referenceparcel",
                "lpis_cz_agriculturalarea",
                "lpis_cz_ecologicalfocusarea"
            ].includes(this.layer_id)) {
                source_props.loader = this.loader
            }
        },
        setShow(toShow) {
            if (this.layer) {
                this.layer.setVisible(toShow)
                this.$set(this.layer, "show", toShow)
                if (this.baselayer && toShow) {
                    VueBus.$emit('hideBaselayers', this.layer_id)
                }
            }
        },
        generateInfo(feature) {
            var info = []
            for (var legend_key_obj of this.feature_infos) {
                var value = ""
                if ('keys' in legend_key_obj) {
                    if ('transform' in legend_key_obj) {
                        if (legend_key_obj.transform == "concatenate") {
                            for (key of legend_key_obj.keys) {
                                value += this.getFeatureProperty(feature, key) + " - "
                            }
                            value = value.slice(0, value.length-3)
                        } else {
                            console.log(this.layer_id + ': keys with transform that\'s not yet implemented: ' + legend_key_obj.transform)
                        }
                    } else {
                        console.log(this.layer_id + ': keys with no designated transform')
                    }
                } else if ('key' in legend_key_obj) {
                    if ('transform' in legend_key_obj) {
                        if (legend_key_obj.transform == "square_m_to_ha") {
                            value = (this.getFeatureProperty(feature, legend_key_obj.key)/10000).toFixed(2)
                        } else if (legend_key_obj.transform == "get_from_legend") {
                            var legend_value = this.getFeatureProperty(feature, legend_key_obj.key)
                            var legend_key = legend_key_obj.alternate_key
                            value = this.layer_legend[legend_value][legend_key]
                        } else {
                            console.log(this.layer_id + ': key with transform that\'s not yet implemented: ' + legend_key_obj.transform)
                        }
                    } else {
                        value = this.getFeatureProperty(feature, legend_key_obj.key)
                    }
                } else {
                    console.log(this.layer_id + ': no key or keys implemented')
                }
                info.push({
                    name: legend_key_obj.name,
                    value: value
                })
            }
            return info
        }
    }
}