// =============================================================================
/**
 * GridView Finder : Browser의 검색 기능처럼 GridView 데이터를 검색하는 모듈
 *
 * @author Inswave Systems
 * @description

1. 개별 페이지에 GridView Finder 모듈 로딩 방법
	1) 웹스퀘어 페이지(XML)안에 gridViewFinder.js 파일을 로딩한다.
	<script src="/ui/SP/CommonEx/gridViewFinder.js" />
	
	2) 웹스퀘어 페이지가 로딩되는 시점에 ecm.gridFinderUtil.create() 함수를 호출한다.
	scwin.onpageload = function () {
		// 특정 2개의 GridView에만 GridView Finder 기능을 세팅한다. 
		ecm.gridFinderUtil.create([grd_commonCode, grd_commonCode]);
		
		// 업무 화면 내 모든 GridView에 GridView Finder 기능을 세팅한다.
		ecm.gridFinderUtil.create($p);
	};

2. GridView Finder 사용 방법
	1) GridView에 로딩될 데이터를 검색한다.
	2) GridView의 셀을 클릭한다.
	3) GridView 데이터 검색 단축키 (Ctrl + Shift + f)를 누른다.
	4) 데이터 검색 창에서 검색 키워드를 입력하고 엔터키를 누른다.
	5) 검색을 마치고 검색 창을 닫으려면 ESC 키를 누른다.             
	
3. 사용 가이드
gridViewFinder.js 라이브러리는 jQuery를 기반으로 개발되어 있으며, 프로젝트 요건에 따라서 꼭 필요한 경우만 사용하시기 바랍니다.
 */
// =============================================================================


if (typeof window.ecm === "undefined") {
	window.ecm = {};
}

/**
 * gridViewFinder를 GridView에 세팅한다.
 * 
 * @param {Object} GridView 객체 배열 (배열을 전달하지 않으면 현재 Scope내 모든 GridView를 대상으로 세팅함)
 * @description

gridViewFinder 기능을 모든 화면에서 사용하려면 gridViewFinder.js 파일을 config.xml 파일에 아래와 같이 등록해야 한다.

<engine>
	<module src="/cm/js/gridViewFinder.js"/>
</engine>

화면 초기 로딩 이벤트 함수(scwin.onpageload)에서 아래의 코드를 수행한다.

// 특정 2개의 GridView에만 GridView Finder 기능을 세팅한다. 
com.win.setGridFinder([grd_commonCode, grd_commonCode]);

// 업무 화면 내 모든 GridView에 GridView Finder 기능을 세팅한다.
com.win.setGridFinder();


// config.xml 파일의 wframe initScript에서 com.win.setGridFinder() 함수를 호출하면 모든 WFrame 내의 GridView를 찾아서 GridView Finder 기능을 설정한다.
<wframe>
	<initScript value="true"><![CDATA[
        com.win.setGridFinder();
	]]></initScript>
</wframe>
 */


com.win.setGridFinder = function(gridViewInfo) {
	if (typeof gridViewInfo !== "undefined") {
		ecm.gridFinderUtil.create(gridViewInfo);
	} else {
		ecm.gridFinderUtil.create($p);
	}
};

/**
 * GridView 안의 데이터를 검색하는 기능을 수행하는 객체
 */
ecm.gridFinderUtil = {
	keyword : null,
	columnList : null,
	searchedCellList : null,
	focusedIdx : null,
	gridView : null,
	dataList : null,
	isExistFindWindow : false,
	allowWindowIdList : [],
	layoutType : null,
	layoutName : null,

	/**
	 * GridView 검색 객체를 생성한다.
	 */
	create : function(gridViewInfo) {
		//화면 이동시 초기화 
		
		var layoutName;
		
		var layout = ecm.gridFinderUtil.layoutType == undefined?          $p.top().scwin.getLayoutId() : ecm.gridFinderUtil.layoutType;
		if (layout == "T") {
			layoutName= ecm.gridFinderUtil.layoutName == undefined ? $p.top().tac_layout:   $p.top().$p.getComponentById(ecm.gridFinderUtil.layoutName);
			layoutName.bind("onchange",     ecm.gridFinderUtil.hideFindWindow );
		}
		else if (layout == "M") {
			layoutName= ecm.gridFinderUtil.layoutName  == undefined ? $p.top().wdc_main:   $p.top().$p.getComponentById(ecm.gridFinderUtil.layoutName);
			layoutName.bind("onwindowchange",     ecm.gridFinderUtil.hideFindWindow );
		}
		else if (layout == "S") {
			layoutName= ecm.gridFinderUtil.layoutName  == undefined ? $p.top().wfm_layout:   $p.top().$p.getComponentById(ecm.gridFinderUtil.layoutName);
			layoutName.bind("onbeforewframeunload",     ecm.gridFinderUtil.hideFindWindow );
		}	else{
			return;
		}
		
		
		if(typeof gridViewInfo === "undefined"){
			
			var gridViewList="";
			var popupZIndex=0;
			//팝업일 때 와 팝업 아닌 떄 분리 
			if($p.getPopupList().length>0){
				//팝업일 경우 z-index 높은 것은 활성화로 인식하기 위한 로직 
			    for(var i=0; i<$p.getPopupList().length;i++){
			        if($p.getComponentById($p.getPopupList()[0].id).getStyle("z-index")*1 > popupZIndex){
			            popupZIndex = $p.getComponentById($p.getPopupList()[0].id).getStyle("z-index")*1;
			            gridViewList = WebSquare.util.getChildren($p.getComponentById($p.getPopupList()[0].id), {includePlugin : "gridView" , recursive : true});
			        }
			    }
			}
			else{
				var layout = $p.top().scwin.getLayoutId();
				//프레임별로 그리드 가져오는 동작 분리
				if (layout == "T") {
					gridViewList = WebSquare.util.getChildren (layoutName.getFrame(layoutName.getSelectedTabID()), {includePlugin : "gridView" , recursive : true});
				}
				else if (layout == "M") {
					if($p.top().wdc_main.selectedIndex == -1) return;
					gridViewList= WebSquare.util.getChildren (layoutName.getFrame(layoutName.getSelectedWindowId()), {includePlugin : "gridView" , recursive : true});
				}
				else if (layout == "S") {
					gridViewList = WebSquare.util.getChildren (layoutName, {includePlugin : "gridView" , recursive : true});
				}else{
					alert("알 수 없는 위치입니다.");
					return false; 
				}
			}
			
			var gridViewCount = gridViewList.length;
			for (var idx = 0; idx < gridViewCount; idx++) {
				ecm.gridFinderUtil.gridView = gridViewList[idx];
				ecm.gridFinderUtil.searchedCellList = null;
				ecm.gridFinderUtil.setGrid(gridViewList[idx]);
			}
		} else if (typeof gridViewInfo !== "undefined") {
			var gridViewList = gridViewInfo;
			var gridViewCount = gridViewList.length;
			
			for (var idx = 0; idx < gridViewCount; idx++) {
				ecm.gridFinderUtil.gridView = gridViewList[idx];
				ecm.gridFinderUtil.searchedCellList = null;
				ecm.gridFinderUtil.setGrid(gridViewList[idx]);
			}
		} else if ((typeof gridViewInfo.getFrameId !== "undefined") && (gridViewInfo.getFrameId() !== null)) {
			var gridViewList = WebSquare.util.getChildren(gridViewInfo.getFrame(), {
				includePlugin: "gridView",
				recursive: true
			});
			
			var gridViewCount = gridViewList.length;
			for (var idx = 0; idx < gridViewCount; idx++) {
				ecm.gridFinderUtil.gridView = gridViewList[idx];
				ecm.gridFinderUtil.searchedCellList = null;
				ecm.gridFinderUtil.setGrid(gridViewList[idx]);
			}
		}
		this._createFindWindow();
	},

	_createFindWindow : function() {
		if ($(".w2grid_finder")[0] !== undefined) {
			return;
		}

		if (ecm.gridFinderUtil.isExistFindWindow === false) {
			ecm.gridFinderUtil.isExistFindWindow = true;
		} else {
			this.clearFindWindow();
			return;
		}
		
		var findWindowHtml = '<div class="w2grid_finder">' + '<div class="finderLayout">' + '<div class="w2grid_finder_form">'
				+ '<input id="ibx_searchKeyword" type="text" placeholder="검색할 단어를 입력하세요." title="검색 입력폼"/>'
				+ '<input id="btn_movePrevious" type="button" value="<" title="이전 검색 항목으로 이동"/>'
				+ '<input id="btn_moveNext" type="button" value=">" title="다음 검색 항목으로 이동"/>' + '<input id="btn_gridviewId" type="hidden" value="" title=""/>'
				+ '<input id="btn_close" type="button" value="X" title="검색창 닫기"/>' + '</div>' + '<div id="grp_focusLoc" class="message"></div>'
				+ '<div id="grp_message" class="message"></div>'
				+ '</div></div>';
		
		var findWindoCss = '<style type="text/css">'
				+ '	.w2grid_finder {display:none;position:fixed;top:4px;left:auto;right:4px;padding:20px 10px 10px 10px;border:1px solid #333;background:#f0f0f0;z-index:9999;-moz-box-sizing:border-box;box-sizing:border-box;-moz-box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25);-webkit-box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25);box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25);}'
				+ '	.w2grid_finder .finderLayout{padding:10px;border:1px solid #dcdcdc;}'
				+ '	.w2grid_finder legend{padding:0 5px;}'
				+ '	.w2grid_finder legend:first-letter{text-decoration:underline;}'
				+ '	.w2grid_finder input[type="text"]{height:24px;width:170px;padding:0 5px;border:1px solid #7a7a7a;vertical-align:middle;-moz-box-sizing:border-box;box-sizing:border-box;}'
				+ '	.w2grid_finder input[type="button"]{height:24px;margin-left:5px;border:1px solid #d9d9d9;background-color:#e1e1e1;color:#000;vertical-align:middle;-moz-box-sizing:border-box;box-sizing:border-box;}'
				+ '	.w2grid_finder input[type="button"]:hover{border-color:#0078d7;background-color:#e5f1fb;}' + '	.w2grid_finder .message {margin-top:10px;}' +
				'</style>';
		
		$("body").append(findWindowHtml);
		$("head").append(findWindoCss);
		
		$(document).keydown(function(e) {
			if (e.which == 70 && e.shiftKey && e.ctrlKey) { // KeyEvent = shift + F
				var gridViewList=""; 
				//팝업 일때 예외 처리 한다.
				var popupZIndex=0;
				
				//팝업일 경우 z-index 높은 것은 활성화로 인식하기 위한 로
				if($p.getPopupList().length>0){
				    for(var i=0; i<$p.getPopupList().length;i++){
				        if($p.getComponentById($p.getPopupList()[0].id).getStyle("z-index")*1 > popupZIndex){
				            popupZIndex = $p.getComponentById($p.getPopupList()[0].id).getStyle("z-index")*1;
				            gridViewList= WebSquare.util.getChildren ($p.getComponentById($p.getPopupList()[i].id), {includePlugin : "gridView" , recursive : true});
				        }
				    }
				}
				else{
					
					var layout = $p.top().scwin.getLayoutId();
					
					//프레임별로 그리드 가져오는 동작 분리
					if (layout == "T") {
						gridViewList= WebSquare.util.getChildren ($p.top().tac_layout.getFrame($p.top().tac_layout.getSelectedTabID()), {includePlugin : "gridView" , recursive : true});
					}
					else if (layout == "M") {
						gridViewList= WebSquare.util.getChildren ($p.top().wdc_main.getFrame($p.top().wdc_main.getSelectedWindowId()), {includePlugin : "gridView" , recursive : true});
					}
					else if (layout == "S") {
						gridViewList= WebSquare.util.getChildren ($p.top().wfm_layout, {includePlugin : "gridView" , recursive : true});
					}else{
						alert("알 수 없는 위치입니다.");
						return false; 
					}
				}
				
				
				var keywordhidden = ""
				for (var idx = 0; idx < gridViewList.length; idx++) {
					ecm.gridFinderUtil.gridView = gridViewList[idx];
					ecm.gridFinderUtil.searchedCellList = null;
					ecm.gridFinderUtil.setGrid(gridViewList[idx]);
					keywordhidden += ","+gridViewList[idx].id
				}

				$("#btn_gridviewId").val(keywordhidden);

				$(".w2grid_finder").fadeIn("slow");
				$(".w2grid_finder #ibx_searchKeyword").focus();
				$(".w2grid_finder #ibx_searchKeyword").select();
			} else if (e.which == 27) { // ESC KeyEvent
				ecm.gridFinderUtil.hideFindWindow();
			}
		});
		$(".w2grid_finder #ibx_searchKeyword").keydown(function(e) {
			if (e.keyCode === 13) {
				var keyword = $(".w2grid_finder #ibx_searchKeyword").val();
				ecm.gridFinderUtil.find(keyword);
				return false;
			}
		});
		$(".w2grid_finder #btn_movePrevious").click(function() {
			$p.setTimeout(function(){
				ecm.gridFinderUtil.movePrevious();
			}, {delay:100, key:"tabMovePrevious"});
		});
		$(".w2grid_finder #btn_moveNext").click(function(event) {
			$p.setTimeout(function(){
				ecm.gridFinderUtil.moveNext();
			}, {delay:100, key:"taMoveNext"});
		});
		$(".w2grid_finder #btn_close").click(function() {
			ecm.gridFinderUtil.hideFindWindow();
		});
	},

	/**
	 * GridView와 Column 정보를 세팅한다.
	 */
	setGrid : function(gridView) {
		try {
					this.gridView = gridView;
					if (typeof this.gridView === null) {
						return;
					}
					this.dataList = $w.getComponentById(this.gridView.getDataList());
					if (this.columnList === null) {
						var columnCount = this.gridView.getColumnCount();
						this.columnList = [];
						for (var idx = 0; idx < columnCount; idx++) {
							// 주의사항 : GridView getCellInfo API는 비공개 함수이므로, 업무 화면(XML)에서는 사용해서는 안 됩니다.
							var cellInfo = this.gridView.getCellInfo(idx);
							if (typeof cellInfo.options.customFormatterOrigin === "undefined") {
								cellInfo.options.customFormatterOrigin = cellInfo.options.customFormatter;
							}
							var customFormatterFunc = cellInfo.options.customFormatterOrigin;
							var columnVisible = this.gridView.getColumnVisible(idx);
							var columnInfo = {
								"columnId" : this.gridView.getColumnID(idx),
								"visible" : columnVisible,
								"customFormatter" : customFormatterFunc
							};
							this.columnList.push(columnInfo);
						}
					}
		} catch (ex) {
			console.log(ex);
		}
	},

	/**
	 * Grid 데이터 검색 창을 숨기면서 초기화한다.
	 */
	hideFindWindow : function() {
		
		$(".w2grid_finder").fadeOut("fast");
		ecm.gridFinderUtil.clearFindWindow();
	},

	/**
	 * Grid 데이터 검색 기능을 초기화한다.
	 */
	clearFindWindow : function() {
		
		//if(btn_gridviewId == undefined ) return false;
		
		this.keyword = null;
		
		var btn_gridviewId = $('#btn_gridviewId').val();
		btn_gridviewId = btn_gridviewId.substring(1);
		
		var btn_gridviewIds = btn_gridviewId.split(",");
		if(btn_gridviewIds[0] !=""){
			for(var i=0; i<btn_gridviewIds.length;i++){
				
						this.gridView   = $p.getComponentById(btn_gridviewIds[i]);	
						this.dataList   = $p.getComponentById(btn_gridviewIds[i])._dataList;
						this.columnList = this.dataList.cellIdList;
				
						if (this.columnList !== null) {
				
							var columnCount = this.columnList.length;
							for (var columnIdx = 0; columnIdx < columnCount; columnIdx++) {
								if (this.columnList[columnIdx] !== null) {
									if (this.gridView.getCellInfo(this.columnList[columnIdx]).options.customFormatter) {
										this.gridView.setCustomFormatter(this.columnList[columnIdx], "");
									}
								}
							}
							this.columnList = null;
						}
						if (this.searchedCellList !== null) {
							var searchedCellCount = this.searchedCellList.length;
							for (var cellIdx = 0; cellIdx < searchedCellCount; cellIdx++) {
								this.searchedCellList[cellIdx].rowIdx = null;
								this.searchedCellList[cellIdx].colId = null;
								this.searchedCellList[cellIdx] = null;
							}
							this.searchedCellList = null;
						}
			}
			this.focusedIdx = null;
			this.gridView = null;
			this.dataList = null;
			$(".w2grid_finder #ibx_searchKeyword").val("");
			$(".w2grid_finder #grp_focusLoc")[0].innerHTML = "";
			$(".w2grid_finder #grp_message")[0].innerHTML = "";
			$("#btn_gridviewId").val("");
		}
	},

	/**
	 * 특정 키워드를 GridView 안에서 검색한다.
	 * 
	 * @param {String} searchKeyWord 검색할 Keyword
	 * @param {String} refreshYn     첫번째 일때 재귀 방지를 위해 설정 
	 */
	find : function(keyword,refreshYn) {
		try {
			if ((typeof keyword !== "undefined") && (keyword !== null) && (keyword.trim() !== "")) {
				this.keyword = keyword;
				this._searchData(this.keyword, refreshYn);
			} else {
				alert("검색 조건을 입력하세요.");
				return;
			}
		} catch (ex) {
			console.log(ex);
		}
	},
	
	/**
	 * 특정 키워드를 DataList 안에서 검색한다.
	 * 
	 * @param {String} keyword 검색 Keyword
	 * @param {String} refreshYn     첫번째 일때 재귀 방지를 위해 설정 
	 */
	_searchData : function(keyword, refreshYn) {
		try {
			delete this.searchedCellList;
			this.searchedCellList = [];
			
			var refreshYn = refreshYn ? refreshYn:"Y";
			
			var btn_gridviewId = $("#btn_gridviewId").val();
			btn_gridviewId = btn_gridviewId.substring(1);
			var btn_gridviewIds = btn_gridviewId.split(",");
			
			if(btn_gridviewIds.length == 0 || (btn_gridviewIds.length == 1 && btn_gridviewIds[0] =="")) return;
			
			for(var i=0; i<btn_gridviewIds.length;i++){
				this.dataList = $p.getComponentById(btn_gridviewIds[i])._dataList;
				this.columnList = this.dataList.cellIdList;
				
				var allData = this.dataList.getAllJSON();
				var rowCount = allData.length;
				for (var rowIdx = 0; rowIdx < rowCount; rowIdx++) {
					var colCount = this.columnList.length;
					for (var colIdx = 0; colIdx < colCount; colIdx++) {
						if($p.getComponentById(btn_gridviewIds[i]).cellIdList.join(",").indexOf(this.columnList[colIdx])>-1){
							var cellData = allData[rowIdx][this.columnList[colIdx]];
							if (typeof cellData !== "undefined") {
								if (typeof cellData === "number") {
									cellData = cellData.toString();
								}
								if (cellData.indexOf(keyword) > -1) {
									
									cellInfo = {
											"gridView" : $p.getComponentById(btn_gridviewIds[i]),
											"rowIdx"   : rowIdx,
											"colId"    : this.columnList[colIdx]
									};
									$p.getComponentById(btn_gridviewIds[i]).removeFocusedCell();
									this.searchedCellList.push(cellInfo);
								}
							}
							
						}
					}
				}
			}
			var resultMessage = this.searchedCellList.length + "건의 데이터가 검색 되었습니다.";
			$(".w2grid_finder #grp_message")[0].innerHTML = resultMessage;
			if (btn_gridviewIds.length > 0) {
				this._markKeyword();
				if(refreshYn =="Y"){   //재귀 호출 방
					this.moveNext();
				}
			}
		} catch (ex) {
			console.log(ex);
		}
	},
	
	
	/**
	 * GridView의 셀에 검색 Keyword를 Marking한다.
	 */
	_markKeyword : function() {
		try {
			var btn_gridviewId = $("#btn_gridviewId").val();
			btn_gridviewId = btn_gridviewId.substring(1);			
			var btn_gridviewIds = btn_gridviewId.split(",");
			
			for(var i=0; i<btn_gridviewIds.length;i++){
				this.columnList = $p.getComponentById(btn_gridviewIds[i]).cellIdList;
				this.gridView = $p.getComponentById(btn_gridviewIds[i]);
				var columnCount = this.columnList.length;
				for (var idx = 0; idx < columnCount; idx++) {
					if (this.gridView.getColumnVisible(this.columnList[idx])) {
						this.gridView.setCustomFormatter(this.columnList[idx], "ecm.gridFinderUtil.formatter");
					}
				}
			}
		} catch (ex) {
			console.log(ex);
		}
	},
	
	/**
	 * 현재 포커스에서 Keyword가 포함된 이전 Cell로 이동한다.
	 */
	movePrevious : function() {
		try {
			this._refresh();
			
			if (this.focusedIdx === null) {
				this.focusedIdx = 0;
			} else {
				if (this.focusedIdx > 0) {
					this.focusedIdx--;
				} else{
					if(this.focusedIdx == 0){
						this.recalculation("Previous")
						return;
					}
				}
			}
			if ((this.searchedCellList !== null) && (this.searchedCellList.length > 0)) {
				if(this.gridView != this.searchedCellList[this.focusedIdx].gridView )
					this.gridView.removeFocusedCell();

				this.gridView = this.searchedCellList[this.focusedIdx].gridView;
				this.gridView.setFocusedCell(this.searchedCellList[this.focusedIdx].rowIdx, this.searchedCellList[this.focusedIdx].colId, false);
			}
			if (this.searchedCellList.length > 0) {
				var focusLoc = "[" + (this.focusedIdx + 1) + "/" + this.searchedCellList.length + "]";
				$(".w2grid_finder #grp_focusLoc")[0].innerHTML = focusLoc;
			} else {
				$(".w2grid_finder #grp_focusLoc")[0].innerHTML = "";
			}
			
		} catch (ex) {
			console.log(ex);
		}
	},
	
	/**
	 * 현재 포커스에서 Keyword가 포함된 다음 Cell로 이동한다.
	 */
	moveNext : function() {
		try {
			this._refresh("N");
			if (this.focusedIdx === null) {
				this.focusedIdx = 0;
			} else {
				
				this.gridView = this.searchedCellList[this.focusedIdx].gridView;
				
				if ((this.searchedCellList.length - 1) > this.focusedIdx) {
					this.focusedIdx++;
				} else {
					var btn_gridviewId = $("#btn_gridviewId").val();
					btn_gridviewId = btn_gridviewId.substring(1);
					
					var btn_gridviewIds = btn_gridviewId.split(",");
					
					if($(".w2grid_finder #grp_focusLoc").text().split("/")[1].split("]")[0] ==	$(".w2grid_finder #grp_focusLoc").text().split("/")[0].split("[")[1] ){
						//재계산 로직 작성 
						this.recalculation("next");
						return;
					}
				}
			}
			if ((this.searchedCellList !== null) && (this.searchedCellList.length > 0)) {
				//그리드에서 다른 그리드 이동 했을 때 
				if(this.gridView != this.searchedCellList[this.focusedIdx].gridView ){
					this.gridView.removeFocusedCell();
					if(this.focusedIdx != 0){
						this.recalculation("next","Y")
					}
				}
				
				this.gridView = this.searchedCellList[this.focusedIdx].gridView;
				this.gridView.setFocusedCell(this.searchedCellList[this.focusedIdx].rowIdx, this.searchedCellList[this.focusedIdx].colId, false);
				$(".w2grid_finder #btn_moveNext").focus();
				
			}
			if (this.searchedCellList.length > 0) {
				var focusLoc = "[" + (this.focusedIdx + 1) + "/" + this.searchedCellList.length + "]";
				$(".w2grid_finder #grp_focusLoc")[0].innerHTML = focusLoc;
			} else {
				$(".w2grid_finder #grp_focusLoc")[0].innerHTML = "";
			}
		} catch (ex) {
			console.log(ex);
		}
	},
	
	/**
	 * finder 재계산 
	 * 
	 * @param {String} move        이동시구분값(next:앞, Previous:뒤)
	 * @param {String} newGrid     그리드에서 다음 그리드로 갈떄 여부 확인 Y, N
	 */
	recalculation : function(move,newGrid) {
		
		delete this.searchedCellList;
		this.searchedCellList = [];
		
		var btn_gridviewId = $("#btn_gridviewId").val();
		btn_gridviewId = btn_gridviewId.substring(1);
		var btn_gridviewIds = btn_gridviewId.split(",");
		
		for(var i=0; i<btn_gridviewIds.length;i++){
			this.dataList = $p.getComponentById(btn_gridviewIds[i])._dataList;
			this.columnList = this.dataList.cellIdList;
			
			var allData = this.dataList.getAllJSON();
			var rowCount = allData.length;
			for (var rowIdx = 0; rowIdx < rowCount; rowIdx++) {
				var colCount = this.columnList.length;
				for (var colIdx = 0; colIdx < colCount; colIdx++) {
					if($p.getComponentById(btn_gridviewIds[i]).cellIdList.join(",").indexOf(this.columnList[colIdx])>-1){
						var cellData = allData[rowIdx][this.columnList[colIdx]];
						if (typeof cellData !== "undefined") {
							if (typeof cellData === "number") {
								cellData = cellData.toString();
							}
							if (cellData.indexOf(this.keyword) > -1) {
								
								cellInfo = {
										"gridView" : $p.getComponentById(btn_gridviewIds[i]),
										"rowIdx"   : rowIdx,
										"colId"    : this.columnList[colIdx]
								};
								$p.getComponentById(btn_gridviewIds[i]).removeFocusedCell();
								this.searchedCellList.push(cellInfo);
							}
						}
					}
				}
			}
		}
		if(move == "next"){            //총갯수와 이동수가 같을 
			if($(".w2grid_finder #grp_message")[0].innerHTML.split("건의 데이터가 검색 되었습니다.")[0]*1 != this.searchedCellList.length && newGrid!="Y"){
				var resultMessage = this.searchedCellList.length + "건의 데이터가 검색 되었습니다.";
				$(".w2grid_finder #grp_message")[0].innerHTML = resultMessage;
				var focusLoc = "[" + (this.focusedIdx + 1) + "/" + this.searchedCellList.length + "]";
				$(".w2grid_finder #grp_focusLoc")[0].innerHTML = focusLoc;
				this.moveNext();
			}
			else if(newGrid=="Y"){     //그리드뷰에서 다른 그리드뷰로 이동
				var resultMessage = this.searchedCellList.length + "건의 데이터가 검색 되었습니다.";
				$(".w2grid_finder #grp_message")[0].innerHTML = resultMessage;
				var focusLoc = "[" + (this.focusedIdx + 1) + "/" + this.searchedCellList.length + "]";
				$(".w2grid_finder #grp_focusLoc")[0].innerHTML = focusLoc;
			}
			else{
				this.focusedIdx = null;
				this.moveNext();
			}
		}
		if(move == "Previous"){
			if($(".w2grid_finder #grp_message")[0].innerHTML.split("건의 데이터가 검색 되었습니다.")[0]*1 != this.searchedCellList.length){
				var resultMessage = this.searchedCellList.length + "건의 데이터가 검색 되었습니다.";
				this.focusedIdx = this.searchedCellList.length-1;
				var focusLoc = "[" + (this.focusedIdx -1) + "/" + this.searchedCellList.length + "]";
				$(".w2grid_finder #grp_message")[0].innerHTML = resultMessage;
				$(".w2grid_finder #grp_focusLoc")[0].innerHTML = focusLoc;
				this.movePrevious();
				
			}else{
				this.focusedIdx = $(".w2grid_finder #grp_message")[0].innerHTML.split("건의 데이터가 검색 되었습니다.")[0]*1;
				this.movePrevious();
			}
		}
		
	},
	/**
	 * GridView CustomFormatter를 이용해서 각 셀 별로 Keyword를 Marking한다.
	 */
	formatter : function(value, formatValue, rowIdx, colIdx) {
		var result = value;
		try {
			var customFormatterFunc = ecm.gridFinderUtil.columnList[colIdx].customFormatter;
			var preFormatValue = null;
			if (typeof customFormatterFunc === "function") {
				preFormatValue = customFormatterFunc(value, formatValue, rowIdx, colIdx);
			} else {
				preFormatValue = formatValue;
			}
			result = preFormatValue;
			var columnData = null;
			if (typeof preFormatValue === "number") {
				columnData = preFormatValue.toString();
			} else {
				columnData = preFormatValue;
			}
			if (value.toString().indexOf(ecm.gridFinderUtil.keyword) != -1) {
				result = columnData.replace(ecm.gridFinderUtil.keyword, '<span style="color:red;margin:0;background-color:yellow;">'
						+ ecm.gridFinderUtil.keyword + '</span>');
			} else {
				result = columnData;
			}
			return result;
		} catch (ex) {
			console.log(ex);
			return result;
		}
	},
	
	/**
	 * 검색 조건이 변경된 경우 갱신 처리함
	 * @param {String} refreshYn     첫번째 일때 재귀 방지를 위해 설정 
	 */
	_refresh : function(refreshYn) {
		try {
			var keyword = $(".w2grid_finder #ibx_searchKeyword").val();
			if (this.keyword !== keyword) {
				this.find(keyword, refreshYn);
			}
		} catch (ex) {
			console.log(ex);
			return value;
		}
	}
};