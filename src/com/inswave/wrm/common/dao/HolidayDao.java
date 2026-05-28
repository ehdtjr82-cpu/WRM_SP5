package com.inswave.wrm.common.dao;

import java.util.List;
import java.util.Map;

public interface HolidayDao {

	public List selectHoliday(Map param);

	public int insertHoliday(Map<String, Object> get);

	public int deleteHoliday(Map<String, Object> get);

	public int updateHoliday(Map<String, Object> get);
}
