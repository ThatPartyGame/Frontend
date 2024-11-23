import { LitElement, css, html, classMap, styleMap } from "/modules/lit-all.min.js"

class CustomElement extends LitElement {
	static elements = {};

	static createFromData(data) {
		window.logText(data)

		var elem = document.createElement(data.tag);
		elem.init(crypto.randomUUID(), data.properties, data.style); // TODO: Replace with actual unique_id
		// elem.unique_id = data.unique_id;
		// elem.sendEvent = (event, data = {}) => {
		// 	this.prepend_and_send(Magic.LOCAL_EVENT, Connection.text_encoder.encode(JSON.stringify({
		// 		unique_id: elem.unique_id,
		// 		event: event,
		// 		data: data,
		// 	})));
		// };
		// elem.sendGlobalEvent = (event, data = {}) => {
		// 	this.prepend_and_send(Magic.EVENT, Connection.text_encoder.encode(JSON.stringify({
		// 		event: event,
		// 		data: data,
		// 	})));
		// };
		// elem.sendBytes = (data = new Uint8Array(0)) => {
		// 	var unique_id = Connection.text_encoder.encode(elem.unique_id);
		// 	var packet = new ArrayBuffer(4 + unique_id.byteLength + data.byteLength);
		// 	var dataView = new DataView(packet);
		// 	dataView.setInt32(0, unique_id.byteLength, true);
		// 	new Uint8Array(packet).set(new Uint8Array(unique_id), 4);
		// 	new Uint8Array(packet).set(new Uint8Array(data), 4 + unique_id.byteLength);
		// 	this.prepend_and_send(Magic.LOCAL_BYTES, packet);
		// };
		// elem.sendGlobalBytes = (data = new Uint8Array(0)) => {
		// 	this.prepend_and_send(Magic.BYTES, data);
		// };
		// window.logText(data);

		if (data.children) {
			for (const child of data.children) {
				// elem.appendChild(CustomElement.createFromData(child));
				elem.insertAdjacentElement('beforeend', CustomElement.createFromData(child));
			}
		}

		return elem;
	}

	init(unique_id, properties = null, style = null) {
		if (typeof unique_id !== 'string') {
			let error = "Custom element unique_id must be a string, type provided : " + typeof unique_id;
			// window.logText(error);
			// console.error(error);
		}

		this.unique_id = unique_id;

		if (properties && typeof properties === 'object') {
			for (const [attribute, value] of Object.entries(properties)) {
				this.setAttribute(attribute, value);
			}
		}

		if (style) {
			this.updateStyle(style);
		}

		CustomElement.elements[unique_id] = this;
	}

	unique_id = "";

	connectedCallback() {
		super.connectedCallback();
		this.style.position = "relative";
		this.style.top = "0";
		this.style.left = "0";
		this.style.display = "block";
		// this.style.backgroundColor = "blue";
		// this.style.width = "100px";
		// this.style.height = "100px";
	}

	updateStyle(newStyle) {
		for (let key in newStyle) {
			// Skip if the property is from prototype.
			if (!newStyle.hasOwnProperty(key)) continue;

			// TODO: Check default style list for limits and unchangeable defaults



			// Skip if update has been overriden.
			if (this.overrideStyleUpdate(key, newStyle[key])) continue;
			window.logText(key);
			switch (key) {
				case "background_color":
					var value = "#" + newStyle[key];
					this.style.backgroundColor = value;
					this.style.setProperty("--bg-color", value);
					break;
				case "color":
					this.style.color = newStyle[key];
					this.style.setProperty("--color", value);
					break;
				case "position":

					break;
				case "size":
					let x = (newStyle[key][0].toString()) + "px";
					let y = (newStyle[key][1].toString()) + "px";
					this.style.width = x;
					this.style.setProperty("--width", x);
					this.style.height = y;
					this.style.setProperty("--height", y);
					break;
			}
		}
		return;
	}

	overrideStyleUpdate(style, value) {
		return false;
	}

	setAttribute(attribute, value) {
		if (value == null) {
			this[attribute] = null;
			return;
		}

		this[attribute] = value;
	}

	sendEvent(ev, data = {}) { }
	sendGlobalEvent(ev, data = {}) { }
	sendBytes(data = new Uint8Array(0)) { }
	sendGlobalBytes(data = new Uint8Array(0)) { }
	dataRequested() {
		return {}
	}
}


export { CustomElement, css, html, classMap, styleMap };