import _ from 'underscore';
import { isView, isViewClass } from 'bbmn-core';
import { betterResult } from 'bbmn-utils';

export default Base => Base.extend({
	
	renderAllCustoms: false,
	shouldMergeCustoms: false,
	renderCollection: true,

	constructor(){
		Base.apply(this, arguments);
		if (this.getOption('renderCollection') === false && this.collection) {
			this._collection = this.collection;
			delete this.collection;
		}
		this._initializeCustoms();
	},
	_getCustomsArray(){
		if (!this._customs)
			this._customs = [];
		return this._customs;
	},
	getCollection(){
		return this.collection || this._collection;
	},
	clearCustoms(){
		let arr = this._getCustomsArray();
		arr.length = 0;
	},
	addCustom(...args){
		let arr = this._getCustomsArray();
		arr.push(...args);
	},
	unshiftCustom(...args){
		let arr = this._getCustomsArray();
		arr.unshift(...args);
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

		this.addCustom(...add);

		if (this.getOption('renderAllCustoms')) {
			this.on('render', this._renderCustoms);
		}
	},
	renderCustoms(){
		this.triggerMethod('before:customs:render');

		_.each(this._renderedCustoms, view => view.destroy());
		let registered = this._getCustoms();
		let rawcustoms = this.getCustoms(registered);
		let customs = this._prepareCustoms(rawcustoms);

		this._renderedCustoms = this.addChildViews(customs);

		this.triggerMethod('customs:render');
	},
	_renderCustoms(){
		if (!this.getOption('renderAllCustoms')) return;
		this.renderCustoms();
	},
	_getCustoms() {
		let arr = this._getCustomsArray();
		return _.clone(arr);
	},
	getCustoms(customs) {		
		return customs;
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
		if (_.isArray(arg)) {
			return arg;
		}
		if (isView(arg) || isViewClass(arg)) {
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
	buildCustom(view, options = {}){ 
		let childOptions = this.getOption('customViewOptions', { args: [ this ]});
		if (isViewClass(view)) {
			view = new view(childOptions);
		} else if (_.isFunction(view)) {
			view = view.call(this, this, childOptions);
		} else if(!isView(view) && _.isObject(view) && 'view' in view) {
			if(isView(view.view)) {
				if(_.isObject(view.options))
					options = view.options;
				view = view.view;
			} else if(isViewClass(view.view)) {
				let options = betterResult(view, 'options', { context: this, args: [this, childOptions]})
				let viewOptions = _.extend({}, childOptions, options);
				view = new view.view(viewOptions);
			}
		}
		if (isView(view)) {
			this._setupCustom(view);
			return [view, options]; 
		}
	},
	_setupCustom(view){
		return this.setupCustom(view);
	},
	setupCustom: view => view,
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
