package com.inswave.wrm.common.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inswave.wrm.common.dao.HolidayDao;
import com.inswave.wrm.common.service.HolidayService;

@Service
public class HolidayServiceImpl implements HolidayService {
	
	@Autowired
	private HolidayDao holidayDao;
	
	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Override
	public List selectHoliday(Map param) {
		return holidayDao.selectHoliday(param);
	}
	
	@Override
	public Map saveHoliday(List<Map<String, Object>> param) {
		int iCnt = 0;
		int uCnt = 0;
		int dCnt = 0;
		
		for(int i=0; i<param.size(); i++) {			
			Map<String, Object> get = (Map) param.get(i);
			String rowStatus = (String) get.get("rowStatus");
			
			if (rowStatus.equals("C")) {
				iCnt += holidayDao.insertHoliday(get);
			} else if (rowStatus.equals("D")) {
				dCnt += holidayDao.deleteHoliday(get);
			} else if (rowStatus.equals("U")) {
				uCnt += holidayDao.updateHoliday(get);
			}
		}
		
		Map res = new HashMap();
		res.put("STATUS", "S");
		res.put("ICNT", String.valueOf(iCnt));
		res.put("UCNT", String.valueOf(uCnt));
		res.put("DCNT", String.valueOf(dCnt));
		
		return res;
	}
}
