<script>
module.exports = {
    name: "layer-wms",
    mixins: [ layer_mixin ],
    props: [ 'layer_id', 'layer_props' ],
	data() {
        this.$set(this.layer_props, "layer", null)
        this.$set(this.layer_props, "lastCalledURL", null)
        this.$set(this.layer_props, "selectedFeatures", [])
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.layer_props.olLayerType = 'Tile'
        this.layer_props.olSourceType = 'TileWMS'
        this.layer_props.eventResource = 'tile'
        
		return this.layer_props
	},
    computed: {
        url() {
            return this.source_url.split('?')[0].replaceAll('[layer_name]', this.layer_name).replaceAll('[layer_name_detail]', this.layer_name_detail).replaceAll('[layer_projection]', this.layer_projection)
        },
        params() {
            var url = this.source_url.replaceAll('[layer_name]', this.layer_name).replaceAll('[layer_name_detail]', this.layer_name_detail).replaceAll('[layer_projection]', this.layer_projection)
            const urlSearchParams = new URLSearchParams(url.split('?')[1]);
            const params = Object.fromEntries(urlSearchParams.entries());
            return params
        },
        serverType() {
            if (this.source_url.toLowerCase().includes("geoserver")) {
                return "geoserver"
            } else if (this.source_url.toLowerCase().includes("mapserver")) {
                return "mapserver"
            }
        },
        projection() {
            return this.layer_projection
        }
    },
    methods: {
        addClickListener() {
            var _this = this
            
            this.map.on('singleclick', function (evt) {

                if (!_this.layer.getVisible() || _this.layer_id == "jrc_gfc_2020_v2") {
                    return
                }
                const viewResolution = _this.map.getView().getResolution();
                const viewProjection = _this.map.getView().getProjection();

                const url = _this.source.getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {
                    'INFO_FORMAT': _this.feature_info_format,
                    'QUERY_LAYERS': _this.feature_info_query,
                });

                if (!url) {
                    console.log(_this.layer_id + " no url for click listener.")
                    return;
                }

                fetch(url)
                    .then(function(res) {
                        if (["application/json", "application/geo+json"].includes(_this.feature_info_format)) {
                            return res.json()
                        } else {
                            return res.text()
                        }
                    })
                    .then(function (data) {
                        
                        if (!data.features || data.features.length === 0) {
                            _this.selectedFeatures = []
                            return
                        }

                        const feature = data.features[0];

                        const newFeatureWrapper = {
                            layerId:   _this.layer_id,
                            layerName: _this.name_en,
                            projection: _this.layer_projection,
                            legendId:  _this.generateLegendKey(feature),
                            info:      _this.generateInfo(feature),
                            feature:   feature
                        };
                        
                        _this.selectedFeatures = [newFeatureWrapper]
                        _this.selectedLegendElements = _this.selectedFeatures.map(function(f) {
                            return f.legendId
                        })
                        return true;
                    })
                    .catch(err => console.error(_this.layer_id + " fetch error: " + err));
            })
        },
        getFeatureProperty(f, prop) {
            return f.properties[prop]
        },
        generateLegendKey(feature) {
            const value = feature.properties[this.feature_identifier]

            if ('transform' in this.feature_legend_identifier) {
                if (this.feature_legend_identifier.transform == "intervals") {
                    var idx = 0
                    var interval_val = this.feature_legend_identifier.intervals[idx]
                    while (value >= interval_val) {
                        idx++
                        interval_val = this.feature_legend_identifier.intervals[idx]
                    }
                    return this.feature_legend_identifier.intervals[idx-1].toString()
                } else {
                    console.log(this.layer_id + ': feature_legend_identifier with transform that\'s not yet implemented: ' + this.feature_legend_identifier.transform)
                }
            } else {
                return value.toString()
            }
        },
    }
}
</script>

<template>
    <div class="form-check">
        <input class="form-check-input" type="checkbox"
            :disabled="disabled"
            @change="setShow($event.target.checked)"
            v-model="show">
        <label class="form-check-label">{{ name_en }} <img class="layer-logo" v-if="layer_groups.includes('copernicus')" src="img/copernicus_logo.png"><img class="layer-logo" v-if="layer_groups.includes('jrc')" src="img/jrc.jpg"></label>
    </div>
</template>