this.bbmn = this.bbmn || {};
this.bbmn.mixins = (function (exports,_,bbmnCore,bbmnUtils,$,backbone_marionette) {
'use strict';

_ = _ && _.hasOwnProperty('default') ? _['default'] : _;
$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

var index = (function (CollectionView) {
	return CollectionView.extend({
		shouldHandleEmptyFetch: true,
		constructor: function constructor() {
			CollectionView.apply(this, arguments);

			this.getOption('shouldHandleEmptyFetch') && this.emptyView && this._handleEmptyFetch();
		},
		_handleEmptyFetch: function _handleEmptyFetch() {
			var _this = this;

			if (!this.collection || this.collection.length) {
				return;
			}

			this.listenToOnce(this.collection, 'sync', function () {
				return !_this.collection.length && _this._renderChildren();
			});
		}
	});
});

var index$1 = (function (Base) {
	return Base.extend({
		emptyView: function emptyView() {
			return this._emptyViewSelector({
				fetching: this.isFetching(),
				fetched: this.isFetched()
			});
		},
		isFetching: function isFetching() {
			return this.collection && _.isFunction(this.collection.isFetching) && this.collection.isFetching();
		},
		isFetched: function isFetched() {
			return this.collection && _.isFunction(this.collection.isFetched) && this.collection.isFetched();
		},
		_emptyViewSelector: function _emptyViewSelector() {
			var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    fetching = _ref.fetching,
			    fetched = _ref.fetched;

			var wait = this.getOption('waitView');
			var nodata = this.getOption('noDataView');
			if (fetching && !fetched) {
				return wait || nodata;
			} else {
				return nodata;
			}
		}
	});
});

function rebuildIndexes() {
	if (!this.getOption('shouldRebuildIndexes') || !this.collection) {
		return;
	}
	var models = this.collection.models;
	for (var index = 0, length = models.length; index < length; index++) {
		var model = models[index];
		var view = this._children.findByModel(model);
		view && (view._index = index);
	}
}

var index$2 = (function (CollectionView) {
	return CollectionView.extend({
		shouldRebuildIndexes: true,

		constructor: function constructor() {

			CollectionView.apply(this, arguments);
			this.on('before:sort', rebuildIndexes.bind(this));
		},
		_addChild: function _addChild(view, index) {
			view._isModelView = arguments.length === 1;
			if (_.isObject(index)) {
				index = index.index;
			}
			if (index != null) {
				view._index = index;
			}
			return CollectionView.prototype._addChild.apply(this, arguments);
		},
		_viewComparator: function _viewComparator(v1, v2) {
			var res = v1._index - v2._index;
			if (res) return res;
			if (v1._isModelView) return 1;
			return -1;
		}
	});
});

var index$3 = (function (CollectionView) {
	return CollectionView.extend({
		_renderChildren: function _renderChildren() {
			// If there are unrendered views prevent add to end perf
			if (this._hasUnrenderedViews) {
				delete this._addedViews;
				delete this._hasUnrenderedViews;
			}

			var views = this._addedViews || this.children._views;

			this.triggerMethod('before:render:children', this, views);

			this._showEmptyView();

			var els = this._getBuffer(views);

			this._attachChildren(els, views);

			delete this._addedViews;

			this.triggerMethod('render:children', this, views);
		},
		addChildView: function addChildView(view, index) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			if (!view || view._isDestroyed) {
				return view;
			}

			if (_.isObject(index)) {
				options = index;
			}

			// If options has defined index we should use it
			if (options.index != null) {
				index = options.index;
			}

			if (!this._isRendered && !options.preventRender) {
				this.render();
			}

			this._addChild(view, index);

			if (options.preventRender) {
				this._hasUnrenderedViews = true;
				return view;
			}

			var hasIndex = typeof index !== 'undefined';
			var isAddedToEnd = !hasIndex || index >= this._children.length;

			// Only cache views if added to the end and there is no unrendered views
			if (isAddedToEnd && !this._hasUnrenderedViews) {
				this._addedViews = [view];
			}

			if (hasIndex) {
				this._renderChildren();
			} else {
				this.sort();
			}

			return view;
		},
		_showEmptyView: function _showEmptyView() {

			this._destroyEmptyView();

			if (!this.isEmpty()) {
				return;
			}

			var EmptyView = this._getEmptyView();
			if (!EmptyView) {
				return;
			}

			var options = this._getEmptyViewOptions();
			this._emptyViewInstance = new EmptyView(options);

			this.addChildView(this._emptyViewInstance, { preventRender: true, index: 0 });
		},
		_destroyEmptyView: function _destroyEmptyView() {
			var view = this._emptyViewInstance;
			if (!view) return;

			this._removeChildView(view);

			this._removeChild(view);

			view.destroy();
			delete this._emptyViewInstance;
		}
	}, { CollectionViewMixin_4x: true });
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var index$4 = (function (Base) {
	return Base.extend({

		renderAllCustoms: false,
		shouldMergeCustoms: false,
		renderCollection: true,

		constructor: function constructor() {
			Base.apply(this, arguments);
			if (this.getOption('renderCollection') === false && this.collection) {
				this._collection = this.collection;
				delete this.collection;
			}
			this._initializeCustoms();
		},
		_getCustomsArray: function _getCustomsArray() {
			if (!this._customs) this._customs = [];
			return this._customs;
		},
		getCollection: function getCollection() {
			return this.collection || this._collection;
		},
		clearCustoms: function clearCustoms() {
			var arr = this._getCustomsArray();
			arr.length = 0;
		},
		addCustom: function addCustom() {
			var arr = this._getCustomsArray();
			arr.push.apply(arr, arguments);
		},
		unshiftCustom: function unshiftCustom() {
			var arr = this._getCustomsArray();
			arr.unshift.apply(arr, arguments);
		},
		_initializeCustoms: function _initializeCustoms() {

			var optionsCustoms = bbmnUtils.betterResult(this.options, 'customs', { args: [this], context: this });
			var instanceCustoms = bbmnUtils.betterResult(this, 'customs', { args: [this] });
			var shouldMergeCustoms = this.getOption('shouldMergeCustoms');
			var add = void 0;
			if (shouldMergeCustoms) {
				add = (instanceCustoms || []).concat(optionsCustoms || []);
			} else {
				add = instanceCustoms || optionsCustoms || [];
			}

			this.addCustom.apply(this, toConsumableArray(add));

			if (this.getOption('renderAllCustoms')) {
				this.on('render', this._renderCustoms);
			}
		},
		renderCustoms: function renderCustoms() {
			this.triggerMethod('before:customs:render');

			_.each(this._renderedCustoms, function (view) {
				return view.destroy();
			});
			var registered = this._getCustoms();
			var rawcustoms = this.getCustoms(registered);
			var customs = this._prepareCustoms(rawcustoms);

			this._renderedCustoms = this.addChildViews(customs);

			this.triggerMethod('customs:render');
		},
		_renderCustoms: function _renderCustoms() {
			if (!this.getOption('renderAllCustoms')) return;
			this.renderCustoms();
		},
		_getCustoms: function _getCustoms() {
			var arr = this._getCustomsArray();
			return _.clone(arr);
		},
		getCustoms: function getCustoms(customs) {
			return customs;
		},
		_prepareCustoms: function _prepareCustoms(rawcustoms) {
			var _this = this;

			return _.reduce(rawcustoms, function (array, item) {
				var args = _this._prepareCustom(item);
				args && (args = _this.buildCustom.apply(_this, toConsumableArray(args)));
				args && array.push(args);
				return array;
			}, []);
		},
		_prepareCustom: function _prepareCustom(arg) {
			if (_.isArray(arg)) {
				return arg;
			}
			if (bbmnCore.isView(arg) || bbmnCore.isViewClass(arg)) {
				return [arg, { index: 0 }];
			}
			if (_.isFunction(arg)) {
				return this._prepareCustom(arg.call(this, this));
			}
			return [arg, { index: 0 }];
			// if (_.isArray(arg)) {
			// 	return arg;
			// } else {
			// 	return [arg, { index: 0 }];
			// }
		},
		buildCustom: function buildCustom(view) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			var childOptions = this.getOption('customViewOptions', { args: [this] });
			if (bbmnCore.isViewClass(view)) {
				view = new view(childOptions);
			} else if (_.isFunction(view)) {
				view = view.call(this, this, childOptions);
			} else if (!bbmnCore.isView(view) && _.isObject(view) && 'view' in view) {
				if (bbmnCore.isView(view.view)) {
					if (_.isObject(view.options)) options = view.options;
					view = view.view;
				} else if (bbmnCore.isViewClass(view.view)) {
					var _options = bbmnUtils.betterResult(view, 'options', { context: this, args: [this, childOptions] });
					var viewOptions = _.extend({}, childOptions, _options);
					view = new view.view(viewOptions);
				}
			}
			if (bbmnCore.isView(view)) {
				this._setupCustom(view);
				return [view, options];
			}
		},
		_setupCustom: function _setupCustom(view) {
			return this.setupCustom(view);
		},

		setupCustom: function setupCustom(view) {
			return view;
		},
		addChildViews: function addChildViews() {
			var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			if (!children.length) {
				return;
			}

			var awaitingRender = false;
			var rendered = [];
			while (children.length) {

				var args = children.pop();
				if (!args) {
					continue;
				}

				if (!_.isArray(args)) {
					args = [args, { index: 0 }];
				}

				var _args = args,
				    _args2 = slicedToArray(_args, 3),
				    view = _args2[0],
				    index = _args2[1],
				    _args2$ = _args2[2],
				    options = _args2$ === undefined ? {} : _args2$;

				if (_.isObject(index)) {
					options = index;
					index = undefined;
				}
				if (index != null && !('index' in options)) {
					options.index = index;
				}
				options.preventRender = !!children.length;
				if (!bbmnCore.isView(view)) {
					continue;
				}

				this.addChildView(view, options);
				rendered.push(view);
				awaitingRender = options.preventRender;
			}
			if (awaitingRender) {
				this.sort();
			}
			return rendered;
		}
	}, { CustomsMixin: true });
});

var index$5 = (function (Base) {
	return Base.extend({
		fetchNextEdge: 'bottom',
		constructor: function constructor() {
			var _this2 = this;

			Base.apply(this, arguments);
			var scrollEdge = this.getOption('fetchNextEdge');
			if (scrollEdge) {
				var event = scrollEdge + ':edge';
				this.addScrollEvents(defineProperty({}, event, function () {
					var _this = this;

					this.fetchNext({ onlyIfNotFetching: true }).then(function () {
						_this.clearScrollEdges();
					});
				}));
				var collection = this.getCollection();
				if (collection) {
					this.listenTo(collection, 'query:change', function () {
						_this2.scrollToStart();
						_this2.clearScrollEdges();
					});
				}
			}
		},
		fetchNext: function fetchNext() {
			var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    onlyIfNotFetching = _ref.onlyIfNotFetching;

			var collection = this.getCollection();
			if (!collection) return Promise.resolve();
			if (onlyIfNotFetching && collection.isFetching()) return Promise.resolve(collection);
			return collection.fetchNext ? collection.fetchNext() : collection.fetch();
		}
	});
});

var index$6 = (function (Base) {
	return Base.extend({
		constructor: function constructor() {

			this.on({
				request: function request() {
					this._isFetching = true;
				},
				sync: function sync() {
					this._isFetching = false;
					this._isFetched = true;
				}
			});

			Base.apply(this, arguments);
		},
		isFetching: function isFetching() {
			return this._isFetching === true;
		},
		isFetched: function isFetched() {
			return this._isFetched === true;
		},

		concurrentFetch: 'first',
		fetch: function fetch() {
			var _this = this;

			var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    concurrent = _ref.concurrent;

			if (concurrent == null) {
				concurrent = this.concurrentFetch;
			}

			if (concurrent === 'first') {
				if (this._fetchingPromise) {
					return this._fetchingPromise;
				} else {
					var promise = this._fetchingPromise = Base.prototype.fetch.apply(this, arguments);
					promise.then(function () {
						delete _this._fetchingPromise;
					}, function () {
						delete _this._fetchingPromise;
					});
					return promise;
				}
			} else {
				var _promise = this._fetchingPromise = Base.prototype.fetch.apply(this, arguments);
				return _promise;
			}
		},
		fetchIfNot: function fetchIfNot(opts) {
			if (this.isFetched()) {
				return Promise.resolve();
			} else {
				return this.fetch(_.extend({ concurrent: 'first', opts: opts }));
			}
		}
	});
});

var index$7 = (function (Base) {
	return Base.extend({
		constructor: function constructor(opts) {

			Base.apply(this, arguments);
			this._initializeChildrenable(opts);
		},
		_initializeChildrenable: function _initializeChildrenable(opts) {
			bbmnUtils.mergeOptions.call(this, opts, ['parent', 'root']);
			if (this.parent == null && this.root == null) this.root = this;
		},


		//call this method manualy for initialize children
		initializeChildren: function initializeChildren() {
			var _this = this;

			if (this._childrenInitialized) return;

			var children = bbmnUtils.getOption(this, 'children');
			this._children = [];
			_(children).each(function (child) {
				return _this._initializeChild(child);
			});

			this._childrenInitialized = true;
		},
		_initializeChild: function _initializeChild(arg) {
			var Child = void 0;
			var options = {};

			if (bbmnUtils.isKnownCtor(arg)) Child = arg;else if (_.isFunction(arg)) {

				var invoked = arg.call(this, this);
				return this._initializeChild(invoked);
			} else if (_.isObject(arg)) {
				Child = arg.Child;
				_.extend(options, _.omit(arg, 'Child'));
			}

			_.extend(options, bbmnUtils.getOption(this, 'childOptions'), { parent: this });
			options = this.buildChildOptions(options);

			var child = this.buildChild(Child, options);
			this._children.push(child);
		},
		buildChildOptions: function buildChildOptions(options) {
			return options;
		},
		buildChild: function buildChild(Child, options) {
			!Child && (Child = bbmnUtils.getOption(this, 'defaultChildClass') || this.prototype.constructor);
			return new Child(options);
		},
		_getChildren: function _getChildren(items) {
			var _this2 = this;

			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var exclude = opts.exclude,
			    filter = opts.filter,
			    map = opts.map;


			if (exclude != null && !_.isArray(exclude)) opts.exclude = [exclude];

			if (!_.isFunction(filter)) delete opts.filter;

			var result = [];
			var force = opts.force;
			_(items).each(function (item, index) {

				if (!force && !_this2._childFilter(item, index, opts)) return;

				if (_.isFunction(map)) item = map(item);

				item && result.push(item);
			});
			return result;
		},
		_childFilter: function _childFilter(item, index) {
			var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


			if (opts.force) return item;

			var exclude = opts.exclude,
			    filter = opts.filter;


			if (_.isFunction(this.childFilter) && !this.childFilter(item, index, opts)) return;

			if (_.isArray(exclude) && exclude.indexOf(item) >= 0) return;

			if (_.isFunction(filter) && !filter.call(this, item, index, opts)) return;

			return item;
		},

		childFilter: false,
		getChildren: function getChildren() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var children = [].slice.call(this._children || []);
			opts.reverse && children.length > 1 && children.reverse();
			return this._getChildren(children, opts);
		},
		getAllChildren: function getAllChildren() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var includeSelf = opts.includeSelf,
			    map = opts.map,
			    reverse = opts.reverse;

			var options = _.omit(opts, 'includeSelf', 'map');

			var children = this.getChildren(options);
			var result = _(children).chain().map(function (child) {
				var children = child.getAllChildren(options);
				return reverse ? [children, child] : [child, children];
			}).flatten().value();

			if (includeSelf) {
				var method = reverse ? 'push' : 'unshift';
				result[method](this);
			}

			if (_.isFunction(map)) {
				return _(result).chain().map(map).filter(function (f) {
					return !!f;
				}).value();
			} else {
				return result;
			}
		},
		getParent: function getParent() {
			return this.parent;
		}
	}, { ChildrenableMixin: true });
});

var index$8 = (function (Base) {
	return Base.extend({

		// usage:
		// model.entity('users');
		entity: function entity(key, options) {
			return this._getNestedEntity(key, options);
		},
		registerNestedEntity: function registerNestedEntity(name, context) {
			this._initEntitiesStore();
			if (this._nestedEntitiesInitialized) {
				throw new Error('its too late to register nestedEntities, they already initialized');
			}
			if (!name) {
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
		setupNestedEntity: function setupNestedEntity(context) {
			if (!context.entity) return;
			this._setNestedEntityHandlers(context);
			this._setNestedEntityParent(context.entity, context.parentKey);
		},
		_getNestedEntity: function _getNestedEntity(key, options) {
			//get sure there is a nestedEntities store initialized;
			this._initEntitiesStore();
			// compiling passed `nestedEntities` contexts, occurs only at first call
			this._initOwnEntities();

			var context = this._nestedEntities[key];
			if (!context) {
				return;
			}
			if (!context.entity && !context._compiled) {
				context.entity = this._buildNestedEntity(context, options);
				if (context.entity) {
					this.setupNestedEntity(context);
				}
			}
			return context.entity;
		},
		_buildNestedEntity: function _buildNestedEntity(context, options) {
			var data = this.get(context.name);
			if (_.isFunction(context.build)) {
				context.entity = context.build.call(this, data, context, this);
			} else {
				data = data || context.data;
				var args = context.args;
				if (!args) {
					args = [data];
					if (context.parse) {
						if (!options) options = {};
						if (!('parse' in options)) {
							options.parse = context.parse;
						}
					}
					if (options || context.options) {
						args.push(_.extend({}, context.options, options));
					}
				}
				context.entity = new (Function.prototype.bind.apply(context.class, [null].concat(toConsumableArray(args))))();
			}
			context._compiled;
			return context.entity;
		},
		_initOwnEntities: function _initOwnEntities() {
			var _this = this;

			if (this._nestedEntitiesInitialized) {
				return;
			}
			var memo = this._nestedEntities;
			var additional = this._runtimeNestedEntities;
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
			var compiled = _.extend({}, additional, bbmnUtils.betterResult(this, 'nestedEntities', { args: [this] }));
			_.each(compiled, function (context, key) {
				// handle the case where its a runtime function or class definition
				context = bbmnUtils.betterResult({ context: context }, 'context', { args: [key] });
				if (bbmnUtils.isModelClass(context) || bbmnUtils.isCollectionClass(context)) {
					context = {
						class: context
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

				var name = context.name || _.isString(key) && key || undefined;

				if (!_.isString(name)) {
					return;
				}

				if (!context.name) {
					context.name = name;
				}

				if (!context.class) {
					var data = _this.get(context.name);
					if (_.isArray(data)) {
						context.class = _this.NestedCollectionClass || bbmnCore.Collection;
					} else {
						context.class = _this.NestedModelClass || bbmnCore.Model;
					}
				}

				memo[name] = bbmnUtils.clone(context, { functions: true });
			});

			this._nestedEntitiesInitialized = true;
		},
		_initEntitiesStore: function _initEntitiesStore() {
			if (!_.has(this, '_nestedEntities')) {
				this._nestedEntities = {};
				this._runtimeNestedEntities = {};
			}
		},
		_setNestedEntityHandlers: function _setNestedEntityHandlers(context) {
			var _this2 = this;

			var name = context.name,
			    entity = context.entity;

			var entityChangeEvents = 'change';

			if (bbmnUtils.isCollection(entity)) {
				entityChangeEvents += ' update reset';
			}
			var parentEntity = this;

			// if entity get changed outside we should keep in sync this model property value
			if (!context.onEntityChange) {
				context.onEntityChange = function (instance) {
					var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
					    changeInitiator = _ref.changeInitiator;

					if (changeInitiator == parentEntity) return;

					// if changeInitiator is not set, then entity is source of changes
					changeInitiator == null && (changeInitiator = entity);

					var json = entity.toJSON();
					if (context.saveOnChange && !_this2.isNew()) {
						_this2.save(name, json, { changeInitiator: changeInitiator });
					} else {
						_this2.set(name, json, { changeInitiator: changeInitiator });
					}
				};
			}
			this.listenTo(entity, entityChangeEvents, context.onEntityChange);

			// if this model property get changed outside we should keep in sync our nested entity
			if (!context.onPropertyChange) {
				context.onPropertyChange = function (instance, _newvalue, _ref2) {
					var changeInitiator = _ref2.changeInitiator;


					if (changeInitiator == parentEntity) return;

					changeInitiator == null && (changeInitiator = parentEntity);

					var defaultValue = bbmnUtils.isCollectionClass(context.class) ? [] : {};
					var val = _this2.get(name) || defaultValue;

					//prev:  != entity
					if (bbmnUtils.isModel(entity) && changeInitiator == parentEntity) {
						var unset = _.reduce(entity.attributes, function (memo, _val, key) {
							if (key in val) return memo;
							memo[key] = undefined;
							return memo;
						}, {});
						entity.set(_.extend({}, val, unset), { changeInitiator: changeInitiator });
						entity.set(unset, { unset: true, silent: true });
					}
					//prev:  != entity
					else if (bbmnUtils.isCollection(entity) && changeInitiator == parentEntity) {

							entity.set(val, { changeInitiator: changeInitiator });
						}
				};
			}
			this.on('change:' + name, context.onPropertyChange);
		},
		_setNestedEntityParent: function _setNestedEntityParent(entity, parentKey) {
			parentKey || (parentKey = 'parent');
			entity[parentKey] = this;
		},
		_unsetNestedEntityParent: function _unsetNestedEntityParent(entity, parentKey) {
			parentKey || (parentKey = 'parent');
			delete entity[parentKey];
		},
		destroy: function destroy() {
			this.dispose({ destroying: true });
			var destroy = Base.prototype.destroy;
			return destroy && destroy.apply(this, arguments);
		},
		dispose: function dispose(opts) {
			this._disposeEntities(opts);
			var dispose = Base.prototype.dispose;
			return dispose && dispose.apply(this, arguments);
		},
		_disposeEntities: function _disposeEntities(opts) {
			var _this3 = this;

			_.each(this._nestedEntities, function (context) {
				return _this3._disposeEntity(context, opts);
			});
			delete this._nestedEntities;
		},
		_disposeEntity: function _disposeEntity() {
			var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    entity = _ref3.entity,
			    name = _ref3.name,
			    onEntityChange = _ref3.onEntityChange,
			    onPropertyChange = _ref3.onPropertyChange,
			    parentKey = _ref3.parentKey;

			var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
			    destroying = _ref4.destroying;

			this.stopListening(entity, null, onEntityChange);
			this.off('change:' + name, onPropertyChange);
			this._unsetNestedEntityParent(entity, parentKey);
			var method = destroying ? 'destroy' : 'dispose';
			entity[method] && entity[method]();
		}
	});
});

//export default Mixin;

var index$9 = (function (Base) {
	return Base.extend({
		getOption: function getOption$$1() {
			return bbmnUtils.getOption.apply(undefined, [this].concat(Array.prototype.slice.call(arguments)));
		},
		hasOption: function hasOption(key) {
			var opts = this.options || {};
			return opts[key] != null || this[key] != null;
		},

		mergeOptions: bbmnUtils.mergeOptions
	});
});

function urlError() {
	throw new Error('A "url" property or function must be specified');
}

function mixinError() {
	throw new Error('This mixin can be applied only on Model or Collection');
}

function getUrlPattern(options) {
	var _this = this;

	var path = bbmnUtils.betterResult(this, 'urlPattern', { args: [this], default: '' });
	return path.replace(/\{([^}]+)\}/g, function (match, group) {
		var value = bbmnUtils.getByPath(_this, group, options);
		return value;
	});
}

var ModelMixin = function ModelMixin(Base) {
	return Base.extend({
		getUrlPattern: getUrlPattern,
		getBaseUrl: function getBaseUrl() {
			var base = bbmnUtils.betterResult(this, 'urlRoot', { args: [this] }) || bbmnUtils.betterResult(this.collection, 'url', { args: [this] }) || this.getUrlPattern({ includeModelProperty: true });
			return base;
		},
		url: function url() {
			var base = this.getBaseUrl();
			if (!base) {
				urlError();
			}
			if (this.isNew()) return base;
			var id = this.get(this.idAttribute);
			return base.replace(/[^/]$/, '$&/') + encodeURIComponent(id);
		}
	});
};

var CollectionMixin = function CollectionMixin(Base) {
	return Base.extend({
		url: function url() {
			if (this.urlPattern) {
				return this.getUrlPattern();
			}
		},

		getUrlPattern: getUrlPattern
	});
};

var index$10 = (function (Base) {

	var mixin = bbmnUtils.isModelClass(Base) ? ModelMixin(Base) : bbmnUtils.isCollectionClass(Base) ? CollectionMixin(Base) : mixinError();

	return mixin;
});

var index$11 = (function (Base) {
	return Base.extend({
		/*
  
  renderOnModelChange: false,
  refreshOnModelChange: false,
  triggerRefreshOnModelChange: false,
  invokeOnModelChange: true,	
  
  */

		constructor: function constructor() {
			Base.apply(this, arguments);
			this._initRenderOnModelChange();
		},
		_initRenderOnModelChange: function _initRenderOnModelChange() {
			var _this = this;

			if (!this.model) return;

			var shouldRender = this.getOption('renderOnModelChange', { args: [this] });
			var shouldRefresh = this.getOption('refreshOnModelChange', { args: [this] });
			var shouldTriggerRefresh = this.getOption('triggerRefreshOnModelChange', { args: [this] });
			var shouldInvoke = this.getOption('invokeOnModelChange', { args: [this] });

			this.listenTo(this.model, 'before:destroy', function () {
				return _this.stopListening(_this.model);
			});
			this.listenTo(this.model, 'change', function () {

				if (shouldRefresh && _.isFunction(_this.refresh)) {
					_this.refresh();
				}

				if (shouldTriggerRefresh) {
					_this.trigger('refresh');
				}

				if (shouldInvoke && _.isFunction(_this.onModelChange)) {
					_this.onModelChange();
				}

				if (shouldRender) {
					_this.render();
				}
			});
		}
	});
});

//import getOptionMixin from './get-option/index.js';

function getNestedResult(value, context, schema) {
	return value != null && _.isFunction(schema.nested) && schema.nested(value, context);
}

function getPropertySchema(model, key) {
	if (_.isFunction(model.getPropertySchema)) {
		return model.getPropertySchema(key);
	} else {
		return {};
	}
}

function getDisplayConfig(key, model, schema) {
	if (key == null) return {};
	return _.isFunction(model.getPropertyDisplayConfig) && model.getPropertyDisplayConfig(key) || schema && schema.display || {};
}

var index$12 = (function (Base) {
	var originalGet = bbmnCore.Model.prototype.get;
	var Mixed = Base.extend({
		getByPath: function getByPath$$1(key) {
			if (key.indexOf('.') > -1) return bbmnUtils.getByPath(this, key);else return originalGet.call(this, key);
		},
		get: function get(key) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			if (key == null || key == '') return;

			var value = void 0;
			if ('value' in opts) {
				value = opts.value;
			} else {
				value = opts.byPath !== false ? this.getByPath.call(this, key) : originalGet.call(this, key);
			}

			if (!_.size(opts)) {
				return value;
			}

			var prop = getPropertySchema(this, key);
			var result = opts.nested && getNestedResult(value, this, prop);
			if (result != null) {
				return result;
			}

			if (_.isFunction(opts.transform) && !opts.raw) {
				value = opts.transform.call(this, value, opts, this);
			}

			if (_.isFunction(prop.transform) && !opts.raw) {
				value = prop.transform.call(this, value, opts, this);
			}

			if (opts.display === true) {

				var display = getDisplayConfig(key, this, prop);

				if (opts.alternative) {
					value = _.isFunction(display.alternative) && display.alternative.call(this, value, _.extend({}, opts, prop), this);
				} else if (_.isFunction(display.transform)) {
					value = display.transform.call(this, value, opts, this);
				}
				if (display.ifEmpty && (value == null || value === '')) return display.ifEmpty;
			}

			return value;
		},
		display: function display(key) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			_.extend(opts, { display: true });
			return this.get(key, opts);
		},
		propertyName: function propertyName(key) {
			var prop = getPropertySchema(this, key);
			var display = getDisplayConfig(key, this, prop);
			return display.label || key;
		}
	});

	return Mixed;
});

var index$13 = (function (Base) {
	return Base.extend({
		defaultWait: false,
		saveReturnPromise: false,
		patchInsteadSave: false,
		save: function save(key, val, options) {
			var attrs = void 0;
			if (key == null || (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}
			options || (options = {});
			if (!_.has(options, 'wait')) {
				options.wait = this.defaultWait;
			}
			if (!_.has(options, 'patch')) {
				options.patch = this.patchInsteadSave;
			}

			if (options.addToUrl) {
				var url = bbmnUtils.betterResult(this, 'url', { args: [options] });
				if (url) {
					url += '/' + options.addToUrl;
					options.url = url;
				}
			}

			var save = Base.prototype.save.call(this, attrs, options);
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
});

var index$14 = (function (Base) {
	return Base.extend({
		buildViewByKey: function buildViewByKey$$1() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return bbmnUtils.buildViewByKey.call.apply(bbmnUtils.buildViewByKey, [this].concat(toConsumableArray(args)));
		}
	});
});

var defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true
};

var index$15 = (function (Base) {
	return Base.extend({
		constructor: function constructor() {
			Base.apply(this, arguments);
			this._setupCssClassModifiers();
		},
		_initCssClassModifiers: function _initCssClassModifiers() {
			if (this.hasOwnProperty('cssClassModifiers')) {
				return;
			}
			var modifiers = [];
			var optsModifiers = bbmnUtils.betterResult(this.options || {}, 'cssClassModifiers', { args: [this.model, this], default: [] });
			var propsModifiers = bbmnUtils.betterResult(this, 'cssClassModifiers', { args: [this.model, this], default: [] });
			modifiers.push.apply(modifiers, toConsumableArray(optsModifiers));
			modifiers.push.apply(modifiers, toConsumableArray(propsModifiers));
			this.cssClassModifiers = modifiers;
		},
		addCssClassModifier: function addCssClassModifier() {
			var _cssClassModifiers;

			this._initCssClassModifiers();
			(_cssClassModifiers = this.cssClassModifiers).push.apply(_cssClassModifiers, arguments);
		},
		refreshCssClass: function refreshCssClass() {
			var className = this._getCssClassString();
			if (className == '') {
				this.$el.removeAttr('class');
			} else {
				this.$el.attr({
					class: className
				});
			}
		},
		_getCssClassModifiers: function _getCssClassModifiers() {
			this._initCssClassModifiers();
			var className = bbmnUtils.betterResult(this, 'className', { args: [this.model, this], default: [] });
			var modifiers = this.cssClassModifiers.concat([className]);
			return modifiers;
		},

		//override this if you need other logic
		getCssClassModifiers: function getCssClassModifiers() {
			return this._getCssClassModifiers();
		},
		_getCssClassString: function _getCssClassString() {
			var _this = this;

			var modifiers = this.getCssClassModifiers();

			var classes = _(modifiers).reduce(function (hash, modifier) {
				if (modifier == null || modifier === '') {
					return hash;
				}
				var cls = void 0;
				if (_.isString(modifier)) {
					cls = modifier;
				} else if (_.isFunction(modifier)) {
					var builded = modifier.call(_this, _this.model, _this);
					cls = _.isString(builded) && builded || undefined;
				}
				cls && (hash[cls] = true);
				return hash;
			}, {});

			return _.keys(classes).join(' ');
		},
		_setupCssClassModifiers: function _setupCssClassModifiers() {
			var _this2 = this;

			if (this._cssClassModifiersInitialized) return;

			var cfg = this.getCssClassConfig();
			if (!cfg) return;

			var events = this.getCssClassEvents(cfg);
			_(events).each(function (eventName) {
				return _this2.on(eventName, _this2.refreshCssClass);
			});

			if (cfg.modelChange && this.model) {
				this.listenTo(this.model, 'change', this.refreshCssClass);
			}

			this._cssClassModifiersInitialized = true;
		},
		_getCssClassConfig: function _getCssClassConfig() {
			var cfg = _.extend({}, defaultCssConfig, this.getOption('cssClassConfig'));
			if (!cfg || _.size(cfg) == 0) return;
			return cfg;
		},

		//override this if you need other logic
		getCssClassConfig: function getCssClassConfig() {
			return this._getCssClassConfig();
		},
		_getCssClassEvents: function _getCssClassEvents(cfg) {
			var events = [].concat(cfg.events || []);
			if (cfg.refresh) events.push('refresh');
			if (cfg.beforeRender) events.push('before:render');
			events = _(events).uniq();
			return events;
		},

		//override this if you need other logic
		getCssClassEvents: function getCssClassEvents(cfg) {
			return this._getCssClassEvents(cfg);
		}
	}, { CssClassModifiersMixin: true });
});

var index$16 = (function (Base) {
	return Base.extend({
		destroy: function destroy() {
			if (this._isDestroyed || this._isDestroying) {
				return;
			}
			this._isDestroying = true;
			Base.prototype.destroy.apply(this, arguments);
			delete this._isDestroying;
		},
		isDestroyed: function isDestroyed() {
			return this._isDestroyed || this._isDestroying;
		}
	}, { DestroyMixin: true });
});

var defaultSelector = function defaultSelector(name) {
	var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	return prefix + 'region-' + name;
};

function defaultUpdateDom(name, $el) {
	var selector = defaultSelector(name);
	var element = $('<div>').addClass(selector);
	$el.append(element);

	return '.' + selector;
}

function buildRegionFunc(view, hash, context) {
	var $el = view.$el;
	var autoCreateRegion = context.autoCreateRegion;
	var updateDom = hash.updateDom,
	    name = hash.name,
	    el = hash.el;

	var regionEl = void 0;

	var region = view.getRegion(name);

	if (el == null && autoCreateRegion !== false) {

		var testEl = region && region.getOption('el', { deep: false });

		if (!region || !testEl || !$el.find(testEl).length) {

			regionEl = defaultUpdateDom(name, $el);
		}
	} else if (_.isFunction(updateDom)) {
		updateDom.call(view, $el, view);
	}

	if (!region) {
		var definition = _.pick(hash, 'replaceElement', 'regionClass');
		definition.el = hash.el || regionEl;
		region = view.addRegion(name, definition);
	}

	return region;
}

function normalizeNestedViewContextRegion(context) {
	var region = context.region;

	var regionName = _.isString(region) && region || context.regionName || context.name;

	if (_.isString(region) || region == null) {
		region = {};
	} else if (_.isFunction(region)) {
		region = region.call(this, context, this);
	}

	if (_.isObject(region)) {

		if (!region.name) region.name = regionName;
		var replaceElement = this.getOption('replaceNestedElement');
		context.region = _.extend({ replaceElement: replaceElement }, region);
		context.show = _.partial(buildRegionFunc, this, context.region, context);
	}
	return context;
}

var index$17 = (function (Base) {
	return Base.extend({
		constructor: function constructor() {
			this._nestedViews = {};
			Base.apply(this, arguments);
			this.initializeNestedViews();
		},

		template: false,

		showAllNestedViewsOnRender: false,
		showNestedViewOnAdd: false,
		replaceNestedElement: true,

		initializeNestedViews: function initializeNestedViews() {
			var _this = this;

			if (this._nestedViewsInitialized) return;

			if (this.getOption('showAllNestedViewsOnRender')) {
				this.on('render', function () {
					return _this.showAllNestedViews();
				});
			}

			var nesteds = this.getOption('nestedViews', { args: [this.model, this] });
			_(nesteds).each(function (context, index) {

				var name = _.isString(index) ? index : context.name || _.uniqueId('nested');
				_this.addNestedView(name, context);
			});

			this._nestedViewsInitialized = true;
		},
		_normalizeNestedContext: function _normalizeNestedContext(name, context) {

			if (bbmnCore.isViewClass(context)) {
				var View = context;
				context = {
					name: name, View: View
				};
			}

			//unwrap to plain object
			if (_.isFunction(context)) {
				context = context.call(this, this.model, this);
			}

			//fix name if its not provided
			if (context.name == null) {
				context.name = name || _.uniqueId('nested');
			}

			//convert region to valid function
			context = normalizeNestedViewContextRegion.call(this, context);

			return context;
		},
		_createNestedContext: function _createNestedContext(context) {
			var contexts = this.getNestedViewContext();
			contexts[context.name] = context;
		},
		addNestedView: function addNestedView(name, context) {

			if (!_.isString(name) || name === '') {
				throw new Error('addNestedView: first argument should be a string');
			}

			context = this._normalizeNestedContext(name, context);
			this._createNestedContext(context);
			if (this.getOption('showNestedViewOnAdd') && this.isRendered()) {
				this.showNestedView(context);
			}
		},
		showNestedView: function showNestedView(name) {
			var region = this.getNestedViewRegion(name);
			var view = region && this.buildNestedView(name);
			if (view) {
				region.show(view);
			}
		},
		showAllNestedViews: function showAllNestedViews() {
			var _this2 = this;

			var contexts = this.getNestedViewContext();
			_(contexts).each(function (context) {
				return _this2.showNestedView(context);
			});
		},
		getNestedViewContext: function getNestedViewContext(name) {
			var contexts = this._nestedViews;
			if (arguments.length == 0) return contexts;else return contexts[name];
		},
		buildNestedView: function buildNestedView(name) {

			var context = _.isObject(name) ? name : _.isString(name) ? this.getNestedViewContext(name) : null;

			if (!context) return;
			var passedView = bbmnUtils.betterResult(context, 'view', { context: this, args: [this, this.model] });
			if (_.isFunction(context.template)) return context.template;else if (bbmnCore.isView(passedView)) {
				return passedView;
			} else {
				var View = context.View;
				var options = this.buildNestedViewOptions(bbmnUtils.betterResult(context, 'options', { context: this, args: [this, this.model], default: {} }));

				return new View(options);
			}
		},
		buildNestedViewOptions: function buildNestedViewOptions(opts) {
			return opts;
		},
		getNestedViewRegion: function getNestedViewRegion(name) {
			var context = _.isObject(name) ? name : _.isString(name) ? this.getNestedViewContext(name) : null;
			return context && _.result(context, 'show');
		}
	});
});

var index$18 = (function (Base) {
	return Base.extend({
		triggerScrollEvents: false,
		scrollHandlingEnabled: true,
		constructor: function constructor() {
			Base.apply(this, arguments);
			this._initializeScrollHandler();
			this.addCssClassModifier('scrollable');
		},
		_initializeScrollHandler: function _initializeScrollHandler() {
			var _this = this;

			if (!this.getOption('scrollHandlingEnabled')) {
				return;
			}
			var scrollDelegate = {
				'scroll': this._scrollHandler.bind(this)
			};
			this.on({
				'attach': function attach() {
					return _this.delegateEvents(scrollDelegate);
				},
				'detach': function detach() {
					return _this.undelegateEvents(scrollDelegate);
				}
			});
			var events = this.getOption('scrollEvents', { args: [this] });
			this.addScrollEvents(events);
		},
		scrollToStart: function scrollToStart() {
			var el = this.getScrollElement();
			el.scrollTop = 0;
			el.scrollLeft = 0;
		},
		addScrollEvents: function addScrollEvents(events) {
			var hash = backbone_marionette.normalizeMethods(this, events);
			this._scrollEvents = _.extend({}, this._scrollEvents, hash);
		},
		_scrollHandler: function _scrollHandler() {
			var info = this.getElementInfo();
			this.tryRegisterEdgeHit(info, 'bottom');
			this.tryRegisterEdgeHit(info, 'right');
		},
		tryRegisterEdgeHit: function tryRegisterEdgeHit(info, edge) {
			var scroll = info[bbmnUtils.camelCase('scroll', edge)];
			var end = info[bbmnUtils.camelCase('scroll', edge, 'end')];
			if (scroll >= end && !this.isEdgeHited(edge)) {
				this._triggerEdge(edge);
			}
		},

		edgeHitKey: '_scrollHandler.edge',
		isEdgeHited: function isEdgeHited(edge) {
			var key = this.edgeHitKey + '.' + edge;
			return this[key] === true;
		},
		setEdgeHit: function setEdgeHit(edge) {
			var arg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			var key = this.edgeHitKey + '.' + edge;
			return this[key] = arg;
		},
		getScrollElement: function getScrollElement() {
			if (!this._scrollElement) {
				var el = this.getOption('scrollElement', { args: [this] });
				if (el instanceof Element) {
					this._scrollElement;
				} else if (el == null) {
					this._scrollElement = this.el;
				} else if (el.jquery) {
					this._scrollElement = el[0];
				}
			}
			return this._scrollElement;
		},
		getElementInfo: function getElementInfo() {
			var el = this.getScrollElement();
			var $el = $(el);
			var width = $el.outerWidth();
			var height = $el.outerHeight();
			var scrollBottomEnd = el.scrollHeight - Math.floor(height / 2);
			var scrollRightEnd = el.scrollWidth - Math.floor(width / 2);
			return {
				width: width, height: height,
				scrollBottomEnd: scrollBottomEnd, scrollRightEnd: scrollRightEnd,
				scrollBottom: el.scrollTop + height,
				scrollRight: el.scrollLeft + width
			};
		},
		clearScrollEdges: function clearScrollEdges() {
			this.setEdgeHit('bottom', false);
			this.setEdgeHit('right', false);
		},
		_triggerEdge: function _triggerEdge(edge) {
			this.setEdgeHit(edge);
			if (this._scrollEvents) {
				var handler = this._scrollEvents[edge + ':edge'];
				handler && handler.call(this);
			}
			if (this.getOption('triggerScrollEvents') != false) {
				this.triggerMethod('scrolled:to:' + edge);
			}
		}
	});
});

var SortableBehavior = backbone_marionette.Behavior.extend({

	//for move anchor, in our case whole view is anchor
	selector: '.sortable-anchor',

	// we have to know when childView is clicked for order
	// and when it mouse overed while ordering
	onAddChild: function onAddChild(parent, view) {
		var _this = this;

		var selector = this.getOption('selector');

		//in case if there is a special childNode as anchor
		view.$el.on('mousedown', selector, function (e) {
			return _this.startDragSort(e, view);
		});
		view.$el.on('mouseenter', function (e) {
			return _this.handleMouseEnter(e, view);
		});
	},
	handleMouseEnter: function handleMouseEnter(event, view) {
		if (!this.orderingItem || this.orderingItem == view || view.getOption('notSortable')) {
			return;
		}
		this.view.swapChildViews(this.orderingItem, view);
		this.view.triggerMethod('drag:swap:views', this.orderingItem, view);
	},
	startDragSort: function startDragSort(event, child, touchable) {
		var _this2 = this;

		this.orderingItem = child;
		//mouse up can happens outside.

		$(document).one('mouseup', function (e) {
			return _this2.stopDragSort(e, touchable);
		});
		this.view.triggerMethod('before:drag:sort', child);
	},
	stopDragSort: function stopDragSort() {
		var view = this.orderingItem;
		delete this.orderingItem;
		this.view.triggerMethod('drag:sort', view);
	}
});

var SortableModelBehavior = SortableBehavior.extend({
	initialize: function initialize(options) {
		this.mergeOptions(options, ['swapModels', 'property']);
		if (_.isString(this.swapModels)) {
			this.swapModels = this.view.getOption(this.swapModels);
		}
		if (_.isFunction(this.swapModels)) {
			this.swapModels = this.swapModels.bind(this.view);
		} else if (this.property) {
			this.swapModels = this.swapModelsProperty;
		} else {
			delete this.swapModels;
		}
	},
	swapModelsProperty: function swapModelsProperty(m1, m2) {
		var key = this.property;
		var temp = m1.get(key);
		m1.set(key, m2.get(key));
		m2.set(key, temp);
	},
	onDragSwapViews: function onDragSwapViews(v1, v2) {
		if (!this.swapModels || !v1.model || !v2.model) return;
		this.swapModels(v1.model, v2.model);
	},
	onBeforeDragSort: function onBeforeDragSort() {
		this.changedModels = new bbmnCore.Collection();
		this.listenTo(this.view.collection, 'change', this.storeChangedModel);
	},
	storeChangedModel: function storeChangedModel(model) {
		this.changedModels.add(model);
	},
	onDragSort: function onDragSort() {
		this.stopListening(this.view.collection, 'change', this.storeChangedModel);
		// do something here with changed models
		this.view.triggerMethod('drag:sort:change', this.changedModels.models);
	}
});

var shouldPreventMove = false;
var fakeListener = false;

var preventCallback = function preventCallback(event) {
	if (shouldPreventMove) {
		event.preventDefault();
	}
};

// for canceling click after drag back to the clicked el
function cancelMouseClick(e) {
	e.stopPropagation(); // Stop the click from being propagated.
	window.removeEventListener('click', cancelMouseClick, true); // cleanup
}

// for preventing touchmove after hold


var baseManipulatorEnter = function baseManipulatorEnter(event, initialEl) {

	var touches = !!event.touches;
	var target = event.target;
	if (touches) {
		var touch = event.touches[0];
		target = document.elementFromPoint(touch.pageX, touch.pageY);
	}
	if (initialEl == target || initialEl.contains(target)) return;

	$(target).trigger('manipulator:enter');
};

function delayedTouchstart(touchstart) {
	var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;

	return function (event) {

		if (event.touches.length !== 1) {
			return;
		}

		var el = event.target;

		var heldItem = function heldItem() {

			el.removeEventListener('touchend', onReleasedItem);
			el.removeEventListener('touchmove', onReleasedItem);

			// preventing defalut touchmove
			// using fakeListener from setupTouchMovePrevent
			// and reverting value back after touch end
			shouldPreventMove = true;
			var returnPreventMoveValue = function returnPreventMoveValue() {
				el.removeEventListener('touchend', returnPreventMoveValue);
				shouldPreventMove = false;
			};

			el.addEventListener('touchend', returnPreventMoveValue);

			touchstart(event);
		};

		var onReleasedItem = function onReleasedItem() {
			el.removeEventListener('touchend', onReleasedItem);
			el.removeEventListener('touchmove', onReleasedItem);
			clearTimeout(timer);
		};

		var timer = setTimeout(heldItem, delay);
		el.addEventListener('touchend', onReleasedItem);
		el.addEventListener('touchmove', onReleasedItem);
	};
}

function setupManipulatorEnter() {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    $el = _ref.$el,
	    onManipulatorEnter = _ref.onManipulatorEnter,
	    onStart = _ref.onStart,
	    onEnd = _ref.onEnd,
	    disableTouchScroll = _ref.disableTouchScroll,
	    selector = _ref.selector,
	    preventStart = _ref.preventStart;

	if (!fakeListener) {
		document.addEventListener('touchmove', preventCallback, { passive: false });
		fakeListener = true;
	}

	var el = $el.get(0);
	var manipulatorEnter = _.partial(baseManipulatorEnter, _, el);
	var $doc = $(document);
	var isOnStart = _.isFunction(onStart);
	var isOnEnd = _.isFunction(onEnd);
	var isDisableTouchScroll = _.isFunction(disableTouchScroll);
	var isPreventStart = _.isFunction(preventStart);

	var touchStart = function touchStart() {

		isOnStart && onStart();
		isDisableTouchScroll && disableTouchScroll();

		var touchEnd = function touchEnd() {
			document.removeEventListener('touchmove', manipulatorEnter);
			document.removeEventListener('touchend', touchEnd);
			isOnEnd && onEnd();
		};

		document.addEventListener('touchmove', manipulatorEnter, { passive: false });
		document.addEventListener('touchend', touchEnd, { passive: false });
	};

	el.addEventListener('touchstart', delayedTouchstart(touchStart), { passive: false });

	$el.on('mousedown', selector, function (original) {
		if (isPreventStart && preventStart()) {
			original.preventDefault();
			return;
		}

		var stopHandlers = function stopHandlers(event) {
			original.preventDefault();
			event.preventDefault();
			$doc.off('mouseenter', '*', manipulatorEnter);
			$el.off('mousemove', mouseStart);
			isOnEnd && onEnd();
			return false;
		};

		var mouseStart = function mouseStart() {
			$el.one('mouseup', function () {
				window.addEventListener('click', cancelMouseClick, true);
			});
			onStart && onStart();
			$doc.on('mouseenter', '*', manipulatorEnter);
		};
		$doc.one('mouseup', stopHandlers);
		$el.one('mousemove', mouseStart);
	});
	$el.on('manipulator:enter', onManipulatorEnter);
}

var InteractionBehavior = backbone_marionette.Behavior.extend({
	getOption: function getOption$$1() {
		return bbmnUtils.getOption.apply(undefined, [this].concat(Array.prototype.slice.call(arguments)));
	},
	onAddChild: function onAddChild(parent, view) {
		var _this = this;

		setupManipulatorEnter({
			$el: view.$el,

			onManipulatorEnter: function onManipulatorEnter() {
				return view.trigger('enter');
			},
			onStart: function onStart() {
				return _this.startInteraction(view);
			},
			onEnd: function onEnd() {
				return _this.endInteraction(view);
			},
			selector: this.getOption('selector')
		});
		this.listenTo(view, 'enter', function () {
			return _this.viewEntered(view);
		});
		this.setupView(view);
	},
	viewEntered: function viewEntered(view) {
		this.view.triggerMethod('view:entered', view);
	},
	startInteraction: function startInteraction(view) {
		this.dragging = view;
		view.dragging = true;
		var options = this.getOption('interactionStartOptions');
		this.view.triggerMethod('interaction:start', view, options);
	},
	endInteraction: function endInteraction(view) {
		delete this.dragging;
		delete view.dragging;
		var options = this.getOption('interactionEndOptions');
		this.view.triggerMethod('interaction:end', view, options);
	},

	setupView: _.noop
});

var SwappableBehavior = InteractionBehavior.extend({
	initialize: function initialize(options) {
		this.initializeSwappable(options);
	},
	initializeSwappable: function initializeSwappable(options) {
		this.mergeOptions(options, ['swap', 'property', 'canBeSwapped']);
		if (_.isString(this.swap)) {
			this.swap = this.view.getOption(this.swap);
		}
		if (_.isFunction(this.swap)) {
			this.swap = this.swap.bind(this.view);
		} else if (this.property) {
			this.swap = this.swapModelsProperty;
		} else {
			delete this.swap;
		}
		this.changedModels = new bbmnCore.Collection();
	},
	interactionEndOptions: function interactionEndOptions() {
		return this.changedModels.models;
	},
	viewEntered: function viewEntered(view) {
		var result = this.view.triggerMethod('view:entered', view);
		if (result === false) return;
		this.swapViews(view);
	},
	storeChangedModel: function storeChangedModel(model) {
		this.changedModels.add(model);
	},
	canBeSwapped: function canBeSwapped() {
		return true;
	},
	swapViews: function swapViews(entered) {

		if (!this.canBeSwapped(entered)) return;

		this.view.swapChildViews(this.dragging, entered);

		this.dragging.model && this.storeChangedModel(this.dragging.model);
		entered.model && this.storeChangedModel(entered.model);

		this.view.triggerMethod('swap:views', this.dragging, entered);
	},
	onSwapViews: function onSwapViews(one, two) {
		this.swap(one, two, this.getOption('swapOptions'));
	},
	swapModelsProperty: function swapModelsProperty(v1, v2, opts) {
		if (this.property == null) return;
		var key = this.property;

		if (v1.model == null || v2.model == null) return;
		var m1 = v1.model;
		var m2 = v2.model;

		var temp = m1.get(key);
		m1.set(key, m2.get(key), opts);
		m2.set(key, temp, opts);
	}
});

var index$19 = (function (Base) {
	return Base.extend({
		defaultWait: false,
		createReturnPromise: false,
		create: function create(model) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			if (!_.has(options, 'wait')) {
				options.wait = this.defaultWait;
			}
			var create = Base.prototype.create.call(this, model, options);
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
});

exports.emptyFetchMixin = index;
exports.emptyViewMixin = index$1;
exports.improvedIndexesMixin = index$2;
exports.nextCollectionViewMixin = index$3;
exports.customsMixin = index$4;
exports.fetchNextMixin = index$5;
exports.optionsMixin = index$9;
exports.improvedFetchMixin = index$6;
exports.childrenableMixin = index$7;
exports.nestedEntitiesMixin = index$8;
exports.urlPatternMixin = index$10;
exports.renderOnModelChangeMixin = index$11;
exports.smartGetMixin = index$12;
exports.saveAsPromiseMixin = index$13;
exports.cssClassModifiersMixin = index$15;
exports.nestedViewsMixin = index$17;
exports.destroyViewMixin = index$16;
exports.buildViewByKeyMixin = index$14;
exports.scrollHandlerMixin = index$18;
exports.InteractionBehavior = InteractionBehavior;
exports.SwappableBehavior = SwappableBehavior;
exports.SortableBehavior = SortableBehavior;
exports.SortableModelBehavior = SortableModelBehavior;
exports.createAsPromiseMixin = index$19;

return exports;

}({},_,bbmn,bbmn.utils,$,Mn));

//# sourceMappingURL=index.js.map
