httpVueLoader.register(Vue, 'vue/bottom.vue');
httpVueLoader.register(Vue, 'vue/top.vue');
httpVueLoader.register(Vue, 'vue/layer-wfs.vue');
httpVueLoader.register(Vue, 'vue/layer-wms.vue');
httpVueLoader.register(Vue, 'vue/layer-tilexyz.vue');

const TURF_PROJECTION = "EPSG:4326"
const MAP_PROJECTION = 'EPSG:3857'

Object.filter = function(obj, predicate) {
	let result = {}, key;

	for (key in obj) {
			if (obj.hasOwnProperty(key) && predicate(obj[key])) {
					result[key] = obj[key];
			}
	}
	
	return result;
};

const router = new VueRouter({
	mode: 'history',
	base: window.location.pathname.substring(0, window.location.pathname.indexOf("lucim")) + "lucim/",
	routes: [
		{
			path: '/',
			name: 'homepage',
			component: httpVueLoader('vue/contents.vue')
		},
		{
			path: '/target-areas',
			name: 'target-areas',
			component: httpVueLoader('vue/target-areas.vue')
		},
		{
			path: '/resilient-land-uses',
			name: 'resilient-land-uses',
			component: httpVueLoader('vue/resilient-land-uses.vue')
		},
		{
			path: '/lpis-sustainability-compass',
			name: 'lpis-sustainability-compass',
			component: httpVueLoader('vue/lpis-sustainability-compass.vue')
		},
		{
			path: '/tree-deserts',
			name: 'tree-deserts',
			component: httpVueLoader('vue/tree-deserts.vue')
		},
		{
			path: '*',
			name: 'notfound',
			component: httpVueLoader('vue/notfound.vue')
		},
	],
	scrollBehavior (to, from, savedPosition) {
		return { x: 0, y: 0 }
	}
})

Vue.directive('animate-on-update', {
  update(el, binding) {
    el.classList.remove('animate-change');

    // Force reflow
    void el.offsetWidth;

    el.classList.add('animate-change');
  }
});

var VueBus = new Vue();

var app = '';

app = new Vue({
	el: '#app',
	router: router,
	data: {
		loaded: false,
	},
	created() {
		this.loadData()
	},
	methods: {
		loadData() {
			var _this = this
			var requests = []

			for (var i = 0; i < LAYERS_LIST.length; i++) {
				var layer_code = LAYERS_LIST[i]
				MAP_LAYERS[layer_code] = {}
				requests.push($.getJSON('js/layers/' + layer_code + '.json', function(layer) {
					MAP_LAYERS[layer.id] = layer
				}))
			}
			/*for (var i = 0; i < MODULES_LIST.length; i++) {
				var module_code = MODULES_LIST[i]
				MAP_MODULES[module_code] = {}
				requests.push($.getJSON('js/modules/' + module_code + '.json', function(module) {
					MAP_MODULES[module.id] = module
				}))
			}*/		

			Promise.allSettled(requests).then(function() {
				_this.loaded = true
			})
		}
	}
});

function debounce(func, timeout = 1000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function validString(str) {
	if (typeof str == 'String') {
			str = str.trim()
	}
	return str !== null || str !== "null" || str !== "" || str !== undefined
}