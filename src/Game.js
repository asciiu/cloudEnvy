import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import ui.resource.Image as Image;
import ui.SpriteView as SpriteView;

//Import classes and Configuration
import device
import animate
import math.geom.intersect as Intersect;
import math.geom.Rect as Rect;
import math.util as Util;
import AudioManager;

//import constants.menuConstants as menuConstants;
import menus.views.MenuView as MenuView;
import menus.views.components.ButtonView as MenuButtonView;

import src.Config as Config;
import src.ScrollLayer as ScrollLayer;
import src.Cloud as Cloud;


//## Class: Game 
exports = Class(View, function (supr) {

	this.init = function (opts) {
		supr(this, 'init', [opts]);	

		this._isScrolling = false;
			 	
   		this._audioManager = new AudioManager({
                        path: 'resources/audio/',
                        files: {
				groovn: {
					loop: true,
					background: true
				},
				groovn1: {
					loop: true,
					background: true
				},
				groovn2: {
					loop: true,
					background: true
				},
				smack: {
					background: false
				},
			        ding: {
					background: false,
					volume: 0.2
				},
				fart: {
					background: false
				},
				splat: {
					background: false,
					volume: 0.5
				},
				splatter: {
					background: false,
					volume: 0.5
				},
				swoosh2: {
					background: false,
					volume: 0.5
				},
				vanish: {
					background: false,
					volume: 0.5
				}
			}
		});

		var width = this.style.width;
		var height = this.style.height;

		this._bgView = new ImageView({ 
 			image: 'resources/images/background.png', 
			superview: this,
			width: width,
			height: height 
		});

		var tw = 70;
		var th = 60;
		this._cloud = new Cloud({
			superview: this, 
			x: this.style.width/3,
			y: this._cloudSpawnY,
			y: this.style.height/2-th/2,
			zIndex: 10,
			width: tw, 
			height: th 
		});

		this._clouds = new ScrollLayer({
			superview: this, 
			width: this.style.width,
			height: this.style.height,
			//x: this.style.width
		});
		this._clouds.scrollClouds();

		this._score = 0;
		this._scoreView = new TextView({
			color: 'white',
			superview: this,
			size: 50,
			text: '0',
			width: 100,
			height: 100,
			x: 10,
			y: 250
		});

		this.on('InputStart', this.handleInputStart.bind(this));
		this.initGameOverMenu();
		this.start();
	};

	this.initGameOverMenu = function() {
		this._gameOverView = new View({
			superview: this,
			width: this.style.width,
			height: this.style.height,
			zIndex: 15,
		});

		// transparency
		new View({
			superview: this._gameOverView,
			width: this.style.width,
			height: this.style.height,
			backgroundColor: '#000000',
			opacity: 0.5
		});
		
		this._gameOverView.hide();
		new TextView({
			autoFontSize: false,
			superview: this._gameOverView,
			x: this.style.width/2 -100,
			y: this.style.height/2 -350,
			width: 200,
			height: 200,
			size: 75,
			text: "Game Over",
			color: 'white',
		});

		var current = new TextView({
			autoFontSize: false,
			superview: this._gameOverView,
			x: this.style.width/2 - 150,
			y: this.style.height/2 - 150,
			width: 100,
			height: 30,
			size: 30,
			text: "Score",
			color: 'white',
		});

		var best = new TextView({
			autoFontSize: false,
			superview: this._gameOverView,
			x: this.style.width/2 + 70,
			y: this.style.height/2 - 150,
			width: 100,
			height: 30,
			size: 30,
			text: "Best",
			color: 'white',
		});

		this._currentScore = new TextView({
			autoFontSize: false,
			superview: this._gameOverView,
			x: current.style.x,
			y: current.style.y+current.style.height + 12,
			width: 100,
			height: 10,
			size: 30,
			text: "0",
			color: 'white',
		});

		this._bestScore = new TextView({
			autoFontSize: false,
			superview: this._gameOverView,
			x: best.style.x,
			y: best.style.y+best.style.height + 12,
			width: 100,
			height: 10,
			size: 30,
			text: "0",
			color: 'white',
		});

		var self = this;
		var offset = (this.style.width-500)/2;
		new MenuButtonView({
			superview: this._gameOverView,
			width: 200, 
			height: 80,
			title: 'Play Again',
			style: 'GREEN',
			x: this.style.width/2 -100,
			y: this.style.height/2 -20,
			on: {
				up: function() { 
					self._gameOverView.hide();
					self.reset(); 
					self.start();
				}
			}
		});

		//new MenuButtonView({
		//	superview: this._gameOverView,
		//	width: 200, 
		//	height: 80,
		//	title: 'Quit',
		//	style: 'RED',
		//	x: this.style.width/2 -100,
		//	y: this.style.height/2 +85,
		//	on: {
		//		up: this.quit.bind(this) 
		//	}
		//});
	};

	// SETTERS


	// GAME STATE

	this.gameOver = function() {
		this._gameOver = true;
		this._gameOverView.style.opacity = 0;
		this._currentScore.setText(this._score);

		if(!localStorage.getItem('bestScore'))
			localStorage.setItem('bestScore', this._score);
		
		var best = localStorage.getItem('bestScore');
		if(best < this._score) {
			this._bestScore.setText(this._score);
			localStorage.setItem('bestScore', this._score);
		} else {
			this._bestScore.setText(best);
		}
		
		this._gameOverView.show();
		animate(this._gameOverView).now({opacity:1}, 1000);
		
		this._cloud.hide();
		this._clouds.stopMountains();
		this._scoreView.hide();
		this._audioManager.stop('groovn');
	};

	this.reset = function() {
		this._clouds.resetObstacles();
		this._cloud.reset();
		this._gameOver = false;
		this._score = 0;
		this._scoreView.setText(this._score);
		this._scoreView.show();
	};

	this.start = function() {
		this._cloud.show();
		this._cloud.hover();
	};
	
	this.tick = function() {
		if(this._pause || this._gameOver) return;

		if(this._clouds.isMountainScrolling()) {
			if(this._cloud.isDead()) {
				this.gameOver();
			} else if(this._clouds.checkMountainCollision(this._cloud.getBoundingShape())) { 
				this._audioManager.play('vanish');
				this.gameOver();
			} else if(this._clouds.checkSweetSpotCollision(this._cloud.getBoundingShape())) { 
				this._score++;
				this._audioManager.play('ding');
				this._scoreView.setText(this._score);
			}
		}
	};

	this.quit = function() {
	};

	// CHECK STATE

	// EVENT handlers
	this.handleInputStart = function(event, point) {
		if(this._gameOver) return;

		this._inputStartX = point.x;

		if(!this._clouds.isMountainScrolling()) { 
			this._clouds.startMountains();
		}

		this._audioManager.play('swoosh2');
		this._cloud.fly();
	};

	this.handleInputMove = function(event, point) {
		var dx = point.x - this._inputStartX;
		if(dx > 100) {
			this._cloud.moveX(this.style.width - this._cloud.style.width - 20);
		} else if(dx < -100) {
			this._cloud.moveX(20);
		}	
	};

	this.handlePause = function() {
		this._pause = true;
	};

	this.handleResume = function() {
		this._pause = false;
	};

	this.handleQuit = function() {
		// implement quit and remove resume call
		this.handleResume();
	};
});
