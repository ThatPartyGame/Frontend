import { CustomElement, css, html } from "/modules/Element.js";

export default class Text extends CustomElement {
	static properties = {
		text: { type: String },
	}

	static styles = css`
		div {
			background-color: var(--bg-color);
			width: 100%;
			height: 100%;
			margin: 0;
			padding: 0;
		}
	`;

	constructor() {
		super();
		// console.log(Text.styles);
	}

	render() {
		return html`<div>${this.text}<slot></slot></div>`;
	}
}

customElements.define('v1-test', Text);