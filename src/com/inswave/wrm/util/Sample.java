package com.inswave.wrm.util;

import java.util.Arrays;
import java.util.List;

public class Sample {

	public static void main(String[] args) {
		List<String> logs = Arrays.asList("로딩 시작", "데이터 처리중", "완료");
		// ✅ 특정 객체 변수명::인스턴스 메서드 방식
		logs.forEach(System.out::println);
	}

}
