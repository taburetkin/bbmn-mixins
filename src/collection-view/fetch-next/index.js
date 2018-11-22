export default Base => Base.extend({
	fetchNextEdge: 'bottom',
	constructor(){
		Base.apply(this, arguments);
		let scrollEdge = this.getOption('fetchNextEdge');
		if (scrollEdge) {
			let event = scrollEdge + ':edge';
			this.addScrollEvents({
				[event](){
					this.fetchNext({ onlyIfNotFetching: true }).then(() => {
						this.clearScrollEdges();
					});
				}				
			});
			let collection = this.getCollection();
			if(collection){
				this.listenTo(collection,'query:change',() => {
					this.scrollToStart();
					this.clearScrollEdges();
				});
			}
		}
	},
	fetchNext({ onlyIfNotFetching }={}){
		let collection = this.getCollection();
		if(!collection) return Promise.resolve();
		if (onlyIfNotFetching && collection.isFetching()) return Promise.resolve(collection);
		return collection.fetchNext ? collection.fetchNext() : collection.fetch();
	},
});
