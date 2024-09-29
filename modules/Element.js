import { LitElement, css, html, classMap, styleMap } from "/modules/lit-all.min.js"

class CustomElement extends LitElement {
	unique_id = ""

	connectedCallback() {
		super.connectedCallback();
		this.style.position = "relative";
		this.style.display = "inline-block";
		// this.style.backgroundColor = "blue";
	}

	updateStyle(newStyle) {
		for (let key in newStyle) {
			// Skip if the property is from prototype.
			if (!newStyle.hasOwnProperty(key)) continue;

			// TODO: Check default style list for limits and unchangeable defaults



			// Skip if update has been overriden.
			if (this.overrideStyleUpdate(key, newStyle[key])) continue;

			switch (key) {
				case "bg-color":
					var value = "rgba(" + (255 * newStyle[key][0]) + "," + (255 * newStyle[key][1]) + "," + (255 * newStyle[key][2]) + "," + 0.5 + ")";
					this.style.backgroundColor = value;
					this.style.setProperty("--bg-color", value);
					break;
				case "color":
					this.style.color = newStyle[key];
					this.style.setProperty("--color", value);
					break;
				case "height":
					this.style.height = newStyle[key];
					this.style.setProperty("--width", value);
					break;
			}
		}
		return;
	}

	overrideStyleUpdate(style, value) {
		return false;
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