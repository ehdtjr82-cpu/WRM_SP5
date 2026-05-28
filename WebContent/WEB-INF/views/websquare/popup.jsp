<%@page contentType="text/html; charset=utf-8" language="java"%>
<!DOCTYPE html>
<html lang="ko">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
		<title>WRM</title>
		<script type="text/javascript">
			var contextPath = "${pageContext.request.contextPath}";
			var movePage = "<%= (String)request.getAttribute("movePage") %>";
			
			var WebSquareExternal = {
				"baseURI": contextPath + "/websquare/", 
				"w2xPath" : movePage, 
			};
		</script>
 		<script type="text/javascript" src="${pageContext.request.contextPath}/websquare/_websquare_/javascriptLoader.wq"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/websquare/popup.js"></script>
	</head>
	<body>
	</body>
</html>