package com.inswave.wrm.member.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inswave.wrm.member.dao.ScheduleDao;
import com.inswave.wrm.member.service.ScheduleService;
import com.inswave.wrm.util.UserInfo;

@Service
public class ScheduleServiceImpl implements ScheduleService {
	
	@Autowired ScheduleDao scheduleDao;
	
	@Autowired
	private UserInfo user;	
	
	@Override
	public List selectSchedule(Map map) {
		return scheduleDao.selectSchedule(user.getUserInfo());
	}

	@Override
	public Map addSchedule(Map param) {
		
		int iCnt = 0;
		param.put("EMP_CD", user.getUserId());
		iCnt += scheduleDao.insertSchedule(param);
		
		Map<String, Object> res = new HashMap();
		res.put("ICNT", iCnt);
		
		return res;
	}

	@Override
	public Map deleteSchedule(Map param) {
		
		int dCnt = 0;
		param.put("EMP_CD", user.getUserId());
		dCnt += scheduleDao.deleteSchedule(param);
		
		Map<String, Object> res = new HashMap();
		res.put("DCNT", dCnt);
		
		return res;
	}

	@Override
	public Map updateSchedule(Map param) {
		
		int uCnt = 0;
		param.put("EMP_CD", user.getUserId());
		uCnt += scheduleDao.updateSchedule(param);

		Map<String, Object> res = new HashMap();
		res.put("UCNT", uCnt);
				
		return res;
	}

}
