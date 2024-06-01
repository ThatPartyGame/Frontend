import { CustomElement, css, html } from "/modules/Element.js";

export default class Button extends CustomElement {
	static properties = {
		text: { type: String },
		keyboard_inputs: { type: Array },
		disabled: { type: Boolean, reflect: true },
		pressed: { type: Boolean, state: true, attribute: false }
	}

	static styles = css`
		div {
			background-color: white;
			text-align: center;
			margin: 8px;
			border: 1px solid black;
			border-radius: 8px;
			user-select: none;
			padding: 12px;
		}

		div:hover {
			cursor: pointer;
			transform: translate(0, -0.5px);
			filter: brightness(90%);
		}

		div[pressed] {
			box-shadow: rgba(0, 0, 0, .06) 0 2px 4px;
			filter: brightness(85%);
		}

	`;

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener("keydown", (e) => {
			if (e.repeat) { return }
			if (this.disabled) { return }

			if (this.keyboard_inputs == null) { return }
			for (const allowed_inputs of this.keyboard_inputs) {
				if (allowed_inputs.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.pressed = true;
				this.sendEvent("down");
				return;
			}
		});
		window.addEventListener("keyup", (e) => {
			if (e.repeat) { return }
			if (this.disabled) { return }

			if (this.keyboard_inputs == null) { return }
			for (const allowed_inputs of this.keyboard_inputs) {
				if (allowed_inputs.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.pressed = false;
				this.sendEvent("up");
				this.sendEvent("pressed");
				return;
			}
		});
	}

	_mouseUp(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.disabled) { return }

		this.pressed = false;
		this.sendEvent("up")
		this.sendEvent("pressed");
	}

	_mouseDown(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.disabled) { return }

		this.pressed = true;
		this.sendEvent("down")
	}

	_touchStart(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.disabled) { return }

		this.pressed = true;
		this.sendEvent("down");
	}

	_touchEnd(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.disabled) { return }

		this.pressed = false;
		this.sendEvent("up");
		this.sendEvent("pressed");
	}

	render() {
		return html`<div 
			@mousedown="${this._mouseDown}" 
			@mouseup="${this._mouseUp}" 
			@touchstart="${this._touchStart}" 
			@touchend="${this._touchEnd}" 
			@touchcancel="${this._touchEnd}"

			?disabled=${this.disabled}
			?pressed=${this.pressed}
		>
		${this.text}
		</div>`;
	}
}

customElements.define('v1-button', Button);