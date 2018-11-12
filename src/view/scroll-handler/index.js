import _ from 'underscore';

export default Base => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		this._initializeScrollHandler();
		this.addCssClassModifier('scrollable');
	},

	_initializeScrollHandler(){
		this._shdata = {
			dim: {},
			off: {}
		};
		this._scrollHandler = _.bind(this._scrollHandler, this);
		this.on({
			'attach scroll:handling:on': () => {
				this._scrollHandler();
				this.delegateEvents({
					'scroll': this._scrollHandler
				});
			},
			'detach scroll:handling:off': () => this.undelegateEvents({
				'scroll': this._scrollHandler
			}),
			'render render:children edges:clear': this._clearEdges
		});
	},

	_scrollHandler(){
		let scroll = this.getScrollPosition();
		let edges = this.checkElementEdge(scroll);
		this._tryTriggerEdges(edges);
	},

	getScrollPosition(){
		return {
			left: this.$el.scrollLeft(),
			top: this.$el.scrollTop()
		};
	},
	checkElementEdge(position){
		let edges = this.getElementEdges();
		let left = edges.left - position.left;
		let top = edges.top - position.top;
		if(left < 300) left = 0;
		if(top < 300) top = 0;
		return { left, top };
	},

	getElementEdges(){
		let left = this._shdata.dim.width;
		if(left == null){
			left = this._shdata.dim.width = this.$el.get(0).scrollWidth - this.$el.width();
		}
		let top = this._shdata.dim.height;
		if(top == null){
			top = this._shdata.dim.height = this.$el.get(0).scrollHeight - this.$el.height();
		}
		return { left, top };
	},
	_clearEdges(){
		delete this._shdata.dim.width;
		delete this._shdata.dim.height;
	},



	_tryTriggerEdges(edges){
		let shouldTrigger = {};
		let elementEdges = this.getElementEdges();
		if(!edges.left)
			shouldTrigger.right = elementEdges.left;

		if(!edges.top)
			shouldTrigger.bottom = elementEdges.top;

		if(!_.size(shouldTrigger)) return;

		_(shouldTrigger).each((offset, edge) => {
			this._triggerEdge(edge, offset);
		});

	},
	_triggerEdge(edge, offset){
		
		let storedOffset = this._shdata.off[edge];

		if(storedOffset != null && storedOffset >= offset) {
			return;
		}

		this.triggerMethod('scrolled:to:' + edge);
		this._shdata.off[edge] = offset;
	},

});
