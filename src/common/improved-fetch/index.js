import _ from 'underscore';
export default Base => Base.extend({
	constructor(){
		
		this.on({
			request(){
				this._isFetching = true;
			},
			sync(){
				this._isFetching = false;
				this._isFetched = true;
			}
		});
		
		Base.apply(this, arguments);
	},
	isFetching(){
		return this._isFetching === true;
	},
	isFetched(){
		return this._isFetched === true;
	},
	concurrentFetch: 'first',
	fetch({ concurrent } = {}) {
		if (concurrent == null) {
			concurrent = this.concurrentFetch;
		}

		if (concurrent === 'first') {
			if (this._fetchingPromise) {
				return this._fetchingPromise;
			} else {
				let promise = this._fetchingPromise = Base.prototype.fetch.apply(this, arguments);
				promise.then(() => {
					delete this._fetchingPromise;
				}, () => {
					delete this._fetchingPromise;
				});
				return promise;	
			}
		} else {
			let promise = this._fetchingPromise = Base.prototype.fetch.apply(this, arguments);
			return promise;
		}
	},
	fetchIfNot(opts){
		if(this.isFetched()){
			return Promise.resolve();
		} else {
			return this.fetch(_.extend({ concurrent: 'first', opts }));
		}
	},
});
