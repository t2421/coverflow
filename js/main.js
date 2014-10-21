//Parameters
var KEY_CODE_RIGHT = 39;
var KEY_CODE_LEFT = 37;

var scrollDist = 0;
var scrollMax = 100;

var center = 0;

var isWindows = false;

var scrollStep = 1;
var scrollCounter = 0;

if (navigator.platform.indexOf("Win") != -1) {
	isWindows = true;
}

if(isWindows){
	scrollStep = 1;
}else{
	scrollStep = 2;
}

var MotionParms = function(){
	this.itemRotationY = 45;
	this.largeScale = 1.7;
	this.sizeDecay = 0.17;
	this.rotationDecay = 0.16;
	this.positionDecay = 0.08;
	this.positionDecay2 = 0.14;
	this.largeOffset = 94;
	this.normalOffset = -43;
	this.shadowDecay = 0.1;
	this.scrollStep = 1;
	this.windowsDeltaScale = 4;
	this.macDeltaScale = 0.2;
};

var motionParams = new MotionParms();

var timer;

var ItemObject = function(setupObject){
	var that = this;
	that.element = setupObject.element;
	that.targetX = 0;
	that.targetWidth = 0;
	that.targetHeight = 0;
	that.x = 0;
	that.y = 0;
	that.scale = 1;
	that.rotationY = motionParams.itemRotationY;
	that.targetRotationY = 0;
	that.shadow = 0;
	that.targetShadow = 0;
	that.offset = 0;
	that.isSelect = false;

	that.vx = 0;

	that.depthIndex = 0;
	that.shadowElement;

	that.innerElement;

	that.width = 0;
	that.height = 0;

	that.innerElement = $('.inner',that.element);
	that.originalWidth = $('img',that.innerElement).attr('width');
	that.originalHeight = $('img',that.innerElement).attr('height');
	that.element.width(that.originalWidth);
	that.element.height(that.originalHeight);

	setReflection();

	that.innerElement.append('<div class="shadow"></div>');
	that.shadowElement = $('.shadow',that.innerElement);



	function setReflection(){
		that.innerElement.append($('img',that.innerElement).clone(true).addClass('reflection'));
		that.innerElement.append('<div class="reflectionShadow"></div>');
	}

	that.init = function(){
		that.element.attr("style","left:"+that.x+"px;"+"top:"+that.y+"px;"+"width:"+that.width+"px;"+"height:"+that.height+"px;"+"z-index:"+that.depthIndex);
		that.innerElement.attr("style",'transform:rotateY('+that.rotationY+'deg)');
	};

	that.draw = function(){
		var posDecay;
		if(that.isSelect){
			posDecay = motionParams.positionDecay;	
		}else{
			posDecay = motionParams.positionDecay2;
		}
		
		that.x += (that.targetX - that.x)*posDecay;
		that.width += (that.targetWidth - that.width)*posDecay;
		that.height += (that.targetHeight - that.height)*posDecay;
		that.rotationY += (that.targetRotationY - that.rotationY)*motionParams.rotationDecay;
		that.shadow += (that.targetShadow - that.shadow)*posDecay;
		that.shadow = parseInt(that.shadow * 100) / 100;
		that.scale = that.width/that.originalWidth;
		that.element.attr('style',"width:"+that.originalWidth+"px; height:"+that.originalHeight+"px; -webkit-transform:translate3d("+that.x+"px,0,0) scale("+that.scale+"); z-index:"+that.depthIndex+";" );
		that.shadowElement.attr("style","opacity:"+that.shadow+"; -webkit-transform:translate3d(0,0,0);");
		that.innerElement.attr("style","-webkit-transform:rotateY("+that.rotationY+"deg) translate3d(0,0,0);");
	};
};

ItemObject.isAnim = false;


$(document).ready(function(){
	$(window).resize(function() {
	    center = $(window).width()*0.5;
	});
	center = $(window).width()*0.5;
});

window.onload = function(){
	setup();
	$("#loading").delay(1000).animate({opacity:0}, 500, "linear", function(){$("#loading").css("display","none")});
};

if(window.location.href.indexOf("debug") != -1){
	var gui = new dat.GUI();
	gui.add(motionParams,'itemRotationY',0,60);
	gui.add(motionParams,'largeScale',1,3);
	gui.add(motionParams,'sizeDecay',0.1,0.2);
	gui.add(motionParams,'rotationDecay',0.1,0.25);
	gui.add(motionParams,'positionDecay',0.05,0.15);
	gui.add(motionParams,'positionDecay2',0.1,0.2);
	gui.add(motionParams,'largeOffset',0,300);
	gui.add(motionParams,'normalOffset',-200,50);
	gui.add(motionParams,'shadowDecay',0.1,0.4);
	gui.add(motionParams,'scrollStep',1,5);
	gui.add(motionParams,'windowsDeltaScale',1,5);
	gui.add(motionParams,'macDeltaScale',0,1);
}



	$(window).keydown(function(e){
		switch(e.keyCode){
			case KEY_CODE_RIGHT:
			next();
			break;
			case KEY_CODE_LEFT:
			prev();
			break;
		}
	});

	$(document).mousewheel(function(eo, delta, deltaX, deltaY){
		scrollCounter++;

		if(scrollCounter%motionParams.scrollStep==0){
			var delta;
		
			if(deltaX*deltaX >= deltaY*deltaY){
				delta = deltaX;
			}else{
				delta = deltaY;
				if(!isWindows){
					delta = -delta;
				}
			}
			
			if(isWindows){
				scrollDist += (delta*motionParams.windowsDeltaScale);
			}else{
				scrollDist += parseInt(delta*motionParams.macDeltaScale);
			}
			
			if(scrollDist>=scrollMax){
				scrollDist = scrollMax;
			}

			if(scrollDist<=0){
				scrollDist = 0;
			}

			selectIdx = parseInt(map(scrollDist,0,scrollMax,0,numItems-1));
			if(selectIdx>=numItems){
				selectIdx = numItems - 1;
			}
			if(selectIdx<=0){
				selectIdx = 0;
			}
		}
		
		
	});

	

	function map(v,sx,sn,dx,dn){
		return (v - sn) * (dx - dn) / (sx - sn) + dn;	
	}


	var numItems = $('#coverflow li').length;
	var selectIdx = 0;
	var itemOffset = 5;
	var items = [];

	function next(){
		selectIdx++;
		if(selectIdx >= numItems){
			selectIdx = numItems - 1;
		}else{
			scrollDist = parseInt(map(selectIdx,0,numItems-1,0,scrollMax));	
		}
	}

	function prev(){
		selectIdx--;
		if(selectIdx <= 0){
			selectIdx = 0;
		}else{
			scrollDist = parseInt(map(selectIdx,0,numItems-1,0,scrollMax));	
		}
		
	}

	function setup(){
		$('#coverflow li').each(function(index){
			$(this).attr("id",index);
			var item = new ItemObject({element:$(this)});
			items.push(item);
		});


		timer = setInterval(draw,16);
	}


	function draw(){	
		var selectedItem = items[selectIdx];
		selectedItem.targetWidth = selectedItem.originalWidth * motionParams.largeScale;
		selectedItem.targetHeight = selectedItem.originalHeight * motionParams.largeScale;
		selectedItem.targetX = center - selectedItem.targetWidth*0.5;
		selectedItem.targetRotationY = 0;
		selectedItem.depthIndex = numItems + 1;
		selectedItem.offset = motionParams.largeOffset;
		selectedItem.targetShadow = 0;
		selectedItem.isSelect = true;
		selectedItem.draw();
		

		//left
		for (var j = selectIdx-1; j >= 0; j--) {
			var leftItem = items[j];
			//items[j].targetX = (items[j+1].targetX)-(items[j+1].targetWidth/2 + items[j+1].offset)-items[j].targetWidth/2;
			leftItem.targetX = (items[j+1].targetX)-(items[j+1].offset)-leftItem.targetWidth/2;
			leftItem.targetRotationY = motionParams.itemRotationY;
			leftItem.depthIndex = j;
			leftItem.targetWidth = leftItem.originalWidth;
			leftItem.targetHeight = leftItem.originalHeight;
			leftItem.offset = motionParams.normalOffset;
			leftItem.isSelect = false;
			leftItem.targetShadow = (selectIdx - j)*motionParams.shadowDecay;
			leftItem.draw();
		}

		//right
		for (var k = selectIdx+1; k < numItems; k++) {
			var rightItem = items[k];
			rightItem.targetX = (items[k-1].targetX)+(items[k-1].offset)+rightItem.targetWidth/2;
			rightItem.targetRotationY = -motionParams.itemRotationY;
			rightItem.depthIndex = -k;
			rightItem.targetWidth = rightItem.originalWidth;
			rightItem.targetHeight = rightItem.originalHeight;
			rightItem.offset = motionParams.normalOffset;
			rightItem.targetShadow = (k-selectIdx)*motionParams.shadowDecay;
			rightItem.isSelect = false;
			rightItem.draw();
		}
	}

	
