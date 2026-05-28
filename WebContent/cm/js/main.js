/**
 * 화면 초기 로딩
 * 
 * @lastUpdate 2016.08.28
 * @author Inswave Systems
 * @since 2016.08.28
 */
scwin.initMainLoad = function() {
	wfm_side.getWindow().scwin.getInitData();

	var deviceWidth = com.num.parseFloat($("body").css("width"));
	if (deviceWidth < 1280) {
		$(".wrap").removeClass("show_menu");
		$(".btn_toggle_menu").removeClass("on");
	}

	gcm.win.addEventOnBeforeUnload();
};

/**
 * header menu 생성
 */
scwin.setHeaderMenu = function() {
	wfm_header.getWindow().scwin.setGenerator(); // 메뉴 생성
	wfm_header.getWindow().scwin.setMenuCss(); // 메뉴 css 적용
};

/**
 * 메인 레이아웃 아이디 정보를 반환한다.
 */
scwin.getLayoutId = function() {
	if (typeof $p.main().$p.getComponentById("tac_layout") === "object") {
		return "T";
	} else if (typeof $p.main().$p.getComponentById("wdc_main") === "object") {
		return "M";
	} else if (typeof $p.main().$p.getComponentById("wfm_layout") === "object") {
		return "S";
	}
	return null;
};

/**
 * 화면 해상도가 모바일 사이즈인지 반환한다.
 */
scwin.isMobileSize = function() {
	var size = {
		width : window.innerWidth || document.body.clientWidth,
		height : window.innerHeight || document.body.clientHeight
	};

	if (size.width <= 1024) {
		return true;
	} else {
		return false;
	}
};

/**
 * 화면이 닫히 전에 변경된 데이터가 있는지 검사한다.
 */
scwin.closeBeforePage = function(frameObj) {
	if (checkBeforeCloseModified(frameObj)) {
		if (confirm(com.data.getMessage("MSG_CM_00006"))) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
	
	function checkBeforeCloseModified(frameObj) {
		var changeCheckMainFrame = gcm.data.getChangeCheckedMainFrame(frameObj.scope.$p);
		if (!com.util.isEmpty(changeCheckMainFrame)) {
			var changeCheckDcList = gcm.data.getChangeCheckedMainFrame(frameObj.scope.$p)._changeCheckDcList;

			if (!com.util.isEmpty(changeCheckDcList) && com.util.isArray(changeCheckDcList) && (changeCheckDcList.length > 0)) {
				for (var i = 0; i < changeCheckDcList.length; i++) {
					var dlObj = com.util.getComponent(changeCheckDcList[i]);
					if (!com.util.isEmpty(dlObj) && (dlObj.getObjectType() == "dataList" || dlObj.getObjectType() == "dataMap")) {
						if (dlObj.getModifiedIndex().length > 0) {
							return true;
						}
					}
				}
			}
		}

		return false;
	};
};

/**
 * 메인 화면으로 History를 저장한다.
 */
scwin.pushStateMain = function() {
	var data = {
			menuInfo : {
				menuNm : "메인",
				menuCode : "MAIN"
			}
		};
	gcm.win.pushState(data);
};


