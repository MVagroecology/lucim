<script>
module.exports = {
    name: "layer-tilexyz",
    mixins: [ layer_mixin ],
    props: [ 'layer_id', 'layer_props' ],
	data() {
        this.$set(this.layer_props, "layer", null)
        this.$set(this.layer_props, "selectedFeatures", [])
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.layer_props.olLayerType = 'Tile'
        this.layer_props.olSourceType = 'XYZ'
        this.layer_props.eventResource = 'tile'
        
		return this.layer_props
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
    <div class="form-check ml-2">
        <input class="form-check-input" type="checkbox"
            :disabled="disabled"
            @change="setShow($event.target.checked)"
            v-model="show">
        <label class="form-check-label">{{ name_en }}</label>
    </div>
</template>