(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('underscore'), require('bbmn-core'), require('bbmn-utils'), require('jquery')) :
	typeof define === 'function' && define.amd ? define(['exports', 'underscore', 'bbmn-core', 'bbmn-utils', 'jquery'], factory) :
	(factory((global.bbmn = global.bbmn || {}, global.bbmn.mixins = {}),global._,global.bbmn,global.bbmn.utils,global.$));
}(this, (function (exports,_,bbmnCore,bbmnUtils,$) { 'use strict';

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
			this._customs = [];
			Base.apply(this, arguments);
			if (this.getOption('renderCollection') === false && this.collection) {
				this._collection = this.collection;
				delete this.collection;
			}
			this._initializeCustoms();
		},
		getCollection: function getCollection() {
			return this.collection || this._collection;
		},
		_initializeCustoms: function _initializeCustoms() {
			var _customs;

			var optionsCustoms = bbmnUtils.betterResult(this.options, 'customs', { args: [this], context: this });
			var instanceCustoms = bbmnUtils.betterResult(this, 'customs', { args: [this] });
			var shouldMergeCustoms = this.getOption('shouldMergeCustoms');
			var add = void 0;
			if (shouldMergeCustoms) {
				add = (instanceCustoms || []).concat(optionsCustoms || []);
			} else {
				add = instanceCustoms || optionsCustoms || [];
			}
			(_customs = this._customs).push.apply(_customs, toConsumableArray(add));

			if (this.getOption('renderAllCustoms')) {
				this.on('render', this._renderCustoms);
			}
		},
		renderCustoms: function renderCustoms() {
			this.triggerMethod('before:customs:render');

			_.each(this._renderedCustoms, function (view) {
				return view.destroy();
			});

			var rawcustoms = this.getCustoms();
			var customs = this._prepareCustoms(rawcustoms);

			this._renderedCustoms = this.addChildViews(customs);

			this.triggerMethod('customs:render');
		},
		_renderCustoms: function _renderCustoms() {
			if (!this.getOption('renderAllCustoms')) return;
			this.renderCustoms();
		},
		getCustoms: function getCustoms() {
			return _.clone(this._customs);
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
			if (_.isFunction(arg)) {
				return this._prepareCustom(arg.call(this, this));
			} else if (_.isArray(arg)) {
				return arg;
			} else {
				return [arg, { index: 0 }];
			}
		},
		buildCustom: function buildCustom(view) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			if (bbmnCore.isViewClass(view)) {
				var childOptions = this.getOption('customViewOptions');
				view = new view(childOptions);
			} else if (_.isFunction(view)) {
				view = view.call(this, this);
			} else if (!bbmnCore.isView(view) && _.isObject(view) && 'view' in view) {
				if (bbmnCore.isView(view.view)) {
					if (_.isObject(view.options)) options = view.options;
					view = view.view;
				} else if (bbmnCore.isViewClass(view.view)) {
					var viewOptions = view.options;
					view = new view.view(viewOptions);
				}
			}
			if (bbmnCore.isView(view)) {
				this._setupCustom(view);
				return [view, options];
			}
		},
		_setupCustom: function _setupCustom(view) {
			this.setupCustom(view);
		},

		setupCustom: _.noop,
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
		}
	});
});

var index$6 = (function (Base) {
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
			_(items).each(function (item, index) {

				if (!_this2._childFilter(item, index, opts)) return;

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

var index$7 = (function (Base) {
	var originalGet = bbmnCore.Model.prototype.get;
	var Mixed = Base.extend({
		getByPath: function getByPath$$1(key) {
			if (key.indexOf('.') > -1) return bbmnUtils.getByPath(this, key);else return originalGet.call(this, key);
		},
		get: function get(key) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			if (key == null || key == '') return;

			var value = 'value' in opts ? opts.value : this.getByPath.call(this, key);

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

var index$8 = (function (Base) {
	return Base.extend({
		defaultWait: false,
		saveReturnPromise: false,
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

var index$9 = (function (Base) {
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

var index$10 = (function (Base) {
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

var index$11 = (function (Base) {
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

var index$12 = (function (Base) {
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

exports.emptyFetchMixin = index;
exports.emptyViewMixin = index$1;
exports.improvedIndexesMixin = index$2;
exports.nextCollectionViewMixin = index$3;
exports.customsMixin = index$4;
exports.improvedFetchMixin = index$5;
exports.childrenableMixin = index$6;
exports.smartGetMixin = index$7;
exports.saveAsPromiseMixin = index$8;
exports.cssClassModifiersMixin = index$10;
exports.nestedViewsMixin = index$12;
exports.destroyViewMixin = index$11;
exports.buildViewByKeyMixin = index$9;

Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.js.map
