<%@ page contentType="text/xml; charset=UTF-8" language="java" errorPage="" import="java.io.*,java.math.*,java.net.*,java.security.*,java.text.*,java.util.*,java.util.zip.*,javax.servlet.http.*,org.w3c.dom.*,websquare.i18n.*,websquare.logging.*,websquare.util.*,websquare.logging.util.LogUtil"
%><%
HTTPContext frameworkContext = null;
try {
	
	frameworkContext = HTTPContext.getContext();
	frameworkContext.setWebInfo(request, response, null, null );
	
	String w2xPath = HttpUtil.getParameter( request, "w2xPath" );
	int iPosition = w2xPath.indexOf("?");
	

	
	if ( iPosition > -1){
		w2xPath = w2xPath.substring(0, w2xPath.indexOf("?"));
	}
	
	if( FileValidUtil.getInstance().isValidFullPath( w2xPath ) ) {  //경로 유효성 검사
		//String result= Web2FileCache.getInstance().getXML(request);
		String result= Web2FileCache.getInstance().getJS(request);
		if ( null != w2xPath && !"".equals(w2xPath) && null != result && !"".equals(result) ) {
			OutputStream os = null;
			try {
				byte[] bytes = result.getBytes("UTF-8");
				MessageDigest md = null;
				try {
					md = MessageDigest.getInstance("SHA");
					byte[] messageDigest = md.digest(bytes);
					StringBuilder sb = new StringBuilder();
					sb.append("\"");

					for(int i=0; i< messageDigest.length ;i++){
					     sb.append(Integer.toString((messageDigest[i] & 0xff) + 0x100, 16).substring(1));
					}

					sb.append("\"");
					String ETAG = sb.toString();
					String previousETAG = request.getHeader("If-None-Match");

					if (previousETAG != null && ETAG != null) {
						if (ETAG.equals(previousETAG)) {
							response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
							return;
						}
					}
					response.setHeader("ETag", sb.toString() );
				} catch (Exception e) {
					LogUtil.exception("[I18N.jsp] MessageDigest Exception.", e);
				}

				boolean compressed = true;
				String ae = request.getHeader("Accept-Encoding");
				if (ae != null && ae.indexOf("gzip") != -1) { // 압축 가능 여부 판단
					compressed = true;
				}

				if (compressed) {
					ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
					OutputStream zipOut = new GZIPOutputStream(byteOut);
					zipOut.write(bytes, 0, bytes.length);
					zipOut.flush();
					zipOut.close();
					byteOut.flush();
					bytes = byteOut.toByteArray();
					response.setHeader("Content-Encoding", "gzip");
				}
		
				SimpleDateFormat formatter = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
				Calendar cal = Calendar.getInstance();
				cal.add(Calendar.YEAR, 1);
				cal.add(Calendar.DATE, -1);
				formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
				String expires = formatter.format(cal.getTime());
				response.setHeader("Expires", expires);
				response.setHeader("Last-Modified", expires);
				response.setHeader("Cache-Control", "public, max-age=31449600");	// 31449600

				response.setContentLength(bytes.length);
				os = response.getOutputStream();
				os.write(bytes,0,bytes.length);
			} catch (Exception e) {
				throw e;
			} finally {
				try {
					os.flush();
				} catch( Exception e ) {
					LogUtil.exception("[I18N.jsp] OutputStream flush Exception.", e);
				}
				try {
					os.close();
				} catch( Exception e ) {
					LogUtil.exception("[I18N.jsp] OutputStream close Exception.", e);
				}
			}
		} else {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
	}
} catch (FileNotFoundException e1) {
	LogUtil.exception("[I18N.jsp] FileNotFoundException Exception.", e1);
} catch (Exception e) {
	LogUtil.exception("[I18N.jsp] Exception.", e);
} finally {
	frameworkContext.setWebInfo(null,null,null,null);
}
%>