package com.inswave.wrm.common.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.inswave.wrm.common.service.LoginService;

@Controller
public class InitController {
	
	@Autowired
	private LoginService loginService;
	

	/**
	 * 기본 Root Url 처리
	 * 
	 * @date 2017.12.22
	 * @author Inswave Systems
	 */
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String IndexBase(HttpServletRequest request, Model model) throws Exception {
		model.addAttribute("movePage", loginService.getLoginPage(request.getParameter("w2xPath")));
		return "websquare/websquare";
	}
	
	/**
	 * Popup Url 처리
	 * 
	 * @date 2017.12.22
	 * @author Inswave Systems
	 */
	@RequestMapping(value = "/popup", method = RequestMethod.GET)
	public String IndexWebSquare(HttpServletRequest request, Model model) throws Exception {
		model.addAttribute("movePage", loginService.getLoginPage(request.getParameter("w2xPath")));
		return "websquare/popup";
	}
}
