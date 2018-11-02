import _ from 'underscore';
import { betterResult as result, getOption, mergeOptions } from 'bbmn-utils';

// previous version, deprecated
const Mixin = Base => Base.extend({

	//property first approach
	getProperty(key, opts){
		
		let defaultGetArguments = result(this, '_getPropertyArguments', { args:[this], default:[this] });
		let options = _.extend({
			deep: Mixin.defaults.deep,
			force: Mixin.defaults.force,
			args: defaultGetArguments
		}, opts, {
			context: this,
		});
		let { deep } = options;

		let value = result(this, key, options);
		if (value == null && deep !== false) {
			value = result(this.options, key, options);
		}
		return value;
	},

	//options first approach
	getOption(key, opts){
		let defaultGetArguments = result(this, '_getOptionArguments', { args:[this], default:[this] });
		let options = _.extend({
			deep: Mixin.defaults.deep,
			force: Mixin.defaults.force,
			args: defaultGetArguments
		}, opts);

		return getOption(this, key, options);
	},

	mergeOptions(values = {}, keys = [], opts = {}){
		
		if(_.isString(keys))
			keys = keys.split(/\s*,\s*/);

		_.each(keys, (key) => {
			const option = result(values, key, _.extend({ force: false }, opts));
			if (option !== undefined) {
				this[key] = option;
			}
		});

	}

}, {
	GetOptionMixin:true
});

Mixin.defaults = {
	deep: true,
	force: true
};

//export default Mixin;

export default Base => Base.extend({
	getOption(){
		return getOption(this, ...arguments);
	},
	hasOption(key){
		let opts = this.options || {};
		return (opts[key] != null) || (this[key] != null);
	},
	mergeOptions
});
