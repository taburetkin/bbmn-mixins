import _ from 'underscore';
function rebuildIndexes() {
	if (!this.getOption('shouldRebuildIndexes') || !this.collection) {
		return;
	}
	let models = this.collection.models;
	for (let index = 0, length = models.length; index < length; index++) {
		let model = models[index];
		let view = this._children.findByModel(model);
		view && (view._index = index);
	}
}

export default CollectionView => CollectionView.extend({
	shouldRebuildIndexes: true,

	constructor() {		
		
		CollectionView.apply(this, arguments);
		this.on('before:sort', rebuildIndexes.bind(this));
	},
	_addChild(view, index){
		view._isModelView = arguments.length === 1;
		if (index != null) {
			if(_.isObject(index)) {
				index = index.index;
			}
			view._index = index;
		}
		return CollectionView.prototype._addChild.apply(this, arguments);
	},
	_viewComparator(v1,v2){
		let res = v1._index - v2._index;
		if(isNaN(res)) {
			res = v1._index < v2._index;
			!res && (v1._index < v2._index)
		}
		if (res) return res;
		if (v1._isModelView) return 1;
		return -1;
	},
});
