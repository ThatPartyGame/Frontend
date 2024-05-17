async function loadPage(page) {
	await $.get(page, (pageContent) => {//return selected page content trough ajax.
		$("#content").html(pageContent);//load content into main div
	});
	player.prepend_and_send(Magic.SetPage, encode_text(page));
}