package com.inswave.wrm.common.service;

import java.util.List;
import java.util.Map;

public interface HolidayService {

	public List selectHoliday(Map map);
	
	public Map saveHoliday(List<Map<String, Object>> param);
}
