import { CustomElement, css, html } from "/modules/Element.js";

export default class Joystick extends CustomElement {
	static properties = {
		text: { type: String },
	}

	connectedCallback() {
		super.connectedCallback();
	}

	render() {
		return html`<p>${this.text}</p>`;
	}
}

customElements.define('v1-joystick', Joystick);