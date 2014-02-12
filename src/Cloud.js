import ui.ImageView as ImageView;
import ui.View as View;

import animate;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', [opts]);	
		this._turd = new ImageView({
			image: 'resources/images/meanCloud.png',
			superview: this, 
			width: this.style.width, 
			height: this.style.height 
		});

		this._animate = animate(this);
		this._autoPilot = true;
		this._isBoosting = false;
		this._isDead = false;
		this._spawnY = opts.y;
	};

	// CHECKERS
	this.isBoosting = function() {
		return this._isBoosting;
	};
	this.isDead = function() {
		return this._isDead;
	};

	// CONTROL
	this.boost = function() {
		var y = this.style.y;
		var ground = this.getSuperview().style.height+this.style.height;
		var dy = 200;
		var self = this;
		
		this._isBoosting = true;
		this._animate.clear();

		this._animate.now({y: y-dy}, 300, animate.easeOut)
			     .then(function() { self._isBoosting = false; })
			     .then({y: ground}, 700, animate.easeIn)
			     .then(function() { self._isDead = true; });
	};

	this.fly = function() {
		if(this._isBoosting) return;

		var y = this.style.y;
		var ground = this.getSuperview().style.height+this.style.height;
		var dy = 100;
		var self = this;
		
		this._animate.clear();

		// can't exceed ceiling
		if(y-dy < 0) dy = y;

		this._animate.now({y: y-dy}, 300, animate.easeOut)
			     .then({y: ground}, 700, animate.easeIn)
			     .then(function() { self._isDead = true; });
	};

	this.hover = function() {
		var y = this.style.y; 
		var dy = 10;
		var self = this;

		this._animate.now({y: y+dy}).then({y: y}).then(function() {
			self.hover();
		});
		
	};

	this.reset = function() {
		this._isDead = false;
		this.style.y = this._spawnY;
	};
});
