import { CustomElement, css, html } from "/modules/Element.js";

export default class Text extends CustomElement {
	static properties = {
		text: { type: String },
	}

	static styles = css`
		p {
			/* background-color: var(--bg-color); */
			position: relative;
			width: fit-content;
			margin: 0;
			padding: 0;
		}
	`;

	constructor() {
		super();
		// console.log(Text.styles);
	}

	render() {
		return html`<p>${this.text}</p>`;
	}
}

customElements.define('v1-test', Text);