import _ from 'underscore';
import { InteractionBehavior }  from './interaction-behavior';
import { Collection } from 'bbmn-core';

export const SwappableBehavior = InteractionBehavior.extend({
	initialize(options){
		this.initializeSwappable(options);
	},

	initializeSwappable(options){
		this.mergeOptions(options, ['swap', 'property', 'canBeSwapped']);
		if (_.isString(this.swap)){
			this.swap = this.view.getOption(this.swap);
		}
		if (_.isFunction(this.swap)) {
			this.swap = this.swap.bind(this.view);
		} else if (this.property) {
			this.swap = this.swapModelsProperty;      
		} else {
			delete this.swap;
		}
		this.changedModels = new Collection();
	},

	interactionEndOptions(){
		return this.changedModels.models;
	},


	viewEntered(view){
		let result = this.view.triggerMethod('view:entered', view);
		if (result === false) return;
		this.swapViews(view);
	},		



	storeChangedModel(model){
		this.changedModels.add(model);
	},
	canBeSwapped(){
		return true;
	},

	swapViews(entered){

		if (!this.canBeSwapped(entered)) return;

		this.view.swapChildViews(this.dragging, entered);
		
		this.dragging.model && this.storeChangedModel(this.dragging.model);
		entered.model && this.storeChangedModel(entered.model);

		this.view.triggerMethod('swap:views', this.dragging, entered);

	},
	onSwapViews(one, two){
		this.swap(one, two, this.getOption('swapOptions'));
	},
	swapModelsProperty(v1,v2, opts){
		if (this.property == null) return;
		let key = this.property;
		
		if(v1.model == null || v2.model == null) return;
		let m1 = v1.model;
		let m2 = v2.model;

		let temp = m1.get(key);
		m1.set(key, m2.get(key), opts);
		m2.set(key, temp, opts);
	},	
});
