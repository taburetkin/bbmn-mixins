import _ from 'underscore';
import { isModelClass, isCollectionClass, getByPath, betterResult } from 'bbmn-utils';

function urlError() {
	throw new Error('A "url" property or function must be specified');
}

function mixinError(){
	throw new Error('This mixin can be applied only on Model or Collection');
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
        betterResult(this, 'urlRoot', { args:[this]}) ||
		betterResult(this.collection, 'url', { args:[this]}) ||
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


export default Base => {

	const mixin = isModelClass(Base) ? ModelMixin(Base)
		: isCollectionClass(Base) ? CollectionMixin(Base)
			: mixinError();

	return mixin;
	
};
