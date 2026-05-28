package com.inswave.wrm.member.service;

import java.util.List;
import java.util.Map;

public interface ScheduleService {

	public List selectSchedule(Map map);

	public Map addSchedule(Map map);

	public Map deleteSchedule(Map map);

	public Map updateSchedule(Map map);

}
