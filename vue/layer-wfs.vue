<script>
module.exports = {
    name: "layer-wfs",
    mixins: [ layer_mixin ],
    props: [ 'layer_id', 'layer_props' ],
	data() {
        this.$set(this.layer_props, "layer", null)
        this.$set(this.layer_props, "selectedFeatures", [])
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.layer_props.olLayerType = 'Vector'
        this.layer_props.olSourceType = 'Vector'
        this.layer_props.olFormatType = 'GeoJSON'
        this.layer_props.eventResource = 'features'
        
		return this.layer_props
	},
    computed: {
        url() {
            var _this = this
            return function (extent) {
                var transformedExtent = extent
                if (MAP_PROJECTION != _this.layer_projection) {
                    transformedExtent = ol.proj.transformExtent(extent, MAP_PROJECTION, _this.layer_projection);
                }
                return _this.source_url.replaceAll('[layer_name]', _this.layer_name).replaceAll('[layer_name_detail]', _this.layer_name_detail).replaceAll('[layer_projection]', _this.layer_projection).replaceAll('[extent]', transformedExtent.join(','))
            }
        },
        format() {
            var _this = this
            return new ol.format[_this.olFormatType]({
                dataProjection: _this.layer_projection, // Server data
                featureProjection: MAP_PROJECTION // Map projection
            })
        },
        strategy() {
            return ol.loadingstrategy.bbox
        },
        style() {
            var _this = this
            return function(feature) {

                var isSelected = Array.isArray(_this.selectedFeatures) &&
                _this.selectedFeatures.some(f =>
                    f.feature.get(_this.feature_identifier) === feature.get(_this.feature_identifier)
                );

                var zoom = _this.map.getView().getZoom();

                var stroke_style = new ol.style.Stroke({
                    color: isSelected ? _this.layer_style.selected_stroke_color : _this.layer_style.stroke_color,
                    width: 0.5,
                })
                var fill_style = new ol.style.Fill({
                    color: isSelected ? _this.layer_style.selected_fill_color : _this.layer_legend[feature.get(_this.feature_legend_identifier)]?.color,
                })

                return new ol.style.Style({

                    stroke: stroke_style,

                    fill: fill_style,
                    
                    text: zoom > 17 ? new ol.style.Text({
                        text: String(feature.get(_this.feature_identifier) ?? ''),
                        font: '12px Poppins,sans-serif',
                        fill: new ol.style.Fill({ color: '#000' }),
                        stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
                        overflow: true,
                    }) : null,
                });
                
            }
        },
        loader() {
            var _this = this
            return function(extent, resolution, projection, success, failure) {

                var xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.open('GET', _this.url(extent));

                xhr.onerror = function() {
                    _this.source.removeLoadedExtent(extent);
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

                        var features = _this.format.readFeatures(json);
                        _this.source.addFeatures(features);
                        success(features);
                    } else {
                        _this.source.removeLoadedExtent(extent);
                        failure();
                    }
                }

                xhr.send();
            }
        }
    },
    methods: {
        addClickListener() {
            var _this = this
            
            this.map.on('singleclick', function (evt) {

                if (!_this.layer.getVisible()) {
                    return
                }

                var featureFound = false

                _this.map.forEachFeatureAtPixel(evt.pixel, function (clickedFeature) {
                    featureFound = true

                    var newFeatureWrapper = {
                        layerId:   _this.layer_id,
                        layerName: _this.name_en,
                        projection: MAP_PROJECTION,
                        legendId:  _this.generateLegendKey(clickedFeature),
                        info:      _this.generateInfo(clickedFeature),
                        feature:   clickedFeature,
                    };

                    var alreadySelected = _this.selectedFeatures.some(f =>
                            f.feature.get(_this.feature_identifier) === clickedFeature.get(_this.feature_identifier)
                        );

                    if (evt.originalEvent.shiftKey) { // mouse click + shift key
                        // Multi-selection mode

                        if (alreadySelected) {
                            // clicking in an alreadySelected feature removes its selection
                            _this.selectedFeatures = _this.selectedFeatures.filter(f =>
                                f.feature.get(_this.feature_identifier) !== clickedFeature.get(_this.feature_identifier)
                            )
                        } else {
                            // if not selected, adds feature to selection
                            _this.selectedFeatures.push(newFeatureWrapper);
                        }

                    } else { // only mouse click

                        if (alreadySelected) {

                            if (_this.selectedFeatures.length > 1) {
                                // if various features selected, clear all, keep this
                                _this.selectedFeatures.splice(0)
                                _this.selectedFeatures.push(newFeatureWrapper);

                            } else {
                                // if only this is selected, remove it
                                _this.selectedFeatures.splice(0)
                            }

                        } else {
                            // Single selection mode
                            _this.selectedFeatures.splice(0)
                            _this.selectedFeatures.push(newFeatureWrapper)
                            
                        }
                    }
                    _this.layer.changed()
                    return true;
                },
                {
                    layerFilter: function (layer) {
                        return layer.get('my_layer_id') === _this.layer_id && layer.getVisible()
                    }
                })

                if (!featureFound) {
                    if (!evt.originalEvent.shiftKey) {
                        // clicking in a place where there are no features, clears the selection
                        _this.selectedFeatures.splice(0)
                        _this.layer.changed()
                    }
                }
                
                _this.selectedLegendElements = _this.selectedFeatures.map(function(f) {
                    return f.legendId
                })
            });
        },
        getFeatureProperty(f, prop) {
            return f.get(prop)
        },
        generateLegendKey(f) {
            return f.get(this.feature_legend_identifier).toString()
        }
    }
}
</script>

<template>
    <div class="form-check ml-2">
        <input class="form-check-input" type="checkbox"
            :disabled="disabled"
            @change="setShow($event.target.checked)"
            v-model="show">
        <label class="form-check-label">{{ name_en }}</label>
    </div>
</template>