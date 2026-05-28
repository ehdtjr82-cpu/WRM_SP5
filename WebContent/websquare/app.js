(function() {
	var promiseObj = null;
	
	if ((typeof movePage === "undefined") || (movePage === "")) {
		promiseObj = WebSquare.startApplication();
	} else {
		promiseObj = WebSquare.startApplication(WebSquareExternal.w2xPath);
	}
	
	promiseObj.then(function(resolve, reject) {
		com.win.setLangCode($p, com.win.getLanguage($p));
	});
})();