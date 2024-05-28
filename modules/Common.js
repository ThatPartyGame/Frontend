import $ from "/modules/jquery.js"

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

// export function setPage()

export function awaitEvent(obj, event) {
	return new Promise(resolve => obj.addEventListener(event, (e) => resolve(e)));
}