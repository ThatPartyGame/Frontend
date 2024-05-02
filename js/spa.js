function loadPage(page) {
	$.get(page, function (pageContent) {//return selected page content trough ajax.
		$("#content").html(pageContent);//load content into main div
	});
}