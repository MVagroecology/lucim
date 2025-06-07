<script>
module.exports = {
	name: "top",
	computed: {
		title() {
			return this.$route.meta.title
		}
	}
}
</script>

<template>
	<div class="row header">
		<div class="col-3 col-sm-2">
			<div class="header-logo bg-white">
				<div class="text-center"><router-link to="/"><img src="img/lucim.png" class="logo"></router-link></div>
			</div>
		</div>
		<div class="col-9 col-sm-8 text-left">
			<div class="header-text">
				<div class="row no-gutters">
					<div class="col-12 col-sm-9">
						<router-link to="/" class="title text-white text-left pointer" tag="h3"><strong>Land-Use Change Interactive Mapping</strong></router-link>
					</div>
					<div class="d-none d-sm-block col-sm-3 text-right">
						<div id="google_translate_element"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="d-none d-sm-block col-sm-1">
			<div class="header-logo">
				<div class="text-center"><a href="https://agromixproject.eu" target="_blank"><img src="img/agromix_white.png" class="logo"></a></div>
			</div>
		</div>
		<div class="d-none d-sm-block col-sm-1">
			<div class="header-logo">
				<div class="text-center"><a href="https://digitaf.eu/" target="_blank"><img src="img/digitaf_white.png" class="logo"></a></div>
			</div>
		</div>
	</div>
</template>