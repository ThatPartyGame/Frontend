var controller;
var signal;

async function loadPage(page) {
	if (controller != null) {
		controller.abort();
	}
	controller = new AbortController();
	signal = controller.signal;
	fetch(page, { signal })
		.then(response => response.text())
		.then(text => {
			$("#content").html(text); //load content into main div
			if (player != null) {
				player.prepend_and_send(Magic.SetPage, encode_text(page));
			}
			controller = null;
		})
		.catch(error => console.warn(error));
}