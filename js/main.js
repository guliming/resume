/**
 * @author liming17
 */
$(function() {
                
    setTimeout(function() {//添加到主屏时隐藏地址栏
        window.scrollTo(0, 1);
    }, 1);
    
    var bb,navNext,navPrev,
        init = function() {
			initplugin();
            initEvents();
            
        },
        initplugin = function() {
        	navNext = document.getElementById('bb-nav-next');
        	navPrev = document.getElementById('bb-nav-prev');
        	bb = $( '#bb-bookblock' ).bookblock( {
                speed : 500,
                shadowSides : 0.8,
                shadowFlip : 0.7
           } );
        },
        initEvents = function() {
        	
        	evts.custEvent.define(bb, 'animationEnd');
        	
        	evts.custEvent.add(bb, 'animationEnd', function(x,data){
        		if(data[0].id == 'third'){
        			evts.custEvent.fire(canvas, 'pause', false);
        			canvas();
        		}
        		else
        			evts.custEvent.fire(canvas, 'pause', true);
        	});

            // add navigation events
            evts.addEvent(navNext,'click', function(e){
            	evts.stopEvent(e);
                bb.next();
            });
            evts.addEvent(navPrev,'click', function(e){
            	evts.stopEvent(e);
                bb.prev();
            });
            
            var mygesture = testgesture($('#bb-bookblock')[0]);
		    mygesture.touchEnd(function(x,data){
		    	if(data.stopData.direction>135 && data.stopData.direction<225){
		    		bb.next();
		    	}
		    	else if(data.stopData.direction>315 || data.stopData.direction<45){
		    		bb.prev();
		    	}
		    });
        };

    init(); 
    
});