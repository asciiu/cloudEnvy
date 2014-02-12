import ui.ImageView as ImageView;
import ui.View as View;
import ui.resource.Image as Image;
import math.util as Util;
import math.geom.Rect as Rect;

import animate;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', [opts]);	

		this._gap = opts.gap;
		this._image = opts.image;
		this._isScored = false;

		this._top = new ImageView({
			superview: this,
			image: this._image,
			flipY: true,
			width: this._image.getWidth(),
			height: this._image.getHeight(),
		});

		this._bottom = new ImageView({
			superview: this,
			image: this._image,
			width: this._image.getWidth(),
			height: this._image.getHeight(),
			y: this.style.height-this._image.getHeight() 
		});
	};

	this.getTopRect = function() {
		return this._top.getBoundingShape();
	};
	this.getBottomRect = function() {
		return this._bottom.getBoundingShape();
	};
	this.getGapRect = function() {
		return new Rect(0, this._top.style.height, this.style.width, this._gap);
	}; 

	this.isScored = function() {
		return this._isScored;
	};
	this.scored = function() {
		this._isScored = true;
	};
	this.reset = function() {
		this._isScored = false;
	};
});
