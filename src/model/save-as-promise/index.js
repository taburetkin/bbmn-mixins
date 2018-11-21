import _ from 'underscore';
import { betterResult } from 'bbmn-utils';
export default Base => Base.extend({
	defaultWait: false,
	saveReturnPromise: false,
	patchInsteadSave: false,
	save(key, val, options){
		let attrs;
		if (key == null || typeof key === 'object') {
			attrs = key;
			options = val;
		} else {
			(attrs = {})[key] = val;
		}
		options || (options = {});
		if(!_.has(options, 'wait')){
			options.wait = this.defaultWait;
		}
		if(!_.has(options, 'patch')) {
			options.patch = this.patchInsteadSave;
		}

		if(options.addToUrl){
			let url = betterResult(this, 'url', { args: [ options ] });
			if (url) {
				url += '/' + options.addToUrl;
				options.url = url;
			}
		}


		const save = Base.prototype.save.call(this, attrs, options);
		if (!this.saveReturnPromise) {
			return save;
		}

		if (save && _.isFunction(save.then)) {
			return save;
		}
		if (!save) {
			return Promise.reject(save);
		} else {
			return Promise.resolve(save);
		}
	}
});
