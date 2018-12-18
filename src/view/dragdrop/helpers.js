import $ from 'jquery';
import _ from 'underscore';

let shouldPreventMove = false;
let fakeListener = false;

export const preventCallback = event => {
	if (shouldPreventMove) {
		event.preventDefault();
	}
};

// for canceling click after drag back to the clicked el
function cancelMouseClick(e) {
	e.stopPropagation(); // Stop the click from being propagated.
	window.removeEventListener('click', cancelMouseClick, true); // cleanup
}

// for preventing touchmove after hold
export function setupTouchMovePrevent()
{
	if (fakeListener) return;

	document.addEventListener('touchmove', preventCallback, { passive: false });

	fakeListener = true;

}

let baseManipulatorEnter = (event, initialEl) => {

	let touches = !!event.touches;
	let target = event.target;
	if (touches) {
		let touch = event.touches[0];
		target = document.elementFromPoint(touch.pageX, touch.pageY);
	}
	if (initialEl == target || initialEl.contains(target)) return;

	$(target).trigger('manipulator:enter');
};

export function delayedTouchstart(touchstart, delay = 400) {
	return function (event) {
		
		

		if (event.touches.length !== 1) { return; }

		let el = event.target;


		var heldItem = function () {

			el.removeEventListener('touchend', onReleasedItem);
			el.removeEventListener('touchmove', onReleasedItem);


			// preventing defalut touchmove
			// using fakeListener from setupTouchMovePrevent
			// and reverting value back after touch end
			shouldPreventMove = true;
			let returnPreventMoveValue = () => {
				el.removeEventListener('touchend', returnPreventMoveValue);	
				shouldPreventMove = false;
			};


			el.addEventListener('touchend', returnPreventMoveValue);

			touchstart(event);

		};

		var onReleasedItem = function () {
			el.removeEventListener('touchend', onReleasedItem);
			el.removeEventListener('touchmove', onReleasedItem);
			clearTimeout(timer);
		};

		var timer = setTimeout(heldItem, delay);
		el.addEventListener('touchend', onReleasedItem);
		el.addEventListener('touchmove', onReleasedItem);
	};
}


export function setupManipulatorEnter({ $el, onManipulatorEnter, onStart, onEnd, disableTouchScroll, selector, preventStart } = {}) {

	if (!fakeListener) {
		document.addEventListener('touchmove', preventCallback, { passive: false });
		fakeListener = true;
	}

	let el = $el.get(0);
	let manipulatorEnter = _.partial(baseManipulatorEnter, _, el);
	let $doc = $(document);
	let isOnStart = _.isFunction(onStart);
	let isOnEnd = _.isFunction(onEnd);
	let isDisableTouchScroll = _.isFunction(disableTouchScroll);
	let isPreventStart = _.isFunction(preventStart);

	let touchStart = () => {

		isOnStart && onStart();
		isDisableTouchScroll && disableTouchScroll();
		
		let touchEnd = () => {
			document.removeEventListener('touchmove', manipulatorEnter);
			document.removeEventListener('touchend', touchEnd);
			isOnEnd && onEnd();
		};

		document.addEventListener('touchmove', manipulatorEnter, { passive: false });
		document.addEventListener('touchend', touchEnd, { passive: false });

	};

	el.addEventListener('touchstart', delayedTouchstart(touchStart), { passive: false });
	
	$el.on('mousedown', selector, (original) => {
		if(isPreventStart && preventStart()){
			original.preventDefault();
			return;
		}

		let stopHandlers = (event) => {
			original.preventDefault();
			event.preventDefault();
			$doc.off('mouseenter', '*', manipulatorEnter);
			$el.off('mousemove', mouseStart);
			isOnEnd && onEnd();
			return false;
		};

		let mouseStart = () => {
			$el.one('mouseup', () => { 
				window.addEventListener('click', cancelMouseClick, true );
			});
			onStart && onStart();
			$doc.on('mouseenter', '*', manipulatorEnter);
		};
		$doc.one('mouseup', stopHandlers);
		$el.one('mousemove', mouseStart);
	});
	$el.on('manipulator:enter', onManipulatorEnter);
}
