package dongwon.common.json;

import java.io.OutputStream;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.web.servlet.view.AbstractView;


import dongwon.common.lib.dto.DataList;
/**
 * JSON 처리 View.
 */
public class JSONView extends AbstractView
{

	protected Log log = LogFactory.getLog(JSONView.class);

	@Override
	protected void renderMergedOutputModel(Map model, HttpServletRequest request, HttpServletResponse response) throws Exception
	{

		JSONObject json = new JSONObject();

		Set modelKeys = model.keySet();
		Iterator iterator = modelKeys.iterator();

		while(iterator.hasNext())
		{
			Object modelKey = iterator.next();
			Object modelValue = model.get(modelKey);

			String objectName = String.valueOf(modelKey);

			if(objectName != null && (modelValue instanceof List || modelValue instanceof DataList))
			{
				JSONArray dsList = new JSONArray();

				if(modelValue instanceof DataList)
				{
					DataList dataList = (DataList) modelValue;
					if(dataList != null)
					{
						// 데이터 입력
						Iterator<Map> listIterator = dataList.iterator();

						while(listIterator.hasNext())
						{
							JSONObject row = new JSONObject();
							// Header 세팅
							Map<String, Object> record = listIterator.next();

							for( Map.Entry<String, Object> entry : record.entrySet() ) {
					            String key = entry.getKey();
					            Object value = entry.getValue();
					            row.put(key, value);
					        }

							dsList.add(row);	// row 에 추가
						}
					}

					json.put(objectName, dsList);
				}
				else if(modelValue instanceof List)
				{
					List list = (List) modelValue;

					Iterator<Map> listIterator = list.iterator();
					while(listIterator.hasNext())
					{
						JSONObject row = new JSONObject();
						// Header 세팅
						Map<String, Object> record = listIterator.next();

						for( Map.Entry<String, Object> entry : record.entrySet() ) {
				            String key = entry.getKey();
				            Object value = entry.getValue();
				            row.put(key, value);
				        }

						dsList.add(row);	// row 에 추가
					}

					json.put(objectName, dsList);
				} else {
					json.put(objectName, modelValue);
				}
			}else{
				json.put(objectName, modelValue);
			}
		}

		try
		{
			response.setContentType("application/json; charset=" + "utf-8");
			writeData(response, json, "utf-8");
		}
		catch(Exception ex)
		{
			ex.printStackTrace();

			throw ex;
		}
	}

	protected void writeData(HttpServletResponse response, JSONObject outputObj, String charset)
			throws Exception {

			byte[] sendByte = outputObj.toJSONString().getBytes(charset);
			OutputStream out = null;
			// 2011.01.12 추가 :
			out = response.getOutputStream();

			try {
				out.write(sendByte);
			} catch( Exception e ){
				throw e;
			} finally {
				if( out != null ) {
					out.flush();
					out.close();
				}
			}
		}
}
