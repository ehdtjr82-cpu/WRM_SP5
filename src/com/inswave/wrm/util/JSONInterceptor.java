package dongwon.common.json;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.nexacro.xapi.data.DataSet;

import dongwon.common.utils.ListVO;
import dongwon.common.utils.ParamVO;

/**
 * JSON 데이터 처리 용 인터셉터
 *
 * @since 19/02/27
 */
public class JSONInterceptor extends HandlerInterceptorAdapter {

    protected final Log log = LogFactory.getLog(JSONInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (log.isDebugEnabled()) {
            log.debug("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ JSONInterceptor.preHandle()");
        }

        // 인코딩 설정은 스트림을 읽기 전에 먼저 수행해야 합니다.
        request.setCharacterEncoding("UTF-8");

        JSONParser parser = new JSONParser();
        JSONObject json = null;
        String contentEncoding = request.getHeader("Content-Encoding");

        // Try-with-resources 구조로 변환하여 I/O 자원 자동 반납 및 예외 안전성 확보
        if (contentEncoding != null && contentEncoding.equalsIgnoreCase("gzip")) {
            try (GZIPInputStream zipIn = new GZIPInputStream(request.getInputStream());
                 Reader reader = new InputStreamReader(zipIn, "UTF-8")) {
                
                Object obj = parser.parse(reader);
                json = (JSONObject) obj;
                if (log.isDebugEnabled()) {
                    log.debug("[preHandle] 1번 (GZIP 압축 해제 완료)");
                }
            }
        } else {
            try (Reader reader = request.getReader()) {
                Object obj = parser.parse(reader);
                json = (JSONObject) obj;
                if (log.isDebugEnabled()) {
                    log.debug("[preHandle] 2번: " + (obj != null ? obj.toString() : "null"));
                }
            }
        }

        ParamVO param = new ParamVO();

        // 1. URL 쿼리 스트링 파라미터 추출 (제네릭 적용)
        Enumeration<String> enumeration = request.getParameterNames();
        while (enumeration.hasMoreElements()) {
            String parameterName = enumeration.nextElement();
            String value = request.getParameter(parameterName);
            param.put(parameterName, value);
        }

        ListVO dataList = new ListVO();
        
        // 2. JSON 바디 데이터 처리
        if (json != null) {
            // Iterator 대신 자바 5+ 향상된 for문(keySet) 사용으로 가독성 향상
            for (Object keyObj : json.keySet()) {
                String key = (String) keyObj;
                Object obj = getJavaObject(json, key);

                if (obj instanceof List) {
                    dataList.setList(key, (List<?>) obj);
                } else if (obj != null) {
                    param.put(key, obj.toString()); 
                } else {
                    param.put(key, null);
                }
            }
        }

        // 공통 세션 및 Attribute 추가
        param.setUserId((String) request.getSession().getAttribute("USER_ID"));
        request.setAttribute("NexacroParam", param);
        request.setAttribute("NexacroList", dataList);

        // 서비스명 및 메서드명 바인딩
        request.setAttribute("serviceName", (String) param.get("serviceName"));
        request.setAttribute("methodName", (String) param.get("methodName"));

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        if (log.isDebugEnabled()) {
            log.debug("JSONInterceptor.postHandle()");
        }
        super.postHandle(request, response, handler, modelAndView);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        if (log.isDebugEnabled()) {
            log.debug("JSONInterceptor.afterCompletion()");
        }
        super.afterCompletion(request, response, handler, ex);
    }

    /**
     * JSON 데이터를 Java 컬렉션 규격(List<Map>)으로 변환합니다.
     */
    @SuppressWarnings("unchecked")
    protected Object getJavaObject(JSONObject json, String name) {
        if (json == null) {
            return null;
        }

        Object obj = json.get(name);
        if (obj == null) {
            return null;
        }

        JSONArray array;
        if (obj instanceof JSONObject) {
            array = new JSONArray();
            array.add(obj); // 제네릭 유연성을 위해 캐스팅 제거 가능
        } else if (obj instanceof JSONArray) {
            array = (JSONArray) obj;
        } else {
            return obj;
        }

        // 제네릭 명시: List<Map<String, Object>> 형태로 안전하게 관리
        List<Map<String, Object>> dataList = new ArrayList<>();
        
        for (int i = 0; i < array.size(); i++) {
            JSONObject jobj = (JSONObject) array.get(i);
            Map<String, Object> rowData = new HashMap<>();
            
            // 넥사크로 Row Type 기본값 세팅
            rowData.put("_rowType", String.valueOf(DataSet.ROW_TYPE_NORMAL));

            // 가독성 낮은 Iterator 제거하고 keySet 향상된 for문 사용
            for (Object keyObj : jobj.keySet()) {
                String key = (String) keyObj;
                Object value = jobj.get(key);
                rowData.put(key, value);
            }
            dataList.add(rowData);
        }

        return dataList;
    }
}