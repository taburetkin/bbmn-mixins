import '../setup.js';
import { getOption } from 'bbmn-utils';
import { getOptionMixin } from '../../src/index.js';
import { View } from 'backbone.marionette';

describe('when', function(){
	const MyView = getOptionMixin(View);
	const test = new MyView();
	it('should', function(){
		expect(test.getProperty).to.be.a('function');
	});
});
