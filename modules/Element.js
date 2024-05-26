import { LitElement as CustomElement, css, html } from "/modules/lit-core.min.js"

let customElementMixin = {
	unique_id: String,
	sendEvent: function (event, data = {}) {},
	sendGlobalEvent: function (event, data = {}) {},
	sendBytes: function (data = new Uint8Array(0)) {},
	sendGlobalBytes: function (data = new Uint8Array(0)) {},
	dataRequested: function () {
		return {}
	}
};

Object.assign(CustomElement.prototype, customElementMixin);

export { CustomElement, css, html };
