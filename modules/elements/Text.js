import { CustomElement, css, html } from "/modules/Element.js";

export default class Text extends CustomElement {
	static properties = {
		text: { type: String },
	}

	connectedCallback() {
		super.connectedCallback();
		this.sendEvent("test", { data: "awesome_data" });
	}

	render() {
		return html`<p>${this.text}</p>`;
	}
}

customElements.define('v1-text', Text);