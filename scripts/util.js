var Util = {
	//id
	$: function(id) {		
		return this._getContext(arguments).getElementById(id);
	},
	//元素
	T$: function(tagName) {
		return this._getContext(arguments).getElementsByTagName(tagName);
	},
	//类
	C$: function(className) {
		return this._getContext(arguments).getElementsByClassName(className);		
	},
	$$: function(str){
		return this._getContext(arguments).querySelectorAll(str);
	},
	//单例
	getSingle: function(fn){
		var result;
		return function(){
			return result || ( result = fn.apply(this, arguments) );
		};
	},
	show: function(ele){
		ele.style.display = 'block';
	},
	hidden: function(ele){
		ele.style.display = 'none';
	},
	animate: function(ele, attr, val){
		var v = parseInt(ele.style[attr]);
		var vv = v>val?-3:3;
		var t = setInterval(function(){
			if(vv < 0){
				if(val > v){
					clearInterval(t);
				}
			}else{
				if(val < v){
					clearInterval(t);
				}
			}
			v += vv;
			ele.style[attr] = v+'px';
		}, 1);
	},
	//创建XHR
	createXHR: function() {
		var xhr = null;
		if (window.XMLHttpRequest){
			xhr = new XMLHttpRequest();
		}
		else{
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		return xhr;
	},
	//发起get请求
	ajaxGet: function(url, onsuccess, onfailure, time, timeoutFn) {
		var xhr = this.createXHR();
		xhr.open("GET", url);
		xhr.timeout = time;
		xhr.ontimeout = timeoutFn;
		xhr.send();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200){
				if (typeof(onsuccess) == "function"){
					if (xhr.responseXML === null){
						onsuccess(xhr.responseText);
					}else{
						onsuccess(xhr.responseXML);
					}					
				}
			}else if (xhr.status == 404){
				if (typeof(onfailure) == "function"){
					onfailure();
				}
			}
		};
	},
	//AJAX 加载方法：将指定URL的内容加载到指定ID的HTML元素中
	//url: 所请求资源的URL地址
	//containerId: 要更新其内容的HTML元素的id属性值
	//onfailure: 请求失败是，要调用（执行）的回调函数
	load: function(url, containerId, onfailure) {
		var container = this.$(containerId);
		
		this.ajaxGet(url,function(responseText){		
			container.innerHTML = responseText;			
		}, onfailure);
	},
	
	_getContext : function (args) {
		var context = document;
		if (args.length > 1)
		{
			context = args[1];
		}
		return context;
	},

	CookieUtil: {
		get: function(name){
			var cookieName = encodeURIComponent(name) + '=',
				cookieStart = document.cookie.indexOf(cookieName),
				cookieValue = null;
			if(cookieStart > -1){
				var cookieEnd = document.cookie.indexOf(';', cookieStart);
				if(cookieEnd == -1){
					cookieEnd = document.cookie.length;
				}
				cookieValue = decodeURIComponent(document.cookie.substring(cookieStart+cookieName.length, cookieEnd));
			}
			return cookieValue;
		},
		set: function(name, value, expires, path, domain, secure){
			var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
			if(expires instanceof Date){
				cookieText += '; expires=' + expires.toGMTString();
			}
			if(path){
				cookieText += '; path=' + path;
			}
			if(domain){
				cookieText += '; domain=' + domain;
			}
			if(secure){
				cookieText += '; secure';
			}
			document.cookie = cookieText;
		},
		unset: function(name, path, domain, secure){
			this.set(name, '', new Date(0), path, domain, secure);
		},
	},
	//网页可见性API
	pageVisibility: (function(){
		var prefixSupport, keyWithPrefix = function(prefix, key) {
			if (prefix !== "") {
			// 首字母大写
				return prefix + key.slice(0,1).toUpperCase() + key.slice(1);
			}
			return key;
		};
		var isPageVisibilitySupport = (function(){
			var support = false;
			if (typeof window.screenX === "number") {
				["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
					if (support == false && document[keyWithPrefix(prefix, "hidden")] != undefined) {
						prefixSupport = prefix;
						support = true;
					}
				});
			}
			return support;
		})();

		var isHidden = function() {
			if (isPageVisibilitySupport) {
				return document[keyWithPrefix(prefixSupport, "hidden")];
			}
			return undefined;
		};

		var visibilityState = function() {
			if (isPageVisibilitySupport) {
				return document[keyWithPrefix(prefixSupport, "visibilityState")];
			}
			return undefined;
		};

		return {
			hidden: isHidden(),//是否可见
			visibilityState: visibilityState(),//现在状态
			visibilitychange: function(fn, usecapture) {//绑定可见性变化事件
				usecapture = undefined || false;
				if (isPageVisibilitySupport && typeof fn === "function") {
					return document.addEventListener(prefixSupport + "visibilitychange", function(evt) {
						this.hidden = isHidden();
						this.visibilityState = visibilityState();
						fn.call(this, evt);
					}.bind(this), usecapture);
				}
				return undefined;
			}
		};
	})(undefined),

};