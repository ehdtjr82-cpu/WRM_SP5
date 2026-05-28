package com.inswave.wrm.member.dao;

import java.util.List;
import java.util.Map;

public interface ScheduleDao {

	public List selectSchedule(Map<String, Object> parm);

	public int insertSchedule(Map<String, Object> parm);

	public int deleteSchedule(Map<String, Object> parm);

	public int updateSchedule(Map<String, Object> parm);

}
