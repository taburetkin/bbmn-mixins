import _ from 'underscore';
import { isModelClass, isCollectionClass, getByPath, betterResult } from 'bbmn-utils';

function urlError() {
	throw new Error('A "url" property or function must be specified');
}

function getUrlPattern(){
	let path = betterResult(this, 'urlPattern', { args: [this], default:'' });
	return path.replace(/\{([^}]+)\}/g, (match, group) => {
		let value = getByPath(this, group);
		return value;
	});
}

const ModelMixin = Base => Base.extend({
	getUrlPattern,
	getBaseUrl(){
		let base =
        _.result(this, 'urlRoot') ||
		_.result(this.collection, 'url') ||
		this.getUrlPattern();
		return base;
	},
	url(){
		let base = this.getBaseUrl();
		if (!base) {
			urlError();
		}
		if (this.isNew()) return base;
		var id = this.get(this.idAttribute);
		return base.replace(/[^/]$/, '$&/') + encodeURIComponent(id);  
	}
});


const CollectionMixin = Base => Base.extend({
	url(){
		if (this.urlPattern) {			
			return this.getUrlPattern();
		}
	},
	getUrlPattern
});

function throwError(){
	throw new Error('This mixin can be applied only on Model or Collection');
}

export default Base => {

	const mixin = isModelClass(Base) ? ModelMixin(Base)
		: isCollectionClass(Base) ? CollectionMixin(Base)
			: throwError();

	return mixin;
	
};
