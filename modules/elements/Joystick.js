import { CustomElement, css, html, classMap, styleMap } from "/modules/Element.js";

export default class Joystick extends CustomElement {
	static properties = {
		keyboard_inputs: { type: Object },

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
	mouseValue = { x: 0.0, y: 0.0 };
	value = { x: 0.0, y: 0.0 };

	up = false;
	left = false;
	down = false;
	right = false;

	constructor() {
		super();
		this.keyboard_inputs = {
			up: ["w", "ArrowUp"],
			left: ["a", "ArrowLeft"],
			down: ["s", "ArrowDown"],
			right: ["d", "ArrowRight"]
		};

		this.reset();

		this.addEventListener('touchstart', this.touchStart);
		this.addEventListener('touchmove', this.touchMove);
		this.addEventListener('touchend', this.touchEnd);
		this.addEventListener('touchcancel', this.touchEnd);

		this.addEventListener('mousedown', this.mouseDown);
		this.addEventListener('mousemove', this.mouseMove);
		window.addEventListener('mouseup', this.mouseUp.bind(this));

		window.addEventListener("keydown", (e) => {
			if (e.repeat) { return }
			if (this.disabled) { return }
			if (this.keyboard_inputs == null) { return }

			for (const key of this.keyboard_inputs.up) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.up = true;
				break;
			}
			for (const key of this.keyboard_inputs.left) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.left = true;
				break;
			}
			for (const key of this.keyboard_inputs.down) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.down = true;
				break;
			}
			for (const key of this.keyboard_inputs.right) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.right = true;
				break;
			}

			this.checkStart();
			this.joystickUpdate();
		});
		window.addEventListener("keyup", (e) => {
			if (e.repeat) { return }
			if (this.disabled) { return }
			if (this.keyboard_inputs == null) { return }

			for (const key of this.keyboard_inputs.up) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.up = false;
				break;
			}
			for (const key of this.keyboard_inputs.left) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.left = false;
				break;
			}
			for (const key of this.keyboard_inputs.down) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.down = false;
				break;
			}
			for (const key of this.keyboard_inputs.right) {
				if (key.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.right = false;
				break;
			}

			this.joystickUpdate();
		});
	}

	dataRequested() {
		return value
	}

	reset() {
		this.outer_ring_classes = { disabled: true };
		this.outer_ring_style = { left: "50%", top: "50%" };

		this.inner_circle_classes = {};
		this.inner_circle_style = { left: "50%", top: "50%" };

		this.startLocation = null;
	}

	checkStart() {
		if ((this.up || this.left || this.down || this.right) || this.startLocation != null) {
			this.outer_ring_classes = { disabled: false };
		}
	}

	joystickUpdate() {
		var x = 0.0;
		var y = 0.0;
		if (this.up || this.left || this.down || this.right) {
			if (this.up) y += -1.0;
			if (this.left) x += -1.0;
			if (this.down) y += 1.0;
			if (this.right) x += 1.0;

			var magnitude = Math.sqrt((x * x) + (y * y));
			if (magnitude >= 1.0) {
				x = x / magnitude;
				y = y / magnitude;
			} else {
				x = x;
				y = y;
			}
		} else if (this.startLocation != null && this.mouseValue != null) {
			x = this.mouseValue.x;
			y = this.mouseValue.y;
		} else {
			this.reset();
		}

		x = Number(x.toFixed(2));
		y = Number(y.toFixed(2));

		if (this.value.x == x && this.value.y == y) {
			return;
		}

		this.value = {
			x: x,
			y: y,
		};

		this.inner_circle_style = { left: ((this.value.x + 1) / 2 * 100) + "%", top: ((this.value.y + 1) / 2 * 100) + "%" };

	}

	start(clientX, clientY) {
		if (this.up || this.left || this.down || this.right) {
			return;
		}

		this.startLocation = { clientX: clientX, clientY: clientY }
		this.outer_ring_style = { left: this.startLocation.clientX + "px", top: this.startLocation.clientY + "px" };
		this.checkStart();
		this.joystickUpdate();
	}

	move(clientX, clientY) {
		var x = (clientX - this.startLocation.clientX) / 75;
		var y = ((clientY - this.startLocation.clientY)) / 75;

		var magnitude = Math.sqrt((x * x) + (y * y));
		if (magnitude < 1) {
			magnitude = 1;
		}

		this.mouseValue = {
			x: x / magnitude,
			y: y / magnitude,
		};

		this.joystickUpdate();
	}

	end() {
		if (this.startLocation == null) {
			return;
		}
		this.mouseValue = { x: 0.0, y: 0.0 };
		this.startLocation = null
		this.outer_ring_style = { left: "50%", top: "50%" };
		this.inner_circle_style = { left: "50%", top: "50%" };
		this.joystickUpdate();
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

		this.start(e.clientX, e.clientY);
	}

	mouseMove(e) {
		if (this.startLocation == null) {
			return;
		}
		this.move(e.clientX, e.clientY);

	}

	mouseUp(e) {
		if (e.which != 1) {
			return;
		}
		this.end();
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