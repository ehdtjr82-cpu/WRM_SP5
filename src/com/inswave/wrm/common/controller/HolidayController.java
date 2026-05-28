package com.inswave.wrm.common.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.inswave.wrm.common.service.HolidayService;
import com.inswave.wrm.util.Result;

@Controller
public class HolidayController {
	
	@Autowired
	private HolidayService holidayService; 

	private final Logger logger = LoggerFactory.getLogger(getClass());
	
	/**
	 * selectHoliday - 휴일 목록을 조회한다.
	 * 
	 * @date 2023.08.30
	 * @param {} 없음
	 * @returns dlt_holiday ( 공휴일 목록 )
	 * @author Inswave Systems
	 * @example
	 */
//	@RequestMapping("/holiday/selectHoliday")
//	public @ResponseBody Map<String, Object> selectHoliday() {
//		
//		// 화면부터 구현 후 작성 시작
//		logger.info("/holiday Success");
//		Result res = new Result();
//		
//		try {
//			res.setData("dlt_holiday", holidayService.selectHoliday());
//			res.setStatusMsg(res.STATUS_SUCESS, "공휴일 목록을 조회합니다.");
//		} catch (Exception e) {
//			res.setMsg(res.STATUS_ERROR, "공휴일 목록 조회에 실패하였습니다.");
//		}
//		
//		return res.getResult();
//	}
	
	/**
	 * 공휴일 목록을 조건에 따라 검색한다
	 * @date 2023.09.11
	 * @param {} 
	 * @returns dlt_holiday (공휴일 목록)
	 * @author Inswave Systems
	 * @example
	 */
	@RequestMapping("/holiday/selectHoliday")
	public @ResponseBody Map<String, Object> selectHoliday(@RequestBody Map<String, Object> param) {
		Result res = new Result();
		
		try {

			logger.info("/holiday/selectHoliday Success");
			res.setData("dlt_holiday", holidayService.selectHoliday((Map) param.get("dma_search")));
			res.setStatusMsg(res.STATUS_SUCESS, "공휴일 목록을 검색합니다.");
		} catch (Exception ex) {
			ex.printStackTrace();
			logger.info("/holiday/select Failure");
			res.setMsg(res.STATUS_ERROR, "공휴일 목록 검색에 실패했습니다.");
		}
		
		return res.getResult();
	}
	
	
	
	/**
	 * save - 공휴일 목록의 수정, 삭제, 추가된 데이터를 저장한다
	 * @date 2023.09.06
	 * @param param
	 * @return dlt_holiday( 공휴일 목록 )
	 * @author Inswave Systems
	 * @example
	 */
	@RequestMapping("/holiday/save")
	public @ResponseBody Map<String, Object> save(@RequestBody Map<String, Object> param) {
		
		Result res = new Result();
		
		logger.info("/holiday/save Success");
		
		try {
			Map hash = holidayService.saveHoliday((List) param.get("dlt_holiday"));
			res.setData("dma_result", hash);
			res.setMsg(res.STATUS_SUCESS, "공휴일 목록이 저장 됐습니다. " +  
					"입력 : " + (String) hash.get("ICNT") + "건, " + 
					"수정 : " + (String) hash.get("UCNT") + "건, " +
					"삭제 : " + (String) hash.get("DCNT") + "건");
		} catch (Exception e) {
			res.setMsg(res.STATUS_ERROR, "현재 목록을 저장하는데 실패했습니다.");
		}
		
		return res.getResult();
	}
	
	
	
	
	
	
	
}
