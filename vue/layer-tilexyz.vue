<script>
module.exports = {
    name: "layer-tilexyz",
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
                
            this.layer = new ol.layer.Tile({
                my_layer_id: this.layerProps.id,
                source: this.layerProps.source,
                opacity: this.layerProps.opacity,
                zIndex: this.layerProps.zIndex
            });
            this.map.addLayer(this.layer);
            this.show = this.layerProps.show

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