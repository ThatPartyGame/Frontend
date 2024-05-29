import { CustomElement, css, html, classMap, styleMap } from "/modules/Element.js";
import { clamp } from "/modules/Common.js";

export default class Joystick extends CustomElement {
	static properties = {
		outer_ring_classes: { state: true },
		outer_ring_style: { state: true },
		inner_circle_classes: { state: true },
		inner_circle_style: { state: true },
	}

	static styles = css`
		#outer-ring {
			position: relative;
			width: 150px;
			height: 150px;
			border-radius: 50%;
			transform: translate(-75px, -75px);
			border: 2px solid black;
		}
	
		#inner-circle {
			position: relative;
			width: 90px;
			height: 90px;
			border-radius: 50%;
			transform: translate(-45px, -45px);


			background-color: white;
			-webkit-box-shadow: inset 0px 0px 40px 1px rgba(0,0,0,0.75);
			-moz-box-shadow: inset 0px 0px 40px 1px rgba(0,0,0,0.75);
			box-shadow: inset 0px 0px 40px 1px rgba(0,0,0,0.75);
			border: 1px solid black;
		}

		.disabled {
			filter: opacity(30%);
		}
	`;

	startLocation = {};
	value = { x: 0.0, y: 0.0 };

	constructor() {
		super();
		this.reset();

		this.addEventListener('touchstart', this.touchStart);
		this.addEventListener('touchmove', this.touchMove);
		this.addEventListener('touchend', this.touchEnd);
		this.addEventListener('touchcancel', this.touchEnd);
	}

	dataRequested() {
		return value
	}

	reset() {
		this.outer_ring_classes = { disabled: true };
		this.outer_ring_style = { left: "50%", top: "50%" };

		this.inner_circle_classes = {};
		this.inner_circle_style = { left: "50%", top: "50%" };

		this.startLocation = {};
	}

	touchStart(e) {
		e.preventDefault();
		e.stopPropagation();

		this.outer_ring_classes = { disabled: false };
		this.startLocation = { clientX: e.targetTouches[0].clientX, clientY: e.targetTouches[0].clientY }
		this.outer_ring_style = { left: this.startLocation.clientX + "px", top: this.startLocation.clientY + "px" };
	}

	touchMove(e) {
		e.preventDefault();
		e.stopPropagation();

		var x = clamp((e.targetTouches[0].clientX - this.startLocation.clientX) / 75, -1.0, 1.0);
		var y = clamp(((e.targetTouches[0].clientY - this.startLocation.clientY)) / 75, -1.0, 1.0);

		var magnitude = 1.0;
		if (Math.abs(x) + Math.abs(y) > 1.1) {
			magnitude = Math.sqrt((x * x) + (y * y));

		}

		this.value = {
			x: x / magnitude,
			y: y / magnitude,
		};

		console.log(this.value);
		this.inner_circle_style = { left: ((this.value.x + 1) / 2 * 100) + "%", top: ((this.value.y + 1) / 2 * 100) + "%" };
		// console.log(this.inner_circle_style);
	}

	touchEnd(e) {
		e.preventDefault();
		e.stopPropagation();

		this.reset();
	}

	connectedCallback() {
		super.connectedCallback();
	}

	render() {
		return html`
		<div id="outer-ring" class=${classMap(this.outer_ring_classes)} style=${styleMap(this.outer_ring_style)}>
			<div id="inner-circle" class=${classMap(this.inner_circle_classes)} style=${styleMap(this.inner_circle_style)}>

			</div>
		</div>
		`;
	}
}

customElements.define('v1-joystick', Joystick);