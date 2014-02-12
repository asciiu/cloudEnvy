import ui.ImageView as ImageView;
import ui.View as View;
import ui.resource.Image as Image;
import math.util as Util;
import math.geom.intersect as Intersect;
import math.geom.Rect as Rect;
import math.geom.Circle as Circle;

import animate;
import src.Obstacle as Obstacle;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', [opts]);	
		
		this._mountainGap = this.style.width/2;
		this._mountainVelocity = this.style.width/3000;
		this._mountainScrollTime = 3000;
		this._clouds = [];
		this._obstacles = [];
		this._mountains = [];
		this._stopScroll = true;

		this.initClouds();
		this.initMountains();
		//this.initObstacles();
	};

	this.initClouds = function() {
		var clouds = [];
		clouds.push(new Image({
			url: 'resources/images/clouds.png',
			sourceW: 116,
			sourceH: 110,
		}));
		clouds.push(new Image({
			url: 'resources/images/clouds.png',
			sourceW: 271,
			sourceH: 128,
			sourceX: 116,
			sourceY: 0,
		}));
		clouds.push(new Image({
			url: 'resources/images/clouds.png',
			sourceW: 291,
			sourceH: 155, 
			sourceX: 388,
			sourceY: 0,
		}));
		clouds.push(new Image({
			url: 'resources/images/clouds.png',
			sourceW: 860,
			sourceH: 390,
			sourceX: 0,
			sourceY: 155,
		}));

		for(var c = 0; c < clouds.length; ++c) {
			var cloudImage = clouds[c];
			var cloudView = new ImageView({
				image: cloudImage,
				superview: this, 
				width: cloudImage.getWidth(),
				height: cloudImage.getHeight() 
			});
			this._clouds.push(cloudView);	
		}
	};

	this.initMountains = function() {
		var image = new Image({
			url: 'resources/images/mountain.png'
		});
		var width = image.getWidth();
		var height = image.getHeight();
		var gap = 180;

		this._mbY = -Util.random(0, 600);

		for(var m = 0; m < 2; ++m) {
			var obstacle = new Obstacle({
				superview: this, 
				image: image,
				gap: gap,
				width: width,
				height: height*2+gap,
				x: this.style.width + this._mountainGap * m,
				y: this._mbY
			});
			this._mountains.push(obstacle);
		}
	};

	//this.initObstacles = function() {

	//	var paper = new Image({
	//		url: 'resources/images/paper.png'
	//	});

	//	for(var o = 0; o < 3; ++o) {
	//		var obstacle = new ImageView({
	//			superview: this,
	//			image: paper,
	//			width: paper.getWidth(),
	//			height: paper.getHeight(),
	//			x: this.style.width + this.style.width/2,
	//			zIndex: 7 
	//		});
	//		this._obstacles.push(obstacle);
	//	}
	//};

	this.checkSummitCollision = function(mtnRect, rect, flip) {
		var radius = mtnRect.width/2;
		var summit = new Circle(mtnRect.x+radius, mtnRect.y+radius, radius);
		var semiCircleRect = new Rect(mtnRect.x, mtnRect.y, mtnRect.width, radius);
		var margin = 15;
		var rect = new Rect(rect.x + margin, rect.y + margin, rect.width-margin*2, rect.height-margin*2); 

		if(flip) {
			summit = new Circle(mtnRect.x+radius, mtnRect.y+mtnRect.height-radius, radius);
			semiCircleRect = new Rect(mtnRect.x, mtnRect.y+mtnRect.height-radius, mtnRect.width, radius);
		}

		if(Intersect.rectAndRect(rect, semiCircleRect) && Intersect.circleAndRect(summit, rect))
			return true;

		return false;
	};

	this.checkMountainCollision = function(rect) {			
		for(var m = 0; m < this._mountains.length; ++m) {
			var mtn = this._mountains[m];
			var mRect = mtn.getBoundingShape();
			var mRectTop = mtn.getTopRect();
			var mRectBottom = mtn.getBottomRect();
			var mRectBottomY = mRect.y + mRect.height - mRectBottom.height;
			var rad = mRect.width/2;

			mRectTop = new Rect(mRect.x, mRect.y, mRectTop.width, mRectTop.height);
			mRectBottom = new Rect(mRect.x, mRectBottomY, mRectBottom.width, mRectBottom.height);

			if(this.checkSummitCollision(mRectTop, rect, true))
				return true;
			if(this.checkSummitCollision(mRectBottom, rect, false))
				return true;

			//mRect = new Rect(mRect.x, mRect.y+100, mRect.width, mRect.height-100);
			mRectTop = new Rect(mRect.x, mRect.y, mRectTop.width, mRectTop.height-rad);
			mRectBottom = new Rect(mRect.x, mRectBottomY+rad, mRectBottom.width, mRectBottom.height-rad);
	
			if(Intersect.rectAndRect(rect, mRectTop) ||
			   Intersect.rectAndRect(rect, mRectBottom))
				return true;
		}
		return false;
	};

	this.checkSweetSpotCollision = function(rect) {			
		for(var m = 0; m < this._mountains.length; ++m) {
			var mtn = this._mountains[m];

			if(mtn.isScored())
				return false;

			var mRect = mtn.getBoundingShape();
			var mRectGap = mtn.getGapRect();
			var margin = 20;

			mRectGap = new Rect(mRect.x+margin, mRect.y+mRectGap.y, 
				mRectGap.width-margin, mRectGap.height);

			if(Intersect.rectAndRect(rect, mRectGap)) {
				mtn.scored();
				return true;
			}
		}
		return false;
	};

	//this.checkObstacleCollision = function(rect) {			
	//	for(var o = 0; o < this._obstacles.length; ++o) {
	//		var oRect = this._obstacles[o].getBoundingShape();
	//		if(Intersect.rectAndRect(rect, oRect)) 
	//			return true;
	//	}
	//	return false;
	//};

	this.scrollCloud = function(cloud){
		var cloudWidth = cloud.style.width;
		var time = Util.random(10000, 11000);
		var self = this;

		cloud.style.x = this.style.width;
		cloud.style.y = Util.random(0, 600);

		animate(cloud).now({x: -cloudWidth}, time, animate.linear).then(function() {
			self.scrollCloud(cloud);
		});
	};

	this.scrollClouds = function() {
		for(var c = 0; c < this._clouds.length; ++c) {
			var cloudView = this._clouds[c];
			this.scrollCloud(cloudView);
		}
	};


	//this.scrollObstacle = function(obstacle) {
	//	if(this._stopScroll) return;

	//	var obstacleWidth = obstacle.style.width;
	//	var time = obstacle.style.x / this._mountainVelocity;
	//	var self = this;

	//	animate(obstacle).now({x: -obstacleWidth}, time, animate.linear).then(function() {
	//		obstacle.style.x = self.style.width;
	//		obstacle.style.y = Util.random(0, self.style.height);
	//		self.scrollObstacle(obstacle);
	//	});
	//};

	//this.scrollObstacles = function() {
	//	for(var o = 0; o < this._obstacles.length; ++o) {
	//		var obstacle = this._obstacles[o];

	//		this.scrollObstacle(obstacle);
	//	}
	//		
	//};

	// MOUNTAIN CONTROL
	this.resetObstacles = function() {
		for(var m = 0; m < this._mountains.length; ++m) {
			var mtn = this._mountains[m];
			animate(mtn).clear();
			mtn.reset();
			mtn.style.x = this.style.width + this._mountainGap * m;
			mtn.style.y = -Util.random(0,300);
		}	
	};

	this.isMountainScrolling = function() {
		return !this._stopScroll;
	};
	this.stopMountains = function() {
		this._stopScroll = true;
	};
	this.startMountains = function() {
		this._stopScroll = false;
		this.scrollMountains();
	};
	this.scrollMountain = function(mtn, obstacle) {
		if(this._stopScroll) return;

		var self = this;
		var time = mtn.style.x / this._mountainVelocity;

		animate(mtn).now({x: -mtn.style.width}, time, animate.linear).then(function() {
			mtn.style.x = self.style.width 
			mtn.style.y = -Util.random(0,600);
			mtn.reset();
			self.scrollMountain(mtn, obstacle);
		});
	};
	this.scrollMountains = function() {
		for(var m = 0; m < this._mountains.length; ++m) {
			var mtn = this._mountains[m];
		
			this.scrollMountain(mtn);
		}
	};

});
