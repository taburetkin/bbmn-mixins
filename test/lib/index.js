import Mn, { Region } from 'backbone.marionette';
import { Collection, Model, Router, View as View$1 } from 'backbone';

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

var index$1 = (function (CollectionView) {
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

var index$2 = (function (CollectionView) {
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

var MnObject = Mn.Object || Mn.MnObject;

function isClass(arg, Base) {
	return _.isFunction(arg) && (arg == Base || arg.prototype instanceof Base);
}

function isModel(arg) {
	return arg instanceof Model;
}

function isView(arg) {
	return arg instanceof View$1;
}

function isViewClass(arg) {
	return isClass(arg, View);
}

var extend = Model.extend;

var BaseClass = function BaseClass() {};
BaseClass.extend = extend;

var ctors = _.reduce([Model, Collection, View$1, Router, MnObject, Region, BaseClass], function (ctors, ctor) {
	if (_.isFunction(ctor)) {
		ctors.push(ctor);
	}
}, []);

var tryGetFromMn = ['Application', 'AppRouter'];

_.each(tryGetFromMn, function (ClassName) {
	_.isFunction(Mn[ClassName]) && ctors.push(Mn[ClassName]);
});

function isKnownCtor(arg) {
	var isFn = _.isFunction(arg);
	var result = _(ctors).some(function (ctor) {
		return arg === ctor || arg.prototype instanceof ctor;
	});
	return isFn && result;
}

function betterResult(obj, key) {
	var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	var context = opts.context,
	    args = opts.args,
	    checkAlso = opts.checkAlso,
	    force = opts.force;

	var defaultValue = opts.default;

	if (!_.isString(key) || key === '') return;

	var value = (obj || {})[key];

	if (value != null && (!_.isFunction(value) || isKnownCtor(value))) return value;

	var result = force !== false && _.isFunction(value) ? value.apply(context || obj, args) : value;

	if (result == null && _.isObject(checkAlso)) {
		var alsoOptions = _.omit(opts, 'checkAlso');
		result = betterResult(checkAlso, key, alsoOptions);
	}

	if (result == null && defaultValue != null) result = defaultValue;

	return result;
}

// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc

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

function getProperty(context, name) {
	if (context == null || !_.isObject(context) || name == null || name == '') return;
	if (isModel(context)) return context.get(name, { gettingByPath: true });else return context[name];
}

function getByPathArray(context, propertyName, pathArray) {

	if (context == null || !_.isObject(context) || propertyName == null || propertyName == '') return;

	var prop = getProperty(context, propertyName);

	if (!pathArray.length || pathArray.length && prop == null) return prop;

	var nextName = pathArray.shift();

	return getByPathArray(prop, nextName, pathArray);
}

function getByPath(obj, path) {

	if (obj == null || !_.isObject(obj) || path == null || path == '') return;

	var pathArray = _.isString(path) ? path.split('.') : _.isArray(path) ? [].slice.call(path) : [path];

	var prop = pathArray.shift();

	return getByPathArray(obj, prop, pathArray);
}

function getOption() {
	var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var key = arguments[1];
	var opts = arguments[2];
	var also = arguments[3];


	if (_.isObject(key) && _.isString(opts)) {
		var _opts = also;
		also = key;
		key = opts;
		opts = _opts;
	}

	var options = _.extend({ args: [context], context: context }, opts, { default: null });
	var deep = options.deep;

	var defaultValue = opts && opts.default;

	var value = betterResult(context.options || also, key, options);
	if (value == null && deep !== false) {
		value = betterResult(context, key, options);
	}

	return value != null ? value : defaultValue;
}

function buildViewByKey(key) {
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    TextView = _ref.TextView,
	    options = _ref.options;

	if (!_.isString(key)) {
		return;
	}

	var view = getOption(this, key, { args: [this] });
	var _options = getOption(this, key + 'Options', { args: [this] });

	if (TextView && _.isString(view)) {
		_options = _.extend({}, _options, { text: view });
		view = TextView;
	}
	options = _.extend({}, options, _options);

	if (isView(view)) {
		return view;
	} else if (isViewClass(view)) {
		return new view(options);
	}
}

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

			var optionsCustoms = betterResult(this.options, 'customs', { args: [this], context: this });
			var instanceCustoms = betterResult(this, 'customs', { args: [this] });
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

			var customs = this.getCustoms();

			this._renderedCustoms = this.addChildViews(customs);

			this.triggerMethod('customs:render');
		},
		_renderCustoms: function _renderCustoms() {
			if (!this.getOption('renderAllCustoms')) return;
			this.renderCustoms();
		},
		getCustoms: function getCustoms() {
			return this._prepareCustoms(this._customs.slice(0));
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

			if (isViewClass(view)) {
				var childOptions = this.getOption('customViewOptions');
				view = new view(childOptions);
			} else if (_.isFunction(view)) {
				view = view.call(this, this);
			} else if (!isView(view) && _.isObject(view) && 'view' in view) {
				if (isView(view.view)) {
					if (_.isObject(view.options)) options = view.options;
					view = view.view;
				} else if (isViewClass(view.view)) {
					var viewOptions = view.options;
					view = new view.view(viewOptions);
				}
			}
			if (isView(view)) {
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
				if (!isView(view)) {
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

var Mixin = function Mixin(Base) {
	return Base.extend({

		//property first approach
		getProperty: function getProperty(key, opts) {

			var defaultGetArguments = betterResult(this, '_getPropertyArguments', { args: [this], default: [this] });
			var options = _.extend({
				deep: Mixin.defaults.deep,
				force: Mixin.defaults.force,
				args: defaultGetArguments
			}, opts, {
				context: this
			});
			var deep = options.deep;


			var value = betterResult(this, key, options);
			if (value == null && deep !== false) {
				value = betterResult(this.options, key, options);
			}
			return value;
		},


		//options first approach
		getOption: function getOption$$1(key, opts) {
			var defaultGetArguments = betterResult(this, '_getOptionArguments', { args: [this], default: [this] });
			var options = _.extend({
				deep: Mixin.defaults.deep,
				force: Mixin.defaults.force,
				args: defaultGetArguments
			}, opts);

			return getOption(this, key, options);
		},
		mergeOptions: function mergeOptions() {
			var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var _this = this;

			var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
			var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


			if (_.isString(keys)) keys = keys.split(/\s*,\s*/);

			_.each(keys, function (key) {
				var option = betterResult(values, key, _.extend({ force: false }, opts));
				if (option !== undefined) {
					_this[key] = option;
				}
			});
		}
	}, {
		GetOptionMixin: true
	});
};

Mixin.defaults = {
	deep: true,
	force: true
};

var index$5 = (function (Collection$$1) {
	return Collection$$1.extend({
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

			Collection$$1.apply(this, arguments);
		},
		isFetching: function isFetching() {
			return this._isFetching === true;
		},
		isFetched: function isFetched() {
			return this._isFetched === true;
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
			this.mergeOptions(opts, ['parent', 'root']);
			if (this.parent == null && this.root == null) this.root = this;
		},


		//call this method manualy for initialize children
		initializeChildren: function initializeChildren() {
			var _this = this;

			if (this._childrenInitialized) return;

			var children = this.getOption('children');
			this._children = [];
			_(children).each(function (child) {
				return _this._initializeChild(child);
			});

			this._childrenInitialized = true;
		},
		_initializeChild: function _initializeChild(arg) {
			var Child = void 0;
			var options = {};

			if (isKnownCtor(arg)) Child = arg;else if (_.isFunction(arg)) {

				var invoked = arg.call(this, this);
				return this._initializeChild(invoked);
			} else if (_.isObject(arg)) {
				Child = arg.Child;
				_.extend(options, _.omit(arg, 'Child'));
			}

			//if (!isKnownCtor(arg)) return;

			_.extend(options, this.getOption('childOptions'), { parent: this });
			options = this.buildChildOptions(options);

			var child = this.buildChild(Child, options);
			this._children.push(child);
		},
		buildChildOptions: function buildChildOptions(options) {
			return options;
		},
		buildChild: function buildChild(Child, options) {
			!Child && (Child = this.getOption('defaultChildClass') || this.prototype.constructor);
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
	var originalGet = Model.prototype.get;
	var Mixed = Base.extend({
		getByPath: function getByPath$$1(key) {
			if (key.indexOf('.') > -1) return getByPath(this, key);else return originalGet.call(this, key);
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
		buildViewByKey: function buildViewByKey$$1() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return buildViewByKey.call.apply(buildViewByKey, [this].concat(toConsumableArray(args)));
		}
	});
});

var defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true
};

var index$9 = (function (Base) {
	return Base.extend({
		constructor: function constructor() {
			if (!this.cssClassModifiers) {
				this.cssClassModifiers = [];
			}
			Base.apply(this, arguments);
			this._setupCssClassModifiers();
		},
		addCssClassModifier: function addCssClassModifier() {
			var _cssClassModifiers;

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
			var optsModifiers = betterResult(this.options || {}, 'cssClassModifiers', { args: [this.model, this], default: [] });
			var propsModifiers = betterResult(this, 'cssClassModifiers', { args: [this.model, this], default: [] });
			var className = betterResult(this, 'className', { args: [this.model, this], default: [] });
			var modifiers = [className].concat(optsModifiers, propsModifiers);
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

			// return _.chain(classes)
			// 	.keys(classes)
			// 	.uniq()
			// 	.value()
			// 	.join(' ');
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

var index$10 = (function (Base) {
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

var index$11 = (function (Base) {
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

			if (isViewClass(context)) {
				var View$$1 = context;
				context = {
					name: name, View: View$$1
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
			var passedView = betterResult(context, 'view', { context: this, args: [this, this.model] });
			if (_.isFunction(context.template)) return context.template;else if (isView(passedView)) {
				return passedView;
			} else {
				var View$$1 = context.View;
				var options = this.buildNestedViewOptions(betterResult(context, 'options', { context: this, args: [this, this.model], default: {} }));

				return new View$$1(options);
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

export { index as emptyFetchMixin, index$1 as improvedIndexesMixin, index$2 as nextCollectionViewMixin, index$4 as customsMixin, Mixin as getOptionMixin, index$5 as isFetchingMixin, index$6 as childrenableMixin, index$7 as smartGetMixin, index$9 as cssClassModifiersMixin, index$11 as nestedViewsMixin, index$10 as destroyView, index$8 as buildViewByKeyMixin };

//# sourceMappingURL=index.js.map
