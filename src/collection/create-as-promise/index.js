import _ from 'underscore';
export default Base => Base.extend({
	defaultWait: false,
	createReturnPromise: false,
	create(model, options = {}){
		if(!_.has(options, 'wait')){
			options.wait = this.defaultWait;
		}
		const create = Base.prototype.create.call(this, model, options);
		if (!this.createReturnPromise) {
			return create;
		}

		if (create && _.isFunction(create.then)) {
			return create;
		}
		if (!create) {
			return Promise.reject(create);
		} else {
			return Promise.resolve(create);
		}
	}
});
