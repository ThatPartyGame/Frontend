import $ from "/modules/jquery.js"

export var text_encoder = new TextEncoder();
export var text_decoder = new TextDecoder("utf-8");


var controller;
var signal;

export function loadPage(page) {
	if (controller != null) {
		controller.abort();
	}

	controller = new AbortController();
	signal = controller.signal;
	fetch(page, { signal })
		.then(response => response.text())
		.then(text => {
			controller = null;
			setPage(text);
		})
		.catch(error => console.warn(error));
}

export function setPage(html) {
	if (controller != null) {
		controller.abort();
	}
	$("#content").empty();
	$("#content").html(html);
}

export function awaitEvent(obj, event) {
	return new Promise(resolve => obj.addEventListener(event, (e) => resolve(e)));
}

export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

export function with_magic(magic, msg) {
	if (magic > 127 || magic < -127) {
		console.error("Cannot set magic outside of int8 range");
		return;
	}

	var out_buffer = new ArrayBuffer(msg.byteLength + 1);
	var data_view = new DataView(out_buffer);
	data_view.setInt8(0, magic);
	new Int8Array(out_buffer).set(new Int8Array(msg), 1);

	return out_buffer;
}

export async function get_magic(data) {
	var buffer = data;
	if (data.arrayBuffer != null) {
		buffer = await data.arrayBuffer();
	}
	var data_view = new DataView(buffer);
	return data_view.getInt8(0);
}

export async function get_data(data) {
	var buffer = data;
	if (data.arrayBuffer != null) {
		buffer = await data.arrayBuffer();
	}
	var slice = (buffer).slice(1);
	return slice;
}

export async function get_string(data) {
	var slice = await get_data(data);
	return text_decoder.decode(slice);
}

export function await_event(obj, event) {
	return new Promise(resolve => obj.addEventListener(event, (e) => resolve(e)));
}

export function getAllUrlParams(url) {

	// get query string from url (optional) or window
	var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

	// we'll store the parameters here
	var obj = {};

	// if query string exists
	if (queryString) {

		// stuff after # is not part of query string, so get rid of it
		queryString = queryString.split('#')[0];

		// split our query string into its component parts
		var arr = queryString.split('&');

		for (var i = 0; i < arr.length; i++) {
			// separate the keys and the values
			var a = arr[i].split('=');

			// set parameter name and value (use 'true' if empty)
			var paramName = a[0];
			var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

			// (optional) keep case consistent
			paramName = paramName.toLowerCase();
			if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

			// if the paramName ends with square brackets, e.g. colors[] or colors[2]
			if (paramName.match(/\[(\d+)?\]$/)) {

				// create key if it doesn't exist
				var key = paramName.replace(/\[(\d+)?\]/, '');
				if (!obj[key]) obj[key] = [];

				// if it's an indexed array e.g. colors[2]
				if (paramName.match(/\[\d+\]$/)) {
					// get the index value and add the entry at the appropriate position
					var index = /\[(\d+)\]/.exec(paramName)[1];
					obj[key][index] = paramValue;
				} else {
					// otherwise add the value to the end of the array
					obj[key].push(paramValue);
				}
			} else {
				// we're dealing with a string
				if (!obj[paramName]) {
					// if it doesn't exist, create property
					obj[paramName] = paramValue;
				} else if (obj[paramName] && typeof obj[paramName] === 'string') {
					// if property does exist and it's a string, convert it to an array
					obj[paramName] = [obj[paramName]];
					obj[paramName].push(paramValue);
				} else {
					// otherwise add the property
					obj[paramName].push(paramValue);
				}
			}
		}
	}

	return obj;
}
