package dongwon.common.json;

import java.io.OutputStream;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.web.servlet.view.AbstractView;

import dongwon.common.lib.dto.DataList;

/**
 * JSON 처리 View (Refactored)
 */
public class JSONView extends AbstractView {

    protected final Log log = LogFactory.getLog(getClass());
    private static final String DEFAULT_CHARSET = "utf-8";

    @Override
    @SuppressWarnings("unchecked")
    protected void renderMergedOutputModel(Map<String, Object> model, HttpServletRequest request, HttpServletResponse response) throws Exception {
        
        JSONObject jsonResult = new JSONObject();

        // 1. Model Map을 순회하며 JSON 구조로 변환
        for (Map.Entry<String, Object> entry : model.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof DataList || value instanceof List) {
                // List 계열 데이터는 별도 JSON 배열 변환 메서드로 위임 (중복 코드 제거)
                jsonResult.put(key, convertToJSONArray((Iterable<?>) value));
            } else {
                jsonResult.put(key, value);
            }
        }
        // 2. HTTP 응답 헤더 설정 및 출력
        try {
            response.setContentType("application/json; charset=" + DEFAULT_CHARSET);
            writeData(response, jsonResult, DEFAULT_CHARSET);
        } catch (Exception ex) {
            log.error("JSON rendering error", ex);
            throw ex;
        }
    }

    /**
     * List나 DataList 내의 Map 데이터를 JSONArray로 공통 변환하는 메서드
     */
    @SuppressWarnings("unchecked")
    private JSONArray convertToJSONArray(Iterable<?> listData) {
        JSONArray jsonArray = new JSONArray();
        if (listData == null) return jsonArray;

        for (Object element : listData) {
            if (element instanceof Map) {
                Map<String, Object> record = (Map<String, Object>) element;
                JSONObject row = new JSONObject();
				// map 내의 모든 요소를 순회하면서 값을 문자열로 세탁
				record.forEach((key, value) -> {
					if (value == null) {
						row.put(key, ""); // null 값은 빈 문자열로 처리
					} else {
						row.put(key, String.valueOf(value)); 
					}
				});
				jsonArray.add(row);
            }
        }
        return jsonArray;
    }

    /**
     * 데이터를 스트림으로 출력하는 메서드 (역슬래시 공통 제거 포함)
     */
    protected void writeData(HttpServletResponse response, JSONObject outputObj, String charset) throws Exception {
        
        // 1. JSON 문자열 추출
        String jsonString = outputObj.toJSONString();
        byte[] sendByte = jsonString != null ? jsonString.getBytes(charset) : new byte[0];

        try (OutputStream out = response.getOutputStream()) {
            out.write(sendByte);
        } catch (Exception e) {
            log.error("OutputStream write error", e);
            throw e;
        }
    }
}