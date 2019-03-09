import '../setup.js';
import { getOption } from 'bbmn-utils';
import { nestedEntitiesMixin } from '../../src/index.js';
import { View } from 'backbone.marionette';
import { Model, Collection } from 'backbone';
import store from 'backbone.store';

const BaseModel = nestedEntitiesMixin(Model);

describe('common model', function() {
	const Test = BaseModel.extend({
		nestedEntities:{
			nested: () => Test
		}
	});
	it('should update nested', function() { 
		let test = new Test();
		let nested = test.entity('nested');
		test.set({ nested: { foo: 'bar' } })
		expect(nested.get('foo')).to.be.equal('bar');
	});
	it('should update parent', function() { 
		let test = new Test();
		let nested = test.entity('nested');
		nested.set({ foo: 'bar' })
		expect(test.get('nested')).to.be.an('object').and.have.property('foo', 'bar');
	});
	it('should update nested and parent', function() { 
		let test = new Test();
		let nested = test.entity('nested');
		let deepNested = nested.entity('nested');
		nested.set({ nested: { foo: 'bar' } })
		expect(deepNested.get('foo')).to.be.equal('bar');
		expect(nested.get('nested')).to.be.an('object').and.have.property('foo', 'bar');
		expect(test.get('nested')).to.be.an('object').and.have.property('nested').and.have.property('foo', 'bar');
	});
});
describe('when having circular dependency', function(){
	
	const Agent = BaseModel.extend({
		nestedEntities:{
			tasks: Tasks
		}
	});
	const SAgent = store(Agent);

	const Task = BaseModel.extend({
		nestedEntities:{
			agent: SAgent
		}
	});
	const STask = store(Task);
	const Tasks = Collection.extend({
		model: STask
	});

	it('should not fall', () => {
		let task = new STask({ id: 10 })
		task.entity('agent');
		let agent = new SAgent({ id: 1 });
		let tasks = agent.entity('tasks');
		agent.set({ tasks:[ { id: 10, name: 'xxx', agent:{ id: 1, name:'yyy' }} ] });
		console.log(JSON.stringify(agent.toJSON()));
		console.log(JSON.stringify(tasks.toJSON()));
	});
});
