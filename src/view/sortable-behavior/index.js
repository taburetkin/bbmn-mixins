import _ from 'underscore';
import $ from 'jquery';
import { Behavior } from 'backbone.marionette';
import { Collection } from 'bbmn-core';


export const SortableBehavior = Behavior.extend({

	//for move anchor, in our case whole view is anchor
	selector: '.sortable-anchor',

	// we have to know when childView is clicked for order
	// and when it mouse overed while ordering
	onAddChild(parent, view) {

		let selector = this.getOption('selector');

		//in case if there is a special childNode as anchor
		view.$el.on('mousedown', selector, e => this.startDragSort(e,view));	
		view.$el.on('mouseenter', e => this.handleMouseEnter(e, view));

	},

	handleMouseEnter(event, view){
		if (!this.orderingItem || this.orderingItem == view) {
			return;
		}
		this.view.swapChildViews(this.orderingItem, view);
		this.view.triggerMethod('drag:swap:views', this.orderingItem, view);
	},

	startDragSort(event, child){
		this.orderingItem = child;
		//mouse up can happens outside.
		$(document).one('mouseup', e => this.stopDragSort(e));
		this.view.triggerMethod('before:drag:sort', child);
	},
	stopDragSort(){
		let view = this.orderingItem;
		delete this.orderingItem;
		this.view.triggerMethod('drag:sort', view);
	},
});



export const SortableModelBehavior = SortableBehavior.extend({
	initialize(options){
		this.mergeOptions(options, ['swapModels', 'property']);
		if (_.isString(this.swapModels)){
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
	swapModelsProperty(m1,m2){
		let key = this.property;
		let temp = m1.get(key);
		m1.set(key, m2.get(key));
		m2.set(key, temp);  
	},
	onDragSwapViews(v1,v2){
		if (!this.swapModels || !v1.model || !v2.model) return;
		this.swapModels(v1.model, v2.model);
	},
	onBeforeDragSort(){
		this.changedModels = new Collection();
		this.listenTo(this.view.collection, 'change', this.storeChangedModel);
	},
	storeChangedModel(model){
		this.changedModels.add(model);
	},
	onDragSort(){
		this.stopListening(this.view.collection, 'change', this.storeChangedModel);
		// do something here with changed models
		this.view.triggerMethod('drag:sort:change', this.changedModels.models);
	},
});
