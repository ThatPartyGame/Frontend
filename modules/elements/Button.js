import { CustomElement, css, html } from "/modules/Element.js";

export default class Button extends CustomElement {
	static properties = {
		text: { type: String },
		keyboard_inputs: { type: String },
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener("keydown", (e) => {
			if (e.repeat) { return }
			if (this.keyboard_inputs == null) { return }
			for (const allowed_inputs of this.keyboard_inputs.split(",")) {
				if (allowed_inputs.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.sendEvent("down");
				return;
			}
		});
		window.addEventListener("keyup", (e) => {
			if (e.repeat) { return }
			if (this.keyboard_inputs == null) { return }
			for (const allowed_inputs of this.keyboard_inputs.split(",")) {
				if (allowed_inputs.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				this.sendEvent("released");
				return;
			}
		});
		window.addEventListener("keypress", (e) => {
			if (e.repeat) { return }
			if (this.keyboard_inputs == null) { return }
			for (const allowed_inputs of this.keyboard_inputs.split(",")) {
				if (allowed_inputs.toLowerCase() != e.key.toLowerCase()) {
					continue;
				}
				// this.sendEvent("pressed");
				return;
			}
		});

	}

	_handleClick(_) {
		this.sendEvent("pressed");
	}

	_mouseUp(_) {
		this.sendEvent("released")
	}

	_mouseDown(_) {
		this.sendEvent("down")
	}

	render() {
		return html`<button @click="${this._handleClick}" @mousedown="${this._mouseDown}" @mouseup="${this._mouseUp}">${this.text}</button>`;
	}
}

customElements.define('v1-button', Button);