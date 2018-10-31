import { betterResult, isCollection, isModelClass, isCollectionClass } from 'bbmn-utils';
import { Model, Collection } from 'bbmn-core';
import _ from 'underscore';
export default Base => Base.extend({
	
	// usage:
	// model.entity('users');
	entity(key){
		return this._getNestedEntity(key);
	},

	// override this if you need to do something with just created entity
	// by default here is settled change handlers
	setupNestedEntity(key, entity){
		this._setNestedEntityHandlers(key, entity);
	},

	_getNestedEntity(key){
		//get sure there is a nestedEntities store initialized;
		this._initEntitiesStore();
		// compiling passed `nestedEntities` contexts, occurs only at first call
		this._initOwnEntities();
		
		let context = this._nestedEntities[key];
		if (!context) { return; }
		if (!context.entity && !context._compiled) {
			context.entity = this._buildNestedEntity(context);
			if (context.entity) {
				this.setupNestedEntity(context);
			}
		}
		return context.entity;
	},
	_buildNestedEntity(context){
		let data = this.get(context.name);
		if (_.isFunction(context.build)) {
			context.entity = context.build.call(this, data, context, this);
		} else {
			let args = context.args;
			if (!args) {
				args = [data];
				if(context.options) {
					args.push(context.options);
				}
			}
			context.entity = new context.class(...args);
		}
		context._compiled;
		return context.entity;
	},
	_initOwnEntities(){
		if (this._nestedEntitiesInitialized) {
			return;
		}
		let compiled = betterResult(this, 'nestedEntities', { args: [ this ] });
		let memo = this._nestedEntities;
		_.each(compiled, (context, key) => {
			// handle the case where its a runtime function or class definition
			context = betterResult({ context }, 'context', { args: [key] });
			if (isModelClass(context) || isCollectionClass(context) ) {
				context = {
					class: context,
				};
			} 
			// when its just a property name, trying to determine type of data and use default class
			else if (_.isString(context)) {
				context = {
					name: context
				};
			} else if (!_.isObject(context)) {
				context = {};				
			}

			let name = context.name || (_.isString(key) && key || undefined);
			
			if (!_.isString(name)) {
				return;
			}

			if(!context.name) {
				context.name = name;
			}

			if(!context.class) {
				let data = this.get(context.name);
				if (_.isArray(data)) {
					context.class = this.NestedCollectionClass || Collection;
				} else {
					context.class = this.NestedModelClass || Model;
				}				
			}

			memo[name] = context;

		});

		this._nestedEntitiesInitialized = true;
	},
	_initEntitiesStore(){
		if(!_.has(this, '_nestedEntities')){
			this._nestedEntities = {};
		}
	},	
	_setNestedEntityHandlers(context){
		let { name, entity } = context;
		let entityChangeEvents = 'change';

		if (isCollection(entity)) {
			entityChangeEvents += ' update reset';
		}

		// if entity get changed outside we should keep in sync this model property value
		if(!context.onEntityChange){
			context.onEntityChange = (instance, { syncChange } = {}) => {
				!syncChange && this.set(name, entity.toJSON(), { syncChange: true });
			};
		}
		this.listenTo(entity, entityChangeEvents, context.onEntityChange);

		// if this model property get changed outside we should keep in sync our nested entity
		if(!context.onPropertyChange) {
			context.onPropertyChange = (instance, _newvalue, { syncChange }) => {
				if (syncChange) { return; }
				let val = this.get(name);
				let unset = _.reduce(entity.attributes, (memo, _val, key) => {
					if(key in val) return memo;
					memo[key] = undefined;
					return memo;
				}, {});
				entity.set(unset);
				entity.clear({ silent: true });
				entity.set(val, { syncChange: true });

				
			};
		}
		this.on('change:' + name, context.onPropertyChange);
	},

	destroy(){
		this._disposeEntities();
		let superDestroy = Base.prototype.destroy;
		return superDestroy && superDestroy.apply(this, arguments);
	},

	_disposeEntities(){
		_.each(this._nestedEntities, context => this._disposeEntity(context));
		delete this._nestedEntities;
	},
	_disposeEntity({ entity, name, onEntityChange, onPropertyChange } = {}){
		this.stopListening(entity, null, onEntityChange);
		this.off('change:'+ name, onPropertyChange);
	}
});
