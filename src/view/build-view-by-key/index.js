import { buildViewByKey } from 'bbmn-utils';
export default Base => Base.extend({
	buildViewByKey(...args){
		return buildViewByKey.call(this, ...args);
	},
});
