import _ from 'underscore';
export default Base => Base.extend({
	/*
	
	renderOnModelChange: false,
	refreshOnModelChange: false,
	triggerRefreshOnModelChange: false,
	invokeOnModelChange: true,	

	*/

	constructor(){
		Base.apply(this, arguments);
		this._initRenderOnModelChange();
	},
	_initRenderOnModelChange(){
		if (!this.model) return;

		let shouldRender = this.getOption('renderOnModelChange', { args: [this]});
		let shouldRefresh = this.getOption('refreshOnModelChange', { args: [this]});
		let shouldTriggerRefresh = this.getOption('triggerRefreshOnModelChange', { args: [this]});
		let shouldInvoke = this.getOption('invokeOnModelChange', { args: [this]});

		this.listenTo(this.model, 'before:destroy', () => this.stopListening(this.model));
		this.listenTo(this.model, 'change', () => {

			if (shouldRefresh && _.isFunction(this.refresh)) {
				this.refresh();
			}

			if (shouldTriggerRefresh) {
				this.trigger('refresh');
			}

			if (shouldInvoke && _.isFunction(this.onModelChange)) {
				this.onModelChange();
			}

			if (shouldRender) {
				this.render();
			}

		});


	}
});
