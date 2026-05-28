package com.inswave.wrm.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.inswave.wrm.util.UserInfo;

public class SessionCheckInterceptor extends HandlerInterceptorAdapter {

	@Autowired
	private UserInfo userInfo;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
		String loginInfo = null;
		HttpSession session = request.getSession();
		String reqUrl = request.getRequestURI();
		String w2xPath = request.getParameter("w2xPath");
		boolean result = true;

		try {
			loginInfo = (String) session.getAttribute("EMP_CD");

			if (loginInfo != null) {
				userInfo.setUserInfo(session);
			} else {
				if (!isSkipURI(request)) {
					if ((w2xPath != null) || ((reqUrl.indexOf("_wpack_") > -1) && (reqUrl.indexOf(".js") > -1))) {
						// 웹스퀘어 화면 호출 시 세션이 종료된 경우, 로그인 페이지로 Redirect 처리한다.
						result = false;
						response.setContentType("application/javascript");
						response.setCharacterEncoding("UTF-8");
						response.getWriter().write("define({declaration:{A:{version:'1.0',encoding:'UTF-8'}},E:[{T:1,N:'html',A:{xmlns:'http://www.w3.org/1999/xhtml','xmlns:ev':'http://www.w3.org/2001/xml-events','xmlns:w2':'http://www.inswave.com/websquare','xmlns:xf':'http://www.w3.org/2002/xforms'},E:[{T:1,N:'head',E:[{T:1,N:'w2:type',E:[{T:3,text:'COMPONENT'}]},{T:1,N:'w2:buildDate'},{T:1,N:'w2:MSA'},{T:1,N:'xf:model',E:[{T:1,N:'w2:dataCollection',A:{baseNode:'map'}},{T:1,N:'w2:workflowCollection'}]},{T:1,N:'w2:layoutInfo'},{T:1,N:'w2:publicInfo',A:{method:''}},{T:1,N:'script',A:{lazy:'false',type:'text/javascript'},E:[{T:4,cdata:function(scopeObj){with(scopeObj){ ");
						response.getWriter().write("scwin.onpageload = function() { ");
						response.getWriter().write("	com.win.alert($p, 'Session이 종료 되었습니다.\\n로그인 화면으로 이동하겠습니다.', function() { gcm.win.reload(); }, true); ");
						response.getWriter().write("}; ");
						response.getWriter().write("}}}]}]},{T:1,N:'body',A:{'ev:onpageload':'scwin.onpageload'}}]}]}) ");
					} else {
						// 서비스 호출 시 세션이 종료된 경우, Session 종료 Alert 후, 로그인 페이지로 Redirect 처리 한다.
						result = false;
						response.setContentType("application/json");
						response.setCharacterEncoding("UTF-8");
						response.getWriter().write("{\"rsMsg\":{\"statusCode\":\"E\", \"errorCode\" : \"E0001\", \"message\":\"Session이 종료 되었습니다.\\n\",\"status\":\"Error\"}}");
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
		// iframe으로 다른 도메인 시스템의 화면 로딩을 방지하려면 아래의 코드를 주석 해제해서 "X-Frame-Options=DENY" 설정이 되도록 해야 함 
		// response.addHeader("X-Frame-Options", "DENY");
	}


	/**
	 * Session 체크 대상에서 예외 URI 구성
	 * 
	 * @date 2020.03.06
	 * @param request HttpServletRequest 객체
	 * @returns <boolean> 예외처리 대상 URL 여부
	 * @author Inswave Systems
	 */
	private boolean isSkipURI(HttpServletRequest request) {
		String[] skipUrl = { "/", "/I18N", "/main/login", "/favicon.ico" };
		boolean result = false;
		String uri = (request.getRequestURI()).replace(request.getContextPath(), "");

		for (int i = 0; i < skipUrl.length; i++) {
			if (uri.equals(skipUrl[i])) {
				result = true;
				break;
			}
		}
		return result;
	}
}
