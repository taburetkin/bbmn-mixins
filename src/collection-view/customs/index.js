import { isView, isViewClass } from 'bbmn-core';
import { betterResult } from 'bbmn-utils';

export default Base => Base.extend({
	
	renderAllCustoms: false,
	shouldMergeCustoms: false,
	renderCollection: true,

	constructor(){
		this._customs = [];		
		Base.apply(this, arguments);
		if (this.getOption('renderCollection') === false && this.collection) {
			this._collection = this.collection;
			delete this.collection;
		}
		this._initializeCustoms();
	},
	getCollection(){
		return this.collection || this._collection;
	},
	_initializeCustoms(){

		let optionsCustoms = betterResult(this.options, 'customs', { args: [this], context: this });
		let instanceCustoms = betterResult(this, 'customs', { args: [this] });
		let shouldMergeCustoms = this.getOption('shouldMergeCustoms');
		let add;
		if (shouldMergeCustoms) {
			add = (instanceCustoms || []).concat(optionsCustoms || []);			
		} else {
			add = instanceCustoms || optionsCustoms || [];
		}
		this._customs.push(...add);

		if (this.getOption('renderAllCustoms')) {
			this.on('render', this._renderCustoms);
		}
	},
	renderCustoms(){
		this.triggerMethod('before:customs:render');

		_.each(this._renderedCustoms, view => view.destroy());
		
		let customs = this.getCustoms();
		
		this._renderedCustoms = this.addChildViews(customs);

		this.triggerMethod('customs:render');
	},
	_renderCustoms(){
		if (!this.getOption('renderAllCustoms')) return;
		this.renderCustoms();
	},
	getCustoms() {		
		return this._prepareCustoms(this._customs.slice(0));
	},
	_prepareCustoms(rawcustoms){
		return _.reduce(rawcustoms, (array, item) => {
			let args = this._prepareCustom(item);
			args && (args = this.buildCustom(...args));
			args && array.push(args);
			return array;
		},[]);
	},
	_prepareCustom(arg){
		if (_.isFunction(arg)) {
			return this._prepareCustom(arg.call(this, this));
		} else if (_.isArray(arg)) {
			return arg;
		} else {
			return [arg, { index: 0 }];
		}
	},
	buildCustom(view, options = {}){ 
		if (isViewClass(view)) {
			let childOptions = this.getOption('customViewOptions');
			view = new view(childOptions);
		} else if (_.isFunction(view)) {
			view = view.call(this, this);
		} else if(!isView(view) && _.isObject(view) && 'view' in view) {
			if(isView(view.view)) {
				if(_.isObject(view.options))
					options = view.options;
				view = view.view;
			} else if(isViewClass(view.view)) {
				let viewOptions = view.options;
				view = new view.view(viewOptions);
			}
		}
		if (isView(view)) {
			this._setupCustom(view);
			return [view, options]; 
		}
	},
	_setupCustom(view){
		this.setupCustom(view);
	},
	setupCustom: _.noop,
	addChildViews(children = []){
		if (!children.length) { return; }

		let awaitingRender = false;
		let rendered = [];
		while(children.length) {

			let args = children.pop();
			if (!args) { continue; }

			if (!_.isArray(args)) {
				args = [args, { index: 0 }];
			}

			let [ view, index, options = {} ] = args;
			if (_.isObject(index)) {
				options = index;
				index = undefined;
			}
			if (index != null && !('index' in options)) {
				options.index = index;
			}
			options.preventRender = !!children.length;
			if (!isView(view)) { continue; }

			this.addChildView(view, options);
			rendered.push(view);
			awaitingRender = options.preventRender;
		}
		if (awaitingRender) {
			this.sort();
		}
		return rendered;
	},
}, { CustomsMixin: true });
