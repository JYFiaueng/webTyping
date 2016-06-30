window.onload = function() {

//////////////////------------------这里放全局使用的一些变量----------------------
	var initStr = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus';//初始文本
	var initTime = 30;//初始时间
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
	var timeout = 10000;//请求超时值
	var liBgcolor = 'rgba(100,200,150,0.7)';//li点击之后的背景色
	var userCourse = [];//用户自定义课程
	var userCount = -1;//用户自定义课程id
	var log = [];//日志记录对象，记录用户按每个键的时间戳和对应键，一个按键回放功能
	var logKCount = 0;//日志记录的次数，就是log的长度
	var isPlayback = false;//当前是否正在回放练习
	var controllerSpace = true;//解决禁掉浏览器默认空格快捷键之后用户自定义文本框无法输入空格的问题
	var markNowEnter = false;//标示当前处于遮罩状态回车无效
	var RegExpNoChinaChar = /[\u4e00-\u9fa5]+/;//是汉字的正则
	var RegExpBeginNoZeroNumber = /^[1-9]\d+$/;//开头不为0的一串数字的正则
////////////////-------------------这里放需要进行DOM操作的变量------------------
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
	var clearUserInfoN = Util.$('clearUserInfo');
	var playbackN = Util.$('playback');
//////////////-----------------这里放一些功能型函数-------------------
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
	//练习记录，练习一次添加一次，有两次调用，分别是练习通过和未通过的时候
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
		li.innerHTML = '<span class="userDelLi">×</span>'+'<br/>自定义号:'+c.id+'<br/>time:'+c.time;
		userHistoryCourseListN.appendChild(li);
	};
	//清空用户的本地练习记录
	var clearUserInfo = function(){
		localStorage.removeItem('uC');
		userCourse = [];
		userHistoryCourseListN.innerHTML = '';
	};
	//删除用户的某一个本地练习记录
	var delUserInfo = function(delId){
		for(var i = delId; i < userCourse.length-2; i++){
			userCourse[i] = userCourse[i+1];
		}
		userCourse.length = userCourse.length-1;
		//删除一项之后重新写入读取一次本地数据
		userHistoryCourseListN.innerHTML = '';
		localStorage.setItem('uC', JSON.stringify(userCourse));
		localUserDefine();
	};
	//倒计时
	var countDown = function(){
		if(run){
			t = setInterval(function(){
				//如果限定的时间已经到了本次练习直接停止
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
				//如果一开始就算Tkpm，currCharIndex就会出现除数为0的情况，所以加个判断
				if(currCharIndex !== 0){
					Tkpm = parseInt((currCharIndex-kpmT)/currCharIndex*100)+'%';
					rate.innerHTML = Tkpm;
				}
				timerN.innerHTML = Math.floor(time/60)+':'+time%60;
			}, 980);
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
		alert('请求超时，没有拉取到课程列表，请刷新或玩一玩自定义练习!');
	};
	//课程请求失败
	var ajaxFailure = function(){
		alert('课程列表拉取失败，请尝试刷新页面或查看网络连接是否正常!');
	};
	//开始打字的处理函数
	var stop = function(){
		run = false;
		if(complete){
			controllerN.value = '回车重来';
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
	//重置函数，这里重置所有有关变量和函数开始新的一次练习
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
		pass = false;//是否通过
		rate.innerHTML = '0%';
		log = [];//击键记录
		logKCount = 0;//击键次数记录
		stop();
		countDown();
		loadText(text, textN, strLength);
		updateView();
	};
	//用户足迹记录，添加一个cookie，检测用户来过没有
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
	//初次加载时检测浏览器是否保存了用户自定义练习的数据
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
			li.innerHTML = '<span class="userDelLi">×</span>'+'<br/>自定义号:'+li.id+'<br/>time:'+userCourse[i].time;
			userHistoryCourseListN.appendChild(li);
		}
	};
	//首次声明
	var init = function(){
		Util.ajaxGet('data/data.json', ajaxSuccess, ajaxFailure, timeout, timeoutFn);
		localUserDefine();
		loadText(text, textN, strLength);
		updateView();
		countDown();
	};
	//用于回放的击键记录函数
	var keyNote = function(keycode){
		var logK = {};
		logK.k = keycode;
		logK.t = +new Date();
		log[logKCount] = logK;
		logKCount++;
	};
	//回放功能实现，回放上一次的按键过程
	var playback = function(){
		if(logKCount === 0){
			return;
		}
		//当练习到一半回车暂停时无法点击回放
		if(!run && !complete){
			return;
		}
		//正在练习过程中点击回放无效
		if(run && !complete){
			return;
		}
		//把log里面的东西全部复制一遍，用其副本来进行回放，其原本会在每次controller()时重置
		var logKCountCopy = logKCount;
		var logCopy = [];
		for(var j = 0; j < logKCountCopy; j++){
			var logKCopy = {};
			logKCopy.t = log[j].t;
			logKCopy.k = log[j].k;
			logCopy[j] = logKCopy;
		}
		controller();
		var event = {};
		var i = 0;
		var timeDifference = 0;
		//触发一次回车开始，模拟用户按键
		event.keyCode = 13;
		okd(event);
		isPlayback = true;
		//根据两次按键的时间差来进行回放
		var pb = function(){
			//这的主要目的就是为了解决用户在练习期间回车暂停的问题
			//由于回放是根据时间来的，所以用户暂停后时间就不对了
			//原来只是将有效击键记录了下来，现在将回车也进行了记录
			//这里判断的就是如果是两次连续的回车，就将回车之间的时间差置为0
			//这样就去掉了在回放时将用户暂停的时间也进行回放的问题
			if(logCopy[i].k === 13 && logCopy[i+1].k === 13){
				timeDifference = 0;
			}else{
				event.keyCode = logCopy[i].k;
				okp(event);
				if(i+1 === logKCountCopy){
					isPlayback = false;
					return;
				}
				timeDifference = logCopy[i+1].t - logCopy[i].t;
			}
			i++;
			setTimeout(pb, timeDifference);
		};
		setTimeout(pb, 0);
	};
	//此函数的作用是为了在用户练习期间点击了按钮，那么就将练习停止
	//不然的话点击了按钮出来遮罩层练习的倒计时还在进行中
	var clickBtnStop = function(){
		if(run){
			controller();
		}
		keyNote(13);
	};
	//此函数是为了解决在回放的时候点击其他按钮导致回放结束的问题，但这不是根本的解决方法
	//这样只是在回放的时候禁止用户的点击，最好的效果是点击其他按钮暂停回放，关闭遮罩之后继续回放
	//好的效果没想到什么好的解决办法，所以只能强制不让点击了，⊙﹏⊙‖∣
	var isPlaybackFn = function(){
		if(isPlayback){
			return true;
		}else{
			return false;
		}
	};
	//-------------------------------事件绑定区-------------------------------
	//选择课程的显示隐藏
	changeCourseN.onclick = function(){
		if(isPlaybackFn()){
			return;
		}
		markNowEnter = true;
		Util.show(markN);
		clickBtnStop();
	};
	courseCloseN.onclick = function(){
		Util.hidden(markN);
		markNowEnter = false;
	};
	//点击选择课程列表开始对应的课程
	courseListN.onclick = function(e){
		if(e.target.id){
			nowId = e.target.id;
			complete = false;
			resetting(course[nowId].content, course[nowId].time);
			Util.hidden(markN);
			markNowEnter = false;
			alreadyId[nowId] = 1;
			e.target.style.backgroundColor = liBgcolor;
		}
	};
	//历史记录的显示隐藏
	courseCloseNhistory.onclick = function(){
		Util.hidden(markNhistory);
		markNowEnter = false;
	};
	historyN.onclick = function(){
		if(isPlaybackFn()){
			return;
		}
		markNowEnter = true;
		Util.show(markNhistory);
		clickBtnStop();
	};
	//点击历史记录列表开始对应的课程
	courseListNhistory.onclick = function(e){
		if(e.target.id){
			nowId = e.target.id.substring(3);
			complete = false;
			resetting(course[nowId].content, course[nowId].time);
			Util.hidden(markNhistory);
			markNowEnter = false;
			alreadyId[nowId] = 1;
		}
	};
	//自定义练习的显示隐藏
	courseCloseNuser.onclick = function(){
		Util.hidden(markNuser);
		controllerSpace = true;//置为true屏蔽浏览器的默认空格事件
		userTextN.value = '';
		userTimeN.value = '';
		markNowEnter = false;
	};
	userDefineN.onclick = function(){
		if(isPlaybackFn()){
			return;
		}
		controllerSpace = false;//置为false让用户可以输入空格
		Util.show(markNuser);
		markNowEnter = true;
		clickBtnStop();
	};
	//添加自定义练习
	userSureN.onclick = function(){
		userStr = userTextN.value;
		if(userStr.length > 300 || userStr.length < 1){
			alert('长度不对');
			return;
		}
		if(RegExpNoChinaChar.test(userStr)){
			alert('不能包含汉字');
			return;
		}
		if(!RegExpBeginNoZeroNumber.test(userTimeN.value)){
			alert('时间只能是数字，开头不能为0');
			userTimeN.value = '';
			return;
		}
		userTime = parseInt(userTimeN.value);
		if(!!!userTime){
			alert('无法转为整数');
			userTimeN.value = '';
			return;
		}
		if(userTime > 300 || userTime < 1){
			alert('超过300了');
			userTimeN.value = '';
			return;
		}
		complete = false;
		nowId = -1;
		userCount++;
		userInfoPush(userTime, userStr);
		resetting(userStr, userTime);
		Util.hidden(markNuser);
		markNowEnter = false;
		controllerSpace = true;//置为true屏蔽浏览器的默认空格事件
		userTextN.value = '';
		userTimeN.value = '';
	};
	//自定义历史的显示隐藏
	userHistoryN.onclick = function(){
		if(isPlaybackFn()){
			return;
		}
		Util.show(userHistoryMarkN);
		markNowEnter = true;
		clickBtnStop();
	};
	userHistoryCourseCloseN.onclick = function(){
		Util.hidden(userHistoryMarkN);
		markNowEnter = false;
	};
	//用户自定义课程列表
	userHistoryCourseListN.onclick = function(e){
		//点击的是X，就删除
		if(e.target.className){
			var delId = e.target.id.substring(4);
			delUserInfo(delId);
		}
		//点击的是课程就加载
		if(e.target.id){
			nowId = -1;
			var userId = e.target.id.substring(4);
			complete = false;
			userStr = userCourse[userId].content;
			userTime = userCourse[userId].time;
			resetting(userCourse[userId].content, userCourse[userId].time);
			Util.hidden(userHistoryMarkN);
			markNowEnter = false;
		}
	};
	//清空自定义练习
	clearUserInfoN.onclick = function(){
		clearUserInfo();
	};
	//随机课程绑定
	randomId.onclick = function(){
		if(isPlaybackFn()){
			return;
		}
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
	//回放绑定
	playbackN.onclick = playback;

	//当前页面是否被隐藏
	// console.log(Util.pageVisibility.hidden);
	//页面的当前状态
	// console.log(Util.pageVisibility.visibilityState);
	//当页面可见状态发生变化时触发此事件，如果用户当前正处于打字状态，页面状态变化之后就停下
	Util.pageVisibility.visibilitychange(function(){
		if(isPlaybackFn()){
			return;
		}
		if(run && !complete){
			console.log('窗口可见性变化');
			stop();
			keyNote(13);
			countDown();
		}
	});

	var okp = function(event) {
		console.log(event.keyCode || event.which || event.charCode);
		if(!run){
			return;
		}
		var keyCode = event.keyCode || event.which || event.charCode;
		var keyChar = String.fromCharCode(keyCode);
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
			selectChar(currCharIndex);//去掉最后一个绿格
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
		//下面是击键时间和顺序记录
		keyNote(keyCode);
	};

	document.onkeypress = okp;
	//直接将okp写在后面监听不到空格，不知道为什么，所以在onkeydown里面case一下，直接调用传入事件对象
	//虽然通过这种方式能够完成功能，但是还是没有解决onkeydown监听不到空格的问题，坑

	var okd = function(event) {
		var keyCode = event.keyCode || event.which || event.charCode;
		if(keyCode === 32 && controllerSpace){
        	event.preventDefault();//屏蔽浏览器默认的空格快捷功能，
        	//虽然能够做到屏蔽快捷键的能力，但是在自定义练习的文本框中添加文本时就没法敲空格了
		}
		if(isPlaybackFn()){
			return;
		}
		if(markNowEnter){
			return;
		}
		switch(keyCode){
			case 13: keyNote(13);controller();break;
			case 32: okp(event);break;
			default: break;
		}
		updateView();
	};

	document.onkeydown = okd;

	toggleN.onclick = (function(){
		var toggle = true;
		return function(){
			if(toggle){
				Util.animate(divBtnN, 'top', -490);
				toggleN.value = '展开';
				toggle = false;
			}else{
				Util.animate(divBtnN, 'top', 20);
				toggleN.value = '隐藏';
				toggle = true;
			}
		};
	})();
	welcomeCookie();
	init();
};