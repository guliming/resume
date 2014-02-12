/**
 * @author liming17
 */
var canvas = (function(){
	var mycanvas=document.getElementById("canvas1");
	var mycontext=mycanvas.getContext('2d');
	mycontext.beginPath();
	mycontext.moveTo(0,707);
	mycontext.lineTo(1024,707);
	mycontext.stroke();
	
	var time=x=y=0;
	
	var img;
	var isPause = false;
	var step = 0;
	var isWorking = false;
	
	var experence = ['啊啊啊哈哈哈','哈哈哈哈哈啊啊啊','33333','444444','55555','666666','777777','8888888','999999','0000000'];
	var temp = [];
	
	var walkimgs = [];
	walkimgs[0] = new Image();
	walkimgs[0].src = "./images/walk1.jpg";
	walkimgs[1] = new Image();
	walkimgs[1].src = "./images/walk2.jpg";
	walkimgs[2] = new Image();
	walkimgs[2].src = "./images/walk3.jpg";
	walkimgs[3] = new Image();
	walkimgs[3].src = "./images/walk4.jpg";
	
	var trains = [];
	trains[0] = new Image();
	trains[0].src = "./images/train.jpg";
	trains[1] = new Image();
	trains[1].src = "./images/train2.jpg";
	
	var houses = [];
	houses[0] = new Image();
	houses[0].src = "./images/house.jpg";
	
	var dealWithTime = function(){
		if(time%512 == 0){
			if((time/512)%3==1){
				isWorking = true;
				x=y=0;
			}
			else if((time/512)%3==0){
				isWorking = false;
				x=y=0;
			}
		}
	};
	
	var draw = function(){
		if(isPause){
			return;
		}
		//路上512，工作1024
		if(time>512*15){
			time=x=y=0;
			//return;
		}
		
		time++;x++;y++;
		
		dealWithTime();
		//console.log(x);
		drawCircle();
		drawHouse();
		drawTrain();
		drawText();
		drawPeople();
		requestAnimationFrame(draw);
	};
	
	var drawCircle = function(){
		if(time==0){
			mycontext.clearRect(0,0,1024,104);
		}
		if(!isPause){
			var pos = time%1024;
			mycontext.clearRect(pos,0,104,104);
			mycontext.beginPath();
			mycontext.arc(pos+52,50,50, 0, Math.PI * 2, true);
			mycontext.closePath();
			mycontext.stroke();
		}
	};
	
	var drawHouse = function(){
		if(isWorking){
			mycontext.drawImage(houses[0], 200+x/10, 100);
		}
		else if(x==0){
			mycontext.clearRect(200,100,1024,480);
		}	
	};
	
	var drawPeople = function(){
		if(isWorking){
			if(!isPause && x<801 && x>199){
				if(x%10==0){
					mycontext.drawImage(walkimgs[step%4], x, 600);
					step++;
				}
			}
			else if(x==801){
				mycontext.clearRect(800,600,72,106);
				step = 0;
			}
		}
	};
	
	var drawTrain = function(){
		if(!isWorking){
			if(!isPause){
				if(x%10==0){
					mycontext.drawImage(trains[step%2], x, 500);
					step++;
				}
			}
		}
		else if(x==0){
			mycontext.clearRect(0,0,1024,706);
			step = 0;
		}	
	};
	
	var drawText = function(){
		if(x==1){
			var text = experence.shift();
			temp.push(text);
			
			mycontext.clearRect(50,0,200,706);
			mycontext.font="30px Verdana";
			mycontext.strokeText(text,50,350,200);
		}
	};
	
	evts.custEvent.define(draw, 'pause');
        	
	evts.custEvent.add(draw, 'pause', function(x,data){
		isPause = !!data;
	});
	return draw;
})();
