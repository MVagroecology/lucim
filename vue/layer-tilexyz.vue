<script>
module.exports = {
    name: "layer-tilexyz",
    mixins: [ layer_mixin ],
    props: [ 'layer_id', 'layer_props' ],
	data() {
        this.$set(this.layer_props, "layer", null)
        this.$set(this.layer_props, "selectedFeatures", [])
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.$set(this.layer_props, "olLayerType", 'Tile')
        this.$set(this.layer_props, "olSourceType", 'XYZ')
        this.$set(this.layer_props, "eventResource", 'tile')
        this.$set(this.layer_props, "isLoading", false)
        this.$set(this.layer_props, "tilesLoading", 0)
        
		return this.layer_props
	},
    mounted() {
        
        this.source.on('tileloadstart', () => {
            if (this.tilesLoading == 0) {
                this.$set(this, 'isLoading', true);
            }
            this.tilesLoading++;
        });
        this.source.on('tileloadend', () => {
            this.tilesLoading--;
            if (this.tilesLoading === 0) {
                this.$set(this, 'isLoading', false);
            }
        });
        this.source.on('tileloaderror', () => {
            this.tilesLoading--;
            if (this.tilesLoading === 0) {
                this.$set(this, 'isLoading', false);
            }
        });

    },
    computed: {
        url() {
            return this.source_url
        }
    },
    methods: {
        addClickListener() {
            // no need for now
            return
        }
    }
}
</script>

<template>
    <div class="form-check">
        <input class="form-check-input" type="checkbox"
            :disabled="disabled"
            @change="setShow($event.target.checked)"
            v-model="show">
        <label class="form-check-label">{{ name_en }}</label>
        <div class="spinner-border" v-if="isLoading" role="status"><span class="sr-only">Loading...</span></div>
    </div>
</template>