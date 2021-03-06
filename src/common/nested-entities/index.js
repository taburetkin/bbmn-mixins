import { betterResult, isCollection, isModel, isModelClass, isCollectionClass, clone } from 'bbmn-utils';
import { Model, Collection } from 'bbmn-core';
import _ from 'underscore';
export default Base => Base.extend({
	
	// usage:
	// model.entity('users');
	entity(key, options){
		return this._getNestedEntity(key, options);
	},

	registerNestedEntity(name, context){
		this._initEntitiesStore();
		if (this._nestedEntitiesInitialized) {
			throw new Error('its too late to register nestedEntities, they already initialized');
		}		
		if(!name) {
			throw new Error('Name must be provided');
		}
		this._runtimeNestedEntities[name] = context;
		//let toAdd;
		// if (_.isFunction(context)) {
		// 	let wrapper = function() {
		// 		let contextInvoked = context.call(this);
		// 		if (!_.isObject(contextInvoked)) {
		// 			throw new Error('Context must be an object with name and class properties');
		// 		}
		// 		contextInvoked.name = name;
		// 		return contextInvoked;
		// 	};
		// 	toAdd = wrapper;
		// } else if(_.isObject(context)) {
		// 	context.name = name;
		// 	toAdd = context;
		// }
		// if (toAdd == null) {
		// 	throw new Error('nestedEntity Context undefined and failed to register');
		// }
		//this._runtimeNestedEntities.push(toAdd);
	},

	// override this if you need to do something with just created entity
	// by default here is settled change handlers
	setupNestedEntity(context){
		if (!context.entity) return;
		this._setNestedEntityHandlers(context);
		this._setNestedEntityParent(context.entity, context.parentKey);
	},

	_getNestedEntity(key, options){
		//get sure there is a nestedEntities store initialized;
		this._initEntitiesStore();
		// compiling passed `nestedEntities` contexts, occurs only at first call
		this._initOwnEntities();
		
		let context = this._nestedEntities[key];
		if (!context) { return; }
		if (!context.entity && !context._compiled) {
			context.entity = this._buildNestedEntity(context, options);
			if (context.entity) {
				this.setupNestedEntity(context);
			}
		}
		return context.entity;
	},
	_buildNestedEntity(context, options){
		let data = this.get(context.name);
		if (_.isFunction(context.build)) {
			context.entity = context.build.call(this, data, context, this);
		} else {
			data = data || context.data;
			let args = context.args;
			if (!args) {
				args = [data];
				if (context.parse) {
					if(!options) options = {};
					if(!('parse' in options)){
						options.parse = context.parse;
					}
				}
				if(options || context.options) {
					args.push(_.extend({}, context.options, options));
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
		let memo = this._nestedEntities;
		let additional = this._runtimeNestedEntities;
		/*
		_.each(additional, context => {
			if (_.isFunction(context)) {
				context = context.call(this);
			}
			if (!context.name) return;
			if (!isModelClass(context.class) && !isCollectionClass(context.class) ) {
				return;
			}
			memo[context.name] = clone(context, { functions: true });
		});
		*/
		let compiled = _.extend({}, additional, betterResult(this, 'nestedEntities', { args: [ this ] }));
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

			memo[name] = clone(context, { functions: true });

		});

		this._nestedEntitiesInitialized = true;
	},
	_initEntitiesStore(){
		if(!_.has(this, '_nestedEntities')){
			this._nestedEntities = {};
			this._runtimeNestedEntities = {};
		}
	},

	_setNestedEntityHandlers(context){
		let { name, entity } = context;
		let entityChangeEvents = 'change';

		if (isCollection(entity)) {
			entityChangeEvents += ' update reset';
		}
		let parentEntity = this;

		// if entity get changed outside we should keep in sync this model property value
		if(!context.onEntityChange){
			context.onEntityChange = (instance, { changeInitiator } = {}) => {
				

				if (changeInitiator == parentEntity) return;

				// if changeInitiator is not set, then entity is source of changes
				changeInitiator == null && (changeInitiator = entity);

				let json = entity.toJSON();				
				if (context.saveOnChange && !this.isNew()) {
					this.save(name, json, { changeInitiator });
				} else {
					this.set(name, json, { changeInitiator });
				}
			};
		}
		this.listenTo(entity, entityChangeEvents, context.onEntityChange);

		// if this model property get changed outside we should keep in sync our nested entity
		if(!context.onPropertyChange) {
			context.onPropertyChange = (instance, _newvalue, { changeInitiator }) => {

				if (changeInitiator == parentEntity) return;

				changeInitiator == null && (changeInitiator = parentEntity);
				
				let defaultValue = isCollectionClass(context.class) ? [] : {};
				let val = this.get(name) || defaultValue;

				//prev:  != entity
				if (isModel(entity) && changeInitiator == parentEntity) {
					let unset = _.reduce(entity.attributes, (memo, _val, key) => {
						if(key in val) return memo;
						memo[key] = undefined;
						return memo;
					}, {});
					entity.set(_.extend({}, val, unset), { changeInitiator });
					entity.set(unset, { unset: true, silent: true });

				} 
				//prev:  != entity
				else if( isCollection(entity) && changeInitiator == parentEntity) {

					entity.set(val, { changeInitiator });

				}
			};
		}
		this.on('change:' + name, context.onPropertyChange);
	},
	_setNestedEntityParent(entity, parentKey){
		parentKey || (parentKey = 'parent');
		entity[parentKey] = this;
	},
	_unsetNestedEntityParent(entity, parentKey){
		parentKey || (parentKey = 'parent');
		delete entity[parentKey];
	},
	destroy(){
		this.dispose({ destroying: true });
		let destroy = Base.prototype.destroy;
		return destroy && destroy.apply(this, arguments);
	},
	dispose(opts){
		this._disposeEntities(opts);
		let dispose = Base.prototype.dispose;		
		return dispose && dispose.apply(this, arguments);
	},
	_disposeEntities(opts){
		_.each(this._nestedEntities, context => this._disposeEntity(context, opts));
		delete this._nestedEntities;
	},
	_disposeEntity({ entity, name, onEntityChange, onPropertyChange, parentKey } = {}, { destroying } = {}){
		this.stopListening(entity, null, onEntityChange);
		this.off('change:'+ name, onPropertyChange);
		this._unsetNestedEntityParent(entity, parentKey);
		let method = destroying ? 'destroy' : 'dispose';
		entity[method] && entity[method]();
	},
});
