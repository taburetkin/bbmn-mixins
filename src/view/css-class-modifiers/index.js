import { betterResult } from 'bbmn-utils';
import _ from 'underscore';

const defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true,
};

export default (Base) => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		this._setupCssClassModifiers();		
	},
	_initCssClassModifiers(){
		if (this.hasOwnProperty('cssClassModifiers')) { return; }
		let modifiers = [];
		let optsModifiers = betterResult(this.options || {}, 'cssClassModifiers', { args:[this.model, this], default: [] });
		let propsModifiers = betterResult(this, 'cssClassModifiers', { args:[this.model, this], default: [] });
		modifiers.push(...optsModifiers);
		modifiers.push(...propsModifiers);
		this.cssClassModifiers = modifiers;
	},
	addCssClassModifier(...modifiers){
		this._initCssClassModifiers();
		this.cssClassModifiers.push(...modifiers);
	},
	refreshCssClass(){
		let className = this._getCssClassString();
		if(className == ''){
			this.$el.removeAttr('class');
		}
		else {
			this.$el.attr({
				class: className
			});
		}
	},	

	_getCssClassModifiers(){
		this._initCssClassModifiers();
		let className = betterResult(this, 'className', { args:[this.model, this], default: [] });
		let modifiers = this.cssClassModifiers.concat([className]);
		return modifiers;
	},
	//override this if you need other logic
	getCssClassModifiers(){
		return this._getCssClassModifiers();
	},
	_getCssClassString()
	{
		let modifiers = this.getCssClassModifiers();
		
		let classes = _(modifiers).reduce((hash, modifier) => {
			if(modifier == null || modifier === '') { return hash; }
			let cls;
			if (_.isString(modifier)) {
				cls = modifier;
			} else if (_.isFunction(modifier)) {
				let builded = modifier.call(this, this.model, this);
				cls = _.isString(builded) && builded || undefined;
			}
			cls && (hash[cls] = true);
			return hash;
		}, {});

		return _.keys(classes).join(' ');

	},

	_setupCssClassModifiers(){

		if(this._cssClassModifiersInitialized) return;

		let cfg = this.getCssClassConfig();
		if(!cfg) return;

		let events = this.getCssClassEvents(cfg);
		_(events).each((eventName) => this.on(eventName, this.refreshCssClass));

		if (cfg.modelChange && this.model) {
			this.listenTo(this.model, 'change', this.refreshCssClass);
		}

		this._cssClassModifiersInitialized = true;
	},
	
	_getCssClassConfig(){
		let cfg = _.extend({}, defaultCssConfig, this.getOption('cssClassConfig'));
		if(!cfg || _.size(cfg) == 0) return;
		return cfg;
	},
	//override this if you need other logic
	getCssClassConfig(){
		return this._getCssClassConfig();
	},

	_getCssClassEvents(cfg){
		let events = [].concat(cfg.events || []);
		if(cfg.refresh) events.push('refresh');
		if(cfg.beforeRender) events.push('before:render');
		events = _(events).uniq();
		return events;
	},
	//override this if you need other logic
	getCssClassEvents(cfg){
		return this._getCssClassEvents(cfg);
	}
}, { CssClassModifiersMixin: true });
