/**
 * @author liming17
 */
$(function() {
                
    setTimeout(function() {//添加到主屏时隐藏地址栏
        window.scrollTo(0, 1);
    }, 1);
    
    var bb,$navNext,$navPrev,
        init = function() {
			initplugin();
            initEvents();
            
        },
        initplugin = function() {
        	$navNext = $( '#bb-nav-next' );
        	$navPrev = $( '#bb-nav-prev' );
        	bb = $( '#bb-bookblock' ).bookblock( {
                speed : 500,
                shadowSides : 0.8,
                shadowFlip : 0.7
           } );
        },
        initEvents = function() {

            // add navigation events
            $navNext.on( 'click', function() {
                bb.next();
                return false;
            } );

            $navPrev.on( 'click', function() {                
                bb.prev();
                return false;
            } );
            
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