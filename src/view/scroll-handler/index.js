import _ from 'underscore';
import $ from 'jquery';
import { normalizeMethods } from 'backbone.marionette';

import { camelCase } from 'bbmn-utils';

export default Base => Base.extend({
	triggerScrollEvents: false,
	
	constructor(){
		Base.apply(this, arguments);
		this._initializeScrollHandler();
		this.addCssClassModifier('scrollable');
	},



	_initializeScrollHandler(){

		let scrollDelegate = {
			'scroll': this._scrollHandler.bind(this)
		};
		this.on({
			'attach': () => this.delegateEvents(scrollDelegate),
			'detach': () => this.undelegateEvents(scrollDelegate),
		});
		let events = this.getOption('scrollEvents', { args: [ this ] });
		this.addScrollEvents(events);
	},
	scrollToStart(){
		let el = this.getScrollElement();
		el.scrollTop = 0;
		el.scrollLeft = 0;
	},
	addScrollEvents(events){
		let hash = normalizeMethods(this, events);
		this._scrollEvents = _.extend({}, this._scrollEvents, hash);
	},

	_scrollHandler(){
		let info = this.getElementInfo();
		this.tryRegisterEdgeHit(info, 'bottom');
		this.tryRegisterEdgeHit(info, 'right');
	},
	tryRegisterEdgeHit(info, edge){
		let scroll = info[camelCase('scroll', edge)];
		let end = info[camelCase('scroll', edge, 'end')];
		if (scroll >= end && !this.isEdgeHited(edge)) {
			this._triggerEdge(edge);
		}
	},
	edgeHitKey:'_scrollHandler.edge',
	isEdgeHited(edge){
		let key = this.edgeHitKey + '.' + edge;
		return this[key] === true;
	},
	setEdgeHit(edge, arg = true){
		let key = this.edgeHitKey + '.' + edge;
		return this[key] = arg;
	},
	getScrollElement(){
		if (!this._scrollElement) {
			let el = this.getOption('scrollElement', { args: [ this ]});
			if(el instanceof Element){
				this._scrollElement;
			} else if(el == null) {
				this._scrollElement = this.el;
			} else if (el.jquery){
				this._scrollElement = el[0];
			}
		}
		return this._scrollElement;
	},	
	getElementInfo(){
		let el = this.getScrollElement();
		let $el = $(el);
		let width = $el.outerWidth();
		let height = $el.outerHeight();
		let scrollBottomEnd = el.scrollHeight - Math.floor(height / 2);
		let scrollRightEnd = el.scrollWidth - Math.floor(width / 2);
		return {
			width, height,
			scrollBottomEnd, scrollRightEnd,
			scrollBottom: el.scrollTop + height,
			scrollRight: el.scrollLeft + width,
		};
	},

	clearScrollEdges(){
		this.setEdgeHit('bottom', false);
		this.setEdgeHit('right', false);
	},

	_triggerEdge(edge){
		this.setEdgeHit(edge);
		if(this._scrollEvents) {
			let handler = this._scrollEvents[`${edge}:edge`];
			handler && handler.call(this);
		}
		if(this.getOption('triggerScrollEvents') != false) {
			this.triggerMethod('scrolled:to:' + edge);
		}
	},

});


