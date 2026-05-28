/**
 * @class
 * @type 
 * @memberOf 
 */
window.com = window.com || {};

/**
 * 사용자 처리 함수
 * @memberOf 
 */
com.user = (function() {
    
    let _userInfo = null;

    return {
        /**
         * 사용자정보 데이터를 초기화 또는 수정한다.
         * @param {Object} iObj - 사용자 정보 객체
         * @param {boolean} bVal - true일 경우 기존 데이터 수정(Merge)
         */
        initialize: function(iObj, bVal) {
            if (!iObj || typeof iObj !== 'object') return;

            if (!_userInfo) {
                _userInfo = iObj;
                return;
            }

            if (bVal === true) {
                for (const key in iObj) {
                    if (iObj.hasOwnProperty(key)) {
                        _userInfo[key] = iObj[key];
                    }
                }
            }
        },

        /**
         * 사용자 정보를 조회한다.
         * @param {string} [sKey] - 특정 키 (생략 시 전체 객체 반환)
         */
        getUserProfile: function(sKey) {
            var data = _userInfo || {};

            if (typeof sKey !== 'undefined') {
                return data[sKey];
            }

            var rObj = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    rObj[key] = data[key];
                }
            }
            return rObj;
        },

        /**
         * 인스턴스를 소멸시켜 다시 초기화할 수 있도록 한다.
         */
        destructor: function() {
            _userInfo = null;
            return true;
        }
    };
}());