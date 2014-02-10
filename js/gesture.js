/**
 * @author liming17
 */
var testgesture = function(targetObj){
	var util = {
		'query2json': function(query){
			var rs = {};
			var pairs = query.split('&');
			for(var i=0; i<pairs.length; i++){
				var kv = pairs[i].split('=');
				if(kv.length>1){
					if(rs[kv[0]]){
						rs[kv[0]] = [].concat(rs[kv[0]]);
						rs[kv[0]].push(kv[1]);
					}
					else{
						rs[kv[0]] = kv[1];
					}
				}
			}
			return rs;
		},
		'isEmpty': function(o){
			for(var k in o){
				if(o.hasOwnProperty(k)){
					return false;
				}
			}
			return true;
		},
		'getTime': function(){
			return Date.now() || new Date().getTime();
		},
		'isTouch' : function(){
			return window.hasOwnProperty('ontouchstart');
		},
		'hasGesture': function(){
			return window.hasOwnProperty('ongesturestart');
		},
		'clone': function(jsonObj){
			var buf;
			if (jsonObj instanceof Array) {
				buf = [];
				var i = jsonObj.length;
				while (i--) {
					buf[i] = util.clone(jsonObj[i]);
				}
				return buf;
			} else if (jsonObj instanceof Object) {
				buf = {};
				for (var k in jsonObj) {
					buf[k] = util.clone(jsonObj[k]);
				}
				return buf;
			} else {
				return jsonObj;
			}
		},
		'objLength': function(obj){
			if(obj instanceof Object){
				var num = 0;
				for(var i in obj){
					num++;
				}
				return num;
			}
		},
		'getDistance': function(x1, y1, x2, y2){
			return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); 
		},
		//使用screenXY来作为标点。(x1,y1)是起点，(x2,y2)是终点，与x正轴所成的角度，逆时针计算
		'getAngle': function(x1, y1, x2, y2){
			if(x1==x2 && y1==y2){
				return;
			}
			var angle = Math.atan((y1-y2)/(x1-x2))*(180/Math.PI);
			if(y1>y2){
				if(x1<x2){
					angle = -angle;
				}
				else if(x1>x2){
					angle = 180-angle;
				}
				else{
					angle = 90;
				}
			}
			else if(y1<y2){
				if(x1<x2){
					angle = 360-angle;
				}
				else if(x1>x2){
					angle = 180-angle;
				}
				else{
					angle = 270;
				}
			}
			else{
				if(x1<x2){
					angle = 0;
				}
				else if(x1>x2){
					angle = 180;
				}
			}
			return angle;
		}
	}
	var evts = {
		'addEvent' : function(el, type, fn){
		    if (el == null) {
		        return false;
		    }
		    if (typeof fn !== "function") {
		        return false;
		    }
	        if (el.addEventListener) {
	            el.addEventListener(type, fn, false);
	        } else if (el.attachEvent) {
	            el.attachEvent('on' + type, fn);
	        } else {
	            el['on' + type] = fn;
	        }
	        return true;
		},
		'removeEvent' : function(el, type, fn){
			if (el == null) {
	            return false;
	        }
	        if (typeof fn !== "function") {
	            return false;
	        }
	        if (el.removeEventListener) {
	            el.removeEventListener(type, fn, false);
	        } else if (el.detachEvent) {
	            el.detachEvent("on" + type, fn);
	        }
	        el['on' + type] = null;
	        return true;
		},
		'stopEvent' : function(e){
			e = e || window.event;
			if (e.preventDefault) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
				e.returnValue = false;
			}
		},
		'custEvent' : (function(){
			var custEventCache = [];
			
			var findCacheObj = function(obj){
				for(var i = 0; i< custEventCache.length; i++){
					if(custEventCache[i].obj == obj){
						return custEventCache[i];
					}
				}
				return false;
			}
			
			var findCacheFunc = function(obj, evtName){
				var _obj = findCacheObj(obj);
				if(!(evtName in _obj.func)){
					_obj.func[evtName] = [];
				}
				return _obj.func[evtName];
			}
			
			var that = {
				'define' : function(obj, evtList){
					evtList = [].concat(evtList);
					var _obj = findCacheObj(obj);
					if(_obj){
						for(var i = 0; i< evtList.length; i++){
							if(!(evtList[i] in _obj.func)){
								_obj.func[evtList[i]] = [];
							}
							else{
								//已经注册该事件
							}
						}
					}
					else{
						var custObj = {
							'obj' : obj,
							'func' : {
								
							}
						};
						for(var i = 0; i< evtList.length; i++){
							custObj.func[evtList[i]] = [];
						}
						custEventCache.push(custObj);
					}
				},
				'undefine' : function(obj, evtList){
					evtList = [].concat(evtList);
					var _obj = findCacheObj(obj);
					for(var i= 0; i< evtList.length; i++){
						if(evtList[i] in _obj.func){
							delete _obj.func[evtList[i]];
						}
					}
					// 全部undefine后清除该obj
					// if(util.isEmpty(_obj.func)){
// 						
					// }
				},
				'add' : function(obj, evtName, fn, defaultData, once){
					var func = findCacheFunc(obj, evtName);
					var funcObj = {
						'fn': fn,
						'defaultData': defaultData,
						'once': once
					};
					func.push(funcObj);
				},
				'remove' : function(obj, evtName, fn){
					var func = findCacheFunc(obj, evtName);
					for(var i = 0; i< func.length; i++){
						if(func[i].fn == fn){
							func.splice(i,1);
						}
					}
				},
				'fire' : function(obj, evtName, data, defaultFunc){
					var func = findCacheFunc(obj, evtName);
					for(var i = 0; i< func.length; i++){
						var fn = func[i].fn;
						fn.apply(obj, [{obj: obj, type: evtName, data: func[i].defaultData}].concat(data));
						if(func[i].once){
							func.splice(i,1);
						}
					}
					defaultFunc && defaultFunc();
				},
				'getCache': function(){
					return custEventCache;
				}
			};
			return that;
		})(),
		'delegatedEvent' : function(actEl,exptEls){
			var evtList = {};
			var that = {};
			
			var fireEvent = function(e){
				var e = e || window.event;
				var el = e.srcElement || e.target;
				var type = e.type;
				var name;
				
				while(el && el !== actEl){
					if((name = el.getAttribute('action-type')) && evtList[type][name]){
						var arg = {
							'evt' : e,
							'el' : el,
							'box' : actEl,
							'data' : util.query2json(el.getAttribute('action-data') || '')
						}
						//执行方法，如果返回false，则停止冒泡
						var isbubble = true;
						for(var i=0;i<evtList[type][name].length;i++){
							isbubble = evtList[type][name][i](arg) & isbubble;
						}
						if(!isbubble){
							break;
						}
					}
					el = el.parentNode;	
				}
			}
			
			that.add = function(name, type, func){
				if(!evtList[type]){
					if(evts.addEvent(actEl, type, fireEvent)){
						evtList[type] = {};
						evtList[type][name] = [];
					}
				}
				evtList[type][name].push(func);
			}
			
			that.remove = function(name, type, func){
				if(evtList[type]){
					delete evtList[type][funcName];
					if(util.isEmpty(evtList[type])){
						delete evtList[type];
						evts.removeEvent(actEl, type, fireEvent);
					}
				}
			}
			
			return that;
		},
	};
	
	var istouch = util.isTouch();
	var hasgesture = util.hasGesture();
	
	var it = {
		'init': function(){
			it.bind();
		},
		'bind': function(){
			//custEvent define
			evts.custEvent.define(main, ['touchStart','touchMove','touchEnd','tap','doubleTap','touchLong']);
			
			//event bind
			evts.addEvent(targetObj, istouch? 'touchstart':'mousedown', it.evts.startAction);
			evts.addEvent(targetObj, istouch?'touchmove':'mousemove', it.evts.moveAction);
			evts.addEvent(targetObj, istouch?'touchend':'mouseup', it.evts.endAction);
			if(istouch){
				evts.addEvent(targetObj, 'touchcancel', it.evts.cancelAction);
			}
			if(hasgesture){
				evts.addEvent(targetObj, 'gesturestart', it.evts.gestureStart);
				evts.addEvent(targetObj, 'gesturechange', it.evts.gestureChange);
				evts.addEvent(targetObj, 'gestureend', it.evts.gestureEnd);
			}
		},
		'evts': {
			'startAction': function(e){
				e = istouch? e.changedTouches[0]:e;
				var unique = e.identifier || 'pc';
				var sf = new singleFinger(unique);
				sf.touchStart(e, sf);
				fingerdata[unique] = sf;
				//如果不支持手势事件
				if(!hasgesture){
					var length = util.objLength(fingerdata);
					if(length>2){
						it.evts.gestureStart();
					}
					else if(length==2){
						if(!fingerdata.hasOwnProperty('old')){
							it.evts.gestureStart();
						}
					}
				}
			},
			'moveAction': function(e){
				//evts.stopEvent(e);
				e = istouch? e.changedTouches[0]:e;
				var sf = fingerdata[e.identifier] || fingerdata['pc'];
				if(!sf) return;
				sf.touchMove(e);
				if(!hasgesture && gesturedata.fingerNum){
					it.evts.gestureChange();
				}
			},
			'endAction': function(e){
				e = istouch? e.changedTouches[0]:e;
				var sf = fingerdata[e.identifier] || fingerdata['pc'];
				if(!sf) return;
				sf.touchEnd(e);
				it.checkGesture.doubleTap(sf);
				fingerdata['old'] = sf;
				e.identifier? delete fingerdata[e.identifier] : delete fingerdata['pc'];
				setTimeout(function(){
					delete fingerdata['old'];
				},500);
				//如果不支持手势事件，模拟手势结束事件，只有所有手指离开屏幕才触发结束事件
				if(!hasgesture && gesturedata.fingerNum){
					var length = util.objLength(fingerdata);
					if(length==1){
						if(fingerdata.hasOwnProperty('old')){
							it.evts.gestureEnd();
						}
					}
				}
			},
			'cancelAction': function(e){
				e = istouch? e.changedTouches[0]:e;
				var sf = fingerdata[e.identifier] || fingerdata['pc'];
				if(!sf) return;
				clearTimeout(sf.longTap);
				e.identifier? delete fingerdata[e.identifier] : delete fingerdata['pc'];
			},
			'gestureStart': function(e){
				gesturedata.startData = [];
				var fingerNum = 0;
				for(var i in fingerdata){
					gesturedata.startData.push(fingerdata[i].touchData.startData);
					fingerNum++;
				}
				//这里会出现一个手指的原因是因为触发第二个手指的touchStart事件前有可能会先触发一次gestureStart事件，这个时候fingerNum只有一个
				if(fingerNum==1){
					//console.log(-1);
					return;
				}
				else if(fingerNum == 2){
					it.checkGesture.twoFinger(gesturedata);
				}
				else{
					delete gesturedata['startDistance'];
					delete gesturedata['startAngle'];
				}
				gesturedata.fingerNum = fingerNum;
				//console.log(gesturedata);
				evts.custEvent.fire(main, 'gestureStart', gesturedata);
			},
			'gestureChange': function(e){
				gesturedata.stopData = [];
				for(var i in fingerdata){
					gesturedata.stopData.push(fingerdata[i].touchData.stopData);
				}
				//console.log(gesturedata);
				if(e){
					gesturedata.rotation = e.rotation;
					gesturedata.scale = e.scale;
				}
				evts.custEvent.fire(main, 'gestureChange', gesturedata);
			},
			'gestureEnd': function(e){
				//有多少手指，就会触发多少次gestureEnd事件，只对第一次做操作
				if(!gesturedata.fingerNum){
					return;
				}
				if(!gesturedata.stopData){
					gesturedata.stopData = [];
					for(var i in fingerdata){
						gesturedata.stopData.push(fingerdata[i].touchData.stopData);
					}
				}
				if(gesturedata.fingerNum == 2){
					it.checkGesture.twoFinger(gesturedata);
				}
				if(e){
					gesturedata.rotation = e.rotation;
					gesturedata.scale = e.scale;
				}
				//console.log(gesturedata);
				evts.custEvent.fire(main, 'gestureEnd', gesturedata);
				gesturedata = {}; //清空手势数据
			}
		},
		'checkGesture': {
			'doubleTap': function(sf){
				if(fingerdata['old'] && fingerdata['old'].type=='1'){
					for(var i in fingerdata['old'].touchData.stopData){
						//允许误差在5以内
						if(i!='identifier' && i!='time' && Math.abs(fingerdata['old'].touchData.stopData[i] - sf.touchData.stopData[i]) > 5){
							return false;
						}
					}
					sf.type = 2;
					evts.custEvent.fire(main, 'doubleTap', sf.touchData);
					return true;
				}
				return false;
			},
			'twoFinger': function(gd){
				if(!gd.startDistance){
					gd.startDistance = util.getDistance(gd.startData[0].screenX,gd.startData[0].screenY,gd.startData[1].screenX,gd.startData[1].screenY);
					gd.startAngle = util.getAngle(gd.startData[0].screenX,gd.startData[0].screenY,gd.startData[1].screenX,gd.startData[1].screenY);
				}
				else{
					gd.stopDistance = util.getDistance(gd.stopData[0].screenX,gd.stopData[0].screenY,gd.stopData[1].screenX,gd.stopData[1].screenY);
					gd.stopAngle = util.getAngle(gd.stopData[0].screenX,gd.stopData[0].screenY,gd.stopData[1].screenX,gd.stopData[1].screenY);
					gd.rotation = gd.stopAngle - gd.startAngle;
					gd.scale = gd.stopDistance - gd.startDistance;
					if(Math.abs(gd.startDistance - gd.stopDistance)<2 && Math.abs(gd.startAngle - gd.stopAngle)<5){
						gd.moveDistance = gd.stopData[0].distance;
						gd.moveDirection = gd.stopData[0].direction;
					}
					
				}
			}
		},
		'destroy': function(){
			
		}
	};
	
	//用来存放手指数据
	var fingerdata = {};
	
	//用来存放手势数据
	var gesturedata = {};
	//单手指操作对象
	var singleFinger = function(uniqueID,obj){
		this.uniqueID = uniqueID; 
		this.obj = obj || targetObj || window;
		this.longTap = 0;
		this.touchData = {};
		this.type = 1; //1表示单击，2表示双击，3表示长按，4表示滑动
	}
	
	singleFinger.prototype = {
		'touchStart' : function(e){
			this.touchData.startData = {
				clientX: e.clientX,
				clientY: e.clientY,
				pageX: e.pageX,
				pageY: e.pageY,
				screenX: e.screenX,
				screenY: e.screenY,
				identifier: e.identifier,
				time: util.getTime(),
				distance: 0
			};
			evts.custEvent.fire(main, 'touchStart', this.touchData);
			//判断长按
			this.longTap = setTimeout(function(){
				evts.custEvent.fire(main, 'touchLong', this.touchData);
				this.type = 3;
			},1000);
			
		},
		'touchEnd' : function(e){
			clearTimeout(this.longTap);
			this.touchData.stopData = this.touchData.stopData? this.touchData.stopData: this.touchData.startData;
			//console.log(this.touchData.stopData.direction);
			evts.custEvent.fire(main, 'touchEnd', this.touchData);
			this.type==1 && evts.custEvent.fire(main, 'singleTap', this.touchData);
		},
		'touchMove' : function(e){
			clearTimeout(this.longTap);
			this.touchData.stopData = {
				clientX: e.clientX,
				clientY: e.clientY,
				pageX: e.pageX,
				pageY: e.pageY,
				screenX: e.screenX,
				screenY: e.screenY,
				identifier: e.identifier,
				time: util.getTime(),
				distance: util.getDistance(this.touchData.startData.screenX,this.touchData.startData.screenY,e.screenX,e.screenY),
				direction: util.getAngle(this.touchData.startData.screenX,this.touchData.startData.screenY,e.screenX,e.screenY)
			};
				
			this.type = 4;
			evts.custEvent.fire(main, 'touchMove', this.touchData);
		},
		'getData' : function(){
			return this;
		}
	}
	
	var main = {
		'touchStart' : function(fn){
			if(typeof fn !== 'function'){
				throw 'argument must be a function!';
			}
			evts.custEvent.add(main, 'touchStart', fn);
		},
		'touchMove' : function(fn){
			if(typeof fn !== 'function'){
				throw 'argument must be a function!';
			}
			evts.custEvent.add(main, 'touchMove', fn);
		},
		'touchEnd' : function(fn){
			if(typeof fn !== 'function'){
				throw 'argument must be a function!';
			}
			evts.custEvent.add(main, 'touchEnd', fn);
		},
		'singleTap' : function(fn){
			if(typeof fn !== 'function'){
				throw 'argument fn must be a function!';
			}
			evts.custEvent.add(main, 'singleTap', fn);
		},
		'doubleTap' : function(fn){
			if(typeof fn !== 'function'){
				throw 'argument fn must be a function!';
			}
			evts.custEvent.add(main, 'doubleTap', fn);
		},
		'touchLong' : function(fn){
			if(typeof fn !== 'function'){
				throw 'argument must be a function!';
			}
			evts.custEvent.add(main, 'touchLong', fn);
		},
		'destroy' : function(){
			it.destroy();
		}
	};
	
	it.init();
	
	return main;
};
