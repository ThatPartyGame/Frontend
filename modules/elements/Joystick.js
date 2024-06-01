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

	mouseIsDown = false;

	constructor() {
		super();
		this.reset();

		this.addEventListener('touchstart', this.touchStart);
		this.addEventListener('touchmove', this.touchMove);
		this.addEventListener('touchend', this.touchEnd);
		this.addEventListener('touchcancel', this.touchEnd);

		this.addEventListener('mousedown', this.mouseDown);
		this.addEventListener('mousemove', this.mouseMove);
		window.addEventListener('mouseup', this.mouseUp.bind(this));
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

	start(clientX, clientY) {
		this.outer_ring_classes = { disabled: false };
		this.startLocation = { clientX: clientX, clientY: clientY }
		this.outer_ring_style = { left: this.startLocation.clientX + "px", top: this.startLocation.clientY + "px" };
	}

	move(clientX, clientY) {
		var x = (clientX - this.startLocation.clientX) / 75;
		var y = ((clientY - this.startLocation.clientY)) / 75;

		var magnitude = Math.sqrt((x * x) + (y * y));
		if (magnitude <= 1) {
			magnitude = 1;
		}

		this.value = {
			x: (x / magnitude).toFixed(3),
			y: (-(y / magnitude)).toFixed(3),
		};

		this.inner_circle_style = { left: ((parseFloat(this.value.x) + 1) / 2 * 100) + "%", top: ((-parseFloat(this.value.y) + 1) / 2 * 100) + "%" };
	}

	end() {
		this.reset();
	}

	touchStart(e) {
		e.preventDefault();
		e.stopPropagation();
		this.start(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
	}

	touchMove(e) {
		e.preventDefault();
		e.stopPropagation();
		this.move(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
	}

	touchEnd(e) {
		e.preventDefault();
		e.stopPropagation();
		this.end();
	}

	mouseDown(e) {
		if (e.which != 1) {
			return;
		}
		this.mouseIsDown = true;
		this.start(e.clientX, e.clientY);
	}

	mouseMove(e) {
		if (!this.mouseIsDown) {
			return;
		}
		this.move(e.clientX, e.clientY);

	}

	mouseUp(e) {
		if (e.which != 1) {
			return;
		}
		this.mouseIsDown = false;
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