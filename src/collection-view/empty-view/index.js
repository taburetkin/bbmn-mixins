import _ from 'underscore';

export default Base => Base.extend({
	emptyView(){
		return this._emptyViewSelector({
			fetching: this.isFetching(),
			fetched: this.isFetched(),
		});
	},
	isFetching(){
		return this.collection && _.isFunction(this.collection.isFetching) && this.collection.isFetching();
	},
	isFetched(){
		return this.collection && _.isFunction(this.collection.isFetched) && this.collection.isFetched();
	},
	_emptyViewSelector({ fetching, fetched }={}){
		let wait = this.getOption('waitView');
		let nodata = this.getOption('noDataView');
		if (fetching && !fetched){
			return wait || nodata;
		} else {
			return nodata;
		}
	},
});
