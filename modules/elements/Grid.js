import { CustomElement, css, html } from "/modules/Element.js";

export default class Grid extends CustomElement {
	static properties = {
		rows: { type: Number },
		columns: { type: Number },
		style: { type: Array, state: true }
	}

	static styles = css`
		:host, slot {
			display: block;
			position: relative;
			width: 100%;
			height: 100%;
			padding: 0px;
			margin: 0px;
		}

		slot {
			display: grid;
		}
	`;

	constructor() {
		super();
		this.style = [];
	}

	connectectedCallback() {
		super.connectectedCallback();
	}

	handleSlotchange(e) {
		this.style = [];
		const childNodes = e.target.assignedElements();
		var i = 0;
		for (const child of childNodes) {
			i += 1;
			var property = child["grid_child"];
			if (property == null) {
				property = child.getAttribute("grid_child");
			}

			if (property == null) {
				continue;
			}

			var values = property.split(" ");
			if (values == null || values.length < 4) {
				continue;
			}
			this.style.push("::slotted(:nth-child(" + i + ")) {grid-area: " + values[0] + " / " + values[2] + " / " + values[1] + " / " + values[3] + "; }");
		}

		this.requestUpdate();
	}

	render() {

		var style = "<style> \n";
		for (const styleLine of this.style) {
			style += styleLine;
		}
		style += "</style>";

		var horizontal_percent = 100 / this.rows;
		var vertical_percent = 100 / this.columns;

		var horizontal_style = "";
		var vertical_style = "";

		for (var i = 0; i < this.rows; i++) {
			horizontal_style += "" + horizontal_percent + "% ";
		}

		for (var i = 0; i < this.columns; i++) {
			vertical_style += "" + vertical_percent + "% ";
		}

		return html`
			<style>
				${this.style}
			</style>

			<slot @slotchange=${this.handleSlotchange}
				style="grid-template-columns: ${vertical_style}; grid-template-rows: ${horizontal_style};"
			></slot>
			`;
	}
}

customElements.define('v1-grid', Grid);