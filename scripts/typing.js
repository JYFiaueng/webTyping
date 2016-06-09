window.onload = function() {

	//---------------------------这里放全局使用的一些变量---------------------------------
	//初始文本
	var initStr = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus';
	var initTime = 30;
	var text = initStr;
	var fingerKeys = [" ","tgbrfv","edc","wsx","qaz", " ","yhnujm", "ik,","ol.","p;?\""];//键位指位
	var currCharIndex = 0;//字符数
	var strLength = 60;//每一行长度
	var course = {};//课程对象
	var run = false;//是否在打字
	var time = initTime;//完成此次打字所需时间
	var info = [];//课程练习记录
	var experience = 0;//用户所得经验值，由通过的课程的难度累加
	var passId = [];//通过的课程id号记录
	var alreadyId = [];//已经点开过的课程
	var kpm = 0;//击键率
	var kc = 0;//击键次数
	var Tkpm = 0;//击键正确率
	var kpmT = 0;//击键正确数，错一次减少一次
	var kpmAllTime = time;//击键总时间
	var nowId = -1;//现在正在练习的课程的id
	var randId = -1;//随机产生课程的id
	var t = -1;//setInterval的返回值记录
	var complete = false;//是否完成
	var pass = false;//是否通过
	var userStr = '';//用户自定义测试内容
	var userTime = 0;//用户自定义时间
	var failStr = '未完成';
	var winStr = '完成';
	var onLine = navigator.onLine;//是否在线
	var timeout = 5000;//请求超时值，本地测试改成5毫秒就能出现了
	var liBgcolor = 'rgba(100,200,150,0.7)';//li点击之后的背景色
	var userCourse = [];//用户自定义课程
	var userCount = -1;
	//-------------------这里放需要进行DOM操作的变量------------------
	var timerN =  Util.$('timer');
	var controllerN = Util.$('controller');
	var markN = Util.C$('mark')[0];
	var courseListN = Util.C$('courseList')[0];
	var changeCourseN = Util.$('changeCourse');
	var courseCloseN = Util.C$('close')[0];
	var textN = Util.$("text");
	var randomId = Util.$("randomId");
	var kpmN = Util.$('kpm');
	var rate = Util.$('accurate-rate');
	var markNhistory = Util.C$('mark')[1];
	var courseListNhistory = Util.C$('courseList')[1];
	var courseCloseNhistory = Util.C$('close')[1];
	var historyN = Util.$('history');
	var experienceN = Util.$('experience');
	var passN = Util.$('pass');
	var divBtnN = Util.C$('DivBtn')[0];
	var toggleN = Util.$('toggle');
	var markNuser = Util.C$('mark')[2];
	var courseCloseNuser = Util.C$('close')[2];
	var userDefineN = Util.$('userDefine');
	var userSureN = Util.$('userSure');
	var userTextN = Util.$('userText');
	var userTimeN = Util.$('userTime');
	var markNcookie = Util.C$('mark')[3];
	var welcomeN = Util.$('Welcome');
	var userHistoryN = Util.$('userHistory');
	var userHistoryMarkN = Util.C$('mark')[4];
	var userHistoryCourseListN = Util.C$('courseList')[2];
	var userHistoryCourseCloseN = Util.C$('close')[3];
	//-----------------这里放一些功能型函数-------------------
	//文本重置
	var loadText = function(text, container, lineWidth) {
		var p = null;
		container.innerHTML = '';
		for (var i = 0; i < text.length; i++) {
			if (i % lineWidth === 0) {
				p = document.createElement("p");
				container.appendChild(p);
			}
			var span = document.createElement("span");
			span.innerHTML = text[i]==" "? "&nbsp;" : text[i];
			p.appendChild(span);
		}
	};
	//字符判断
	var selectChar = function(currCharIndex, error) {
		var charSpans = Util.T$("span",textN);
		var i = currCharIndex > 0 ? currCharIndex - 1: currCharIndex;
		var cl = currCharIndex + 1;
		var tl = text.length;
		for ( ; i <= cl && i < tl; i++){
			if (charSpans[i].className === "current"){
				charSpans[i].className = "";
			}
		}
		if(currCharIndex === tl){
			return;
		}
		if (error){
			kpmT++;//错几次减几次
			charSpans[currCharIndex].className = "error";
		}
		else{
			charSpans[currCharIndex].className = "current";
		}
	};
	//更改键位
	var selectKey = function(currCharIndex) {
		if(currCharIndex === text.length){
			return;
		}
		var keys = Util.C$("key",Util.$("keyboard"));
		for (var i = 0; i < keys.length; i++){
			if (keys[i].className.indexOf("current") != -1){
				keys[i].className = keys[i].className.replace(" current", "");
			}
			var currChar = text[currCharIndex].toUpperCase();
			var keyChar = keys[i].innerHTML;
			if (keyChar == currChar || keyChar[0] == currChar || keyChar[5] == currChar){
				keys[i].className += " current";
			}
		}
	};
	//更改指头
	var selectFinger = function(currCharIndex) {
		if(currCharIndex === text.length){
			return;
		}
		var currChar = text[currCharIndex];
		var leftHand = Util.$("left-hand");
		var rightHand = Util.$("right-hand");
		leftHand.className = "";
		rightHand.className = "";
		for (var i = 0; i <fingerKeys.length; i++){
			if (fingerKeys[i].indexOf(currChar) != -1){	
				var hand = leftHand;
				if (Math.floor(i / 5) == 1 ){
					hand = rightHand;
				}
				hand.className="finger-" + (i % 5 + 1);
			}
		}
	};
	//练习记录
	var infoPush = function(){
		var c = {};
		c.id = nowId;
		c.kpm = kpm;
		c.Tkpm = Tkpm;
		c.pass = pass;
		info.push(c);
		var li = document.createElement('li');
		li.id = 'his'+c.id;
		li.innerHTML = '<br/>课程号:'+c.id+'<br/>kpm:'+c.kpm+'次/分<br/>正确率:'+c.Tkpm+'<br/>通过?'+(c.pass?'是':'否');
		courseListNhistory.appendChild(li);
	};
	//是否在线，传入一个不再线的回调函数，暂时不用
	// var isOnLine = function(fn){
	// 	if(onLine){
	// 		fn();
	// 	}
	// };
	//用户自定义练习记录
	var userInfoPush = function(t, s){
		var c = {};
		c.id = userCount;
		c.time = t;
		c.content = s;
		userCourse.push(c);
		localStorage.setItem('uC', JSON.stringify(userCourse));
		var li = document.createElement('li');
		li.id = 'user'+c.id;
		li.innerHTML = '<br/>自定义号:'+c.id+'<br/>time:'+c.time;
		userHistoryCourseListN.appendChild(li);
	};
	//倒计时
	var countDown = function(){
		if(run){
			t = setInterval(function(){
				if(time === 0){
					timerN.innerHTML = failStr;
					if(nowId !== -1){
						infoPush();
					}
					clearInterval(t);
					complete = true;
					stop();
					return;
				}
				time--;
				kpm = parseInt(kc / ((kpmAllTime - time)/60));
				kpmN.innerHTML = kpm;
				if(currCharIndex !== 0){
					Tkpm = parseInt((currCharIndex-kpmT)/currCharIndex*100)+'%';
					rate.innerHTML = Tkpm;
				}
				timerN.innerHTML = Math.floor(time/60)+':'+time%60;
			}, 900);
		}else{
			timerN.innerHTML = Math.floor(time/60)+':'+time%60;
			clearInterval(t);
			t = -1;
		}
	};
	//课程请求成功
	var ajaxSuccess = function(data){
		var li = null, str = '';
		course = JSON.parse(data);
		for(var i = 0,len = course.length; i < len; i++){
			str += '<br/>标题'+course[i].title+'<br/>时间'+course[i].time+'<br/>难度'+course[i].difficulty;
			li = document.createElement('li');
			li.innerHTML = str;
			li.id = course[i].id;
			courseListN.appendChild(li);
			str = '';
		}
	};
	//请求超时回调函数
	var timeoutFn = function(){
		alert('请求超时，网不好!');
	};
	//课程请求失败
	var ajaxFailure = function(){
		alert('课程列表拉取失败，请尝试刷新页面或查看网络连接是否正常!');
	};
	//开始打字的处理函数
	var stop = function(){
		run = false;
		if(complete){
			controllerN.value = '回车重来此局';
		}else{
			controllerN.value = '回车开始';
		}
	};
	//停止打字的处理函数
	var start = function(){
		run = true;
		controllerN.value = '回车停止';
	};
	//运行控制
	var controller = function(e){
		if(run && !complete){
			stop();
		}else if(!run && complete){
			complete = false;
			if(nowId === -1){
				resetting(userStr===''?initStr:userStr, userTime===0?initTime:userTime);
			}else{
				resetting(course[nowId].content, course[nowId].time);
			}
		}else if(run && complete){

		}else if(!run && !complete){
			start();
		}
		countDown();
	};
	//界面更新
	var updateView = function(){
		selectChar(currCharIndex);
		selectKey(currCharIndex);
		selectFinger(currCharIndex);
	};
	var resetting = function(Rtext, Rtime){
		text = Rtext;
		time = Rtime;
		currCharIndex = 0;
		kpm = 0;//击键率
		kc = 0;//击键次数
		Tkpm = 0;//击键正确率
		kpmT = 0;//击键正确数，错一次减少一次
		kpmAllTime = time;//击键总时间
		kpmN.innerHTML = '0';
		pass = false;
		rate.innerHTML = '0%';
		stop();
		countDown();
		loadText(text, textN, strLength);
		updateView();
	};
	//用户足迹记录
	var welcomeCookie = function(){
		if(Util.CookieUtil.get('come')){
			welcomeN.innerHTML = '欢迎回来';
			Util.show(markNcookie);
			setTimeout(function(){
				Util.hidden(markNcookie);
			}, 1500);
		}else{
			// console.log(new Date('2016/12/30'));
			var exp = 'Fri Dec 30 2016 00:00:00 GMT+0800 (中国标准时间)';
			Util.CookieUtil.set( 'come', 'yes', new Date(exp));
			welcomeN.innerHTML = '欢迎来到网页打字通';
			Util.show(markNcookie);
			setTimeout(function(){
				Util.hidden(markNcookie);
			}, 2000);
		}
	};
	var localUserDefine = function(){
		if( localStorage.getItem('uC') ){
			userCourse = JSON.parse(localStorage.getItem('uC'));
		}else{
			userCourse = [];
		}
		userCount = userCourse.length - 1;
		for(var i = 0; i <= userCount; i++){
			var li = document.createElement('li');
			li.id = 'user'+userCourse[i].id;
			li.innerHTML = '<br/>自定义号:'+li.id+'<br/>time:'+userCourse[i].time;
			userHistoryCourseListN.appendChild(li);
		}
	};
	//首次声明
	var init = function(){
		Util.ajaxGet('data/data.json', ajaxSuccess, ajaxFailure, timeout, timeoutFn);
		welcomeCookie();
		localUserDefine();
		loadText(text, textN, strLength);
		updateView();
		countDown();
	};
	//-------------------------------事件绑定区-------------------------------
	changeCourseN.onclick = function(){
		Util.show(markN);
	};
	courseCloseN.onclick = function(){
		Util.hidden(markN);
	};
	courseListN.onclick = function(e){
		if(e.target.id){
			nowId = e.target.id;
			complete = false;
			resetting(course[nowId].content, course[nowId].time);
			Util.hidden(markN);
			alreadyId[nowId] = 1;
			e.target.style.backgroundColor = liBgcolor;
		}
	};
	courseCloseNhistory.onclick = function(){
		Util.hidden(markNhistory);
	};
	historyN.onclick = function(){
		Util.show(markNhistory);
	};
	courseListNhistory.onclick = function(e){
		if(e.target.id){
			nowId = e.target.id.substring(3);
			complete = false;
			resetting(course[nowId].content, course[nowId].time);
			Util.hidden(markNhistory);
			alreadyId[nowId] = 1;
		}
	};
	courseCloseNuser.onclick = function(){
		Util.hidden(markNuser);
		userTextN.value = '';
		userTimeN.value = '';
	};
	userDefineN.onclick = function(){
		Util.show(markNuser);
	};
	userSureN.onclick = function(){
		userStr = userTextN.value;
		userTime = parseInt(userTimeN.value);
		if(userStr.length > 300 || userStr.length < 1){
			alert('长度不对');
			return;
		}
		if(!!!userTime){
			alert('时间不对');
			userTimeN.value = '';
			return;
		}
		if(userTime > 300 || userTime < 1){
			alert('时间不对');
			userTimeN.value = '';
			return;
		}
		complete = false;
		nowId = -1;
		userCount++;
		userInfoPush(userTime, userStr);
		resetting(userStr, userTime);
		Util.hidden(markNuser);
		userTextN.value = '';
		userTimeN.value = '';
	};
	userHistoryN.onclick = function(){
		Util.show(userHistoryMarkN);
	};
	userHistoryCourseCloseN.onclick = function(){
		Util.hidden(userHistoryMarkN);
	};
	userHistoryCourseListN.onclick = function(e){
		if(e.target.id){
			nowId = -1;
			var userId = e.target.id.substring(4);
			complete = false;
			resetting(userCourse[userId].content, userCourse[userId].time);
			Util.hidden(userHistoryMarkN);
		}
	};
	randomId.onclick = function(){
		randId = parseInt(Math.random()*(course.length-1));
		if(!course[randId]){
			return;
		}
		nowId = randId;
		complete = false;
		resetting(course[nowId].content, course[nowId].time);
		alreadyId[randId] = 1;
		Util.$(randId).style.backgroundColor = liBgcolor;
	};
	// markN.onclick = function(){
	// 	Util.hidden(markN);
	// };
	// markNhistory.onclick = function(){
	// 	Util.hidden(markNhistory);
	// };
	// markNuser.onclick = function(){
	// 	Util.hidden(markNuser);
	// 	userTextN.value = '';
	// 	userTimeN.value = '';
	// };
	document.onkeypress = function(event) {
		if(!run){
			return;
		}
		var keyCode = event.keyCode || event.which || event.charCode;
		var keyChar = String.fromCharCode(keyCode);
		// console.log(keyCode);
		if(keyCode === 13 || keyCode === 8){
			return;
		}
		if (text[currCharIndex] != keyChar){
			selectChar(currCharIndex, true);
		}
		else{
			selectChar(currCharIndex);
		}
		if (currCharIndex <= text.length - 1){
			currCharIndex++;
		}
		//打完了
		if(currCharIndex === text.length){
			selectChar(currCharIndex);
			if(time > 0){//规定时间内敲完了
				time = 0;
				complete = true;
				stop();
				countDown();
				timerN.innerHTML = winStr;
				if(Tkpm === '100%'){//此课程通过
					pass = true;
					if(!passId[nowId] && nowId !== -1){
						experience += course[nowId].difficulty;
						experienceN.value = '经验值:'+experience;
						passN.value += (nowId+'|');
					}
					passId[nowId] = 1;
				}
				if(nowId !== -1){
					infoPush();
				}
			}
			stop();
		}else{
			updateView();
		}
		kc++;//记录有效击键次数
	};

	document.onkeydown = function(event) {
		var keyCode = event.keyCode || event.which || event.charCode;
		switch(keyCode){
			case 13: controller();break;
			default: break;
		}
		updateView();
	};

	toggleN.onclick = (function(){
		var toggle = true;
		return function(){
			if(toggle){
				Util.animate(divBtnN, 'top', -440);
				toggleN.value = '展开';
				toggle = false;
			}else{
				Util.animate(divBtnN, 'top', 20);
				toggleN.value = '隐藏';
				toggle = true;
			}
		};
	})();

	init();
};