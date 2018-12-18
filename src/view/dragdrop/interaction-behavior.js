import _ from 'underscore';
import { getOption } from 'bbmn-utils';
import { Behavior } from 'backbone.marionette';
import { setupManipulatorEnter } from './helpers';

export const InteractionBehavior = Behavior.extend({
	getOption(){
		return getOption(this, ...arguments);
	},
	onAddChild(parent, view) {

		setupManipulatorEnter({
			$el: view.$el,

			onManipulatorEnter: () => view.trigger('enter'),
			onStart: () => this.startInteraction(view),
			onEnd: () => this.endInteraction(view),
			selector: this.getOption('selector')		
		});		
		this.listenTo(view, 'enter', () => this.viewEntered(view));
		this.setupView(view);
	},
	viewEntered(view){
		this.view.triggerMethod('view:entered', view);
	},
	startInteraction(view){
		this.dragging = view;
		view.dragging = true;
		let options = this.getOption('interactionStartOptions');
		this.view.triggerMethod('interaction:start', view, options);
	},
	endInteraction(view){
		delete this.dragging;
		delete view.dragging;
		let options = this.getOption('interactionEndOptions');
		this.view.triggerMethod('interaction:end', view, options);
	},
	setupView: _.noop,
});
