package com.inswave.wrm.member.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.inswave.wrm.member.service.ScheduleService;
import com.inswave.wrm.util.Result;

@Controller
public class ScheduleController {

	@Autowired ScheduleService scheduleService;
	
	private final Logger logger = org.slf4j.LoggerFactory.getLogger(getClass());
	
	@RequestMapping("/schedule")
	public @ResponseBody Map<String, Object> schedule(@RequestBody Map <String, Object> param) {
		Result res = new Result();
		
		try {
			res.setData("dlt_schedule", scheduleService.selectSchedule((Map) param.get("dma_search")));
			res.setStatusMsg(res.STATUS_SUCESS,"일정을 조회합니다.");
		} catch (Exception e) {
			e.printStackTrace();
			res.setMsg(res.STATUS_ERROR, "일정 리스트를 가져오는 도중 오류가 발생하였습니다.");
		}
		
		return res.getResult();
	}
	
	@RequestMapping("/schedule/insert")
	public @ResponseBody Map<String, Object> addSchedule(@RequestBody Map<String, Object> param) {
		Result res = new Result();
		
		try {
			res.setData("dma_select", scheduleService.addSchedule((Map) param.get("dma_select")));
			res.setStatusMsg(res.STATUS_SUCESS, "일정 저장이 완료됐습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			res.setMsg(res.STATUS_ERROR, "일정을 등록하는 도중 에러가 발생했습니다.");
		}
		
		return res.getResult();
	}
	
	@RequestMapping("/schedule/delete")
	public @ResponseBody Map<String, Object> deleteSchedule(@RequestBody Map<String, Object> param) {	
		Result res = new Result();
		
		try {
			res.setData("dma_select", scheduleService.deleteSchedule((Map) param.get("dma_select")));
			res.setStatusMsg(res.STATUS_SUCESS, "등록된 일정이 삭제 됐습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			res.setMsg(res.STATUS_ERROR, "일정을 삭제하는 도중 에러가 발생했습니다.");
		}
		
		return res.getResult();
	}
	
	@RequestMapping("/schedule/update")
	public @ResponseBody Map<String, Object> updateSchedule(@RequestBody Map<String, Object> param) {
		Result res = new Result();
		
		try {
			res.setData("dma_select", scheduleService.updateSchedule((Map) param.get("dma_select")));
			res.setStatusMsg(res.STATUS_SUCESS, "등록된 일정이 수정 됐습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			res.setMsg(res.STATUS_ERROR,"일정을 수정하는 도중 에러가 발생했습니다.");
		}
		
		return res.getResult();
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}
