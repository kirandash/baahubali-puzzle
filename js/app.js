(function($){

	$(document).ready(function(){

		var level = $('body').attr('id');

		if(level == 'level1'){
			staggerSpeed = 0.5;
		}else if(level == 'level2'){
			staggerSpeed = 0.3;
		}else if(level == 'level3'){
			staggerSpeed = 0.2;
		}else if(level == 'level4'){
			staggerSpeed = 0.1;
		}

		$('<img/>').attr('src', 'images/'+ level +'/background.jpg').load(function() {
		   
		   $(this).remove(); // prevent memory leaks as @benweet suggested
		   $('body').css('background-image', 'url(images/'+ level +'/background.jpg)');


			// For Pre Loader
			$('body').addClass('loaded');

			// SET DEFAULT PROPERTIES
			TweenMax.set('.image, #welcome', {scale: 0, opacity: 0});
			TweenMax.set('.won, .lost', {top: -100, opacity: 1, autoAlpha: 1, scale: 5});
			TweenMax.set('.next', {top: -100, opacity: 1, autoAlpha: 1, scale: 2});
			TweenMax.set('.celebrate, .playAgain', {bottom: -100, top: "auto", opacity: 1, autoAlpha: 1, scale: 2});
			TweenMax.set('.timer', {top: -100, opacity: 1, autoAlpha: 1, scale: 1});

			// Welcome
			var titleTimeline = new TimelineMax(),
				titleCloseTimeline  = new TimelineMax(),
				winTimeline = new TimelineMax(),
				lostTimeline = new TimelineMax(),
				playAgainTimeline = new TimelineMax(),
				nextLevelTimeline = new TimelineMax(),
				gameContainer = $('.gameBoard'),
				dropTargets = $('.target'),
				targetContainer = $('.targetBoard'),
				targetContainerX = targetContainer.position().left,
				targetContainerY = targetContainer.position().top,
				totalMatches = 0,
				matchesDone = dropTargets.length,
				sec = $('.timer span').text(),
				timer,
				flag = false,
				youtubeVideo = $('.celebrate').attr('data-youtube');

			function initWelcome(){

				TweenMax.to("#welcome", 2, {scale: 1, autoAlpha: 1, onComplete: function(){
					titleTimeline.to("#welcome #startGame", 1, {scale:1.3, ease: SlowMo.ease.config(0.7, 0.7, false)});

					titleTimeline.to("#welcome #startGame", 1, {scale:1, ease: Bounce.easeOut, onComplete: function(){
						titleTimeline.restart();
					}});
				}});
			}

			// Load Game board
			function loadGameBoard() {
				// Stop timeline
				titleTimeline.stop();
				// hide welcome
				titleCloseTimeline.to("#welcome", 1, {scale: 0, force3D: true});
				// show modal
				titleCloseTimeline.to(".modal", 1, {scale: 1, autoAlpha: 1, force3D: true});
				// load game pieces
				titleCloseTimeline.staggerTo(".image", 0.5, {opacity: 1, autoAlpha:1, scale: 1, ease: Back.easeOut.config(1.7), force3D: true, onComplete: setTimer, onCompleteParams: [sec] }, staggerSpeed, initDraggableItem());
				
			}

			// Initialize Draggable Items
			function initDraggableItem() {
				Draggable.create(".dragItem", {
					bounds: gameContainer,
					edgeResistance: 0.65,
					onPress: function() {
						//starting drag position
						this.startX = this.x;
						this.startY = this.y;
						this.offsetLeft = this.startX - $(this.target).position().left;
						this.offsetTop = this.startY - $(this.target).position().top;
					},
					onDragEnd: function() {
						var dragThing = this;
						var dragId = this.target.id + '_drop';

						// Loop through all targets
						$.each(dropTargets, function(index, spot){
							var spotId = spot.id;
							var pos = $(spot).position();

							var targetXpos = dragThing.offsetLeft + pos.left + targetContainerX ;
							var targetYpos = dragThing.offsetTop + pos.top + targetContainerY;

							// check if ID exists and matches
							if(spotId == dragId) {

								// Check if after drag it hits the right spot
								if(dragThing.hitTest(spot, "10%")){
									TweenMax.to(".correct", 0.5 , {scale: 5, autoAlpha: 1, opacity: 1, onComplete: function(){
										TweenMax.to(".correct", 0.5, {scale: 0, autoAlpha: 0, opacity: 0, delay: 0.5});
									}});
									TweenMax.to(dragThing.target, .5, {x: targetXpos,y: targetYpos, onComplete: checkTargetCount, onCompleteParams: [dragThing, spot] });
								}else{
									TweenMax.to(".wrong", 0.5, {scale:5, autoAlpha: 1, opacity: 1, onComplete: function(){
										TweenMax.to(".wrong", 0.5, {scale: 0, autoAlpha: 0, opacity: 0, delay: 0.5});
									}});
									TweenMax.to(dragThing.target, .5, {x: dragThing.startX, y: dragThing.startY});
								}
							}
						});
					}
				})
			}

			function checkTargetCount(dragThing, spot) {
				dragThing.disable();
				$(spot).remove();
				totalMatches++;

				if(totalMatches == matchesDone){
					$('.lost, .playAgain').hide();

					winTimeline.to(".instruction, .timer", 0.5, { opacity: 0, onComplete: function(){
						setTimer(1000000, false);
					}});
					
					winTimeline.staggerTo(".image", 2, { cycle: { x: [300, -230, 110, 400, -230, 95, -211, 500, 700, 110, 448, 230, 489, 469, 447], y: [300, 230, 110, 400, 230, 95, 211, 500, 700, 110, 448, 230, 489, 469, 447], rotation:[360, 270, 150, 300, -230, 110, 400, -230, 95, -211, 500] } , opacity: 0, ease: Back.easeOut.config(1.7), force3D: true , delay: 1}, 0.1);
					winTimeline.to('.won', 0.5, {top: "30%", rotation: 360, ease: Power1.easeOut});
					winTimeline.to('.celebrate', 1, {bottom: "20%", ease: Power1.easeOut});
					winTimeline.to('.next', 1, {top: "10%", ease: Power1.easeOut});

					nextLevelTimeline.to(".next", 1, {scale:2.1, ease: Bounce.easeOut});

					nextLevelTimeline.to(".next", 1, {scale:2, ease: Bounce.easeOut, onComplete: function(){
						nextLevelTimeline.restart();
					}});
					
				}
			}

			function setTimer(time , timerFlag) {
				if(flag == false || timerFlag == false){
					TweenMax.to(".timer", 0.5, { top: 5 });

					sec = time;
					timer = setInterval(function() { 
					   
					   if (sec == 0) {
					      $('.timer span').text(0);
					      lostTimeline.staggerTo(".image", 1, { cycle: { x: [300, -230, 110, 400, -230, 95, -211, 500, 700, 110, 448, 230, 489, 469, 447], y: [300, 230, 110, 400, 230, 95, 211, 500, 700, 110, 448, 230, 489, 469, 447], rotation:[360, 270, 150, 300, -230, 110, 400, -230, 95, -211, 500] } , opacity: 0, ease: Back.easeOut.config(1.7), force3D: true , delay: 1}, 0.1);
					      lostTimeline.to("#instruction", 0.5, { opacity: 0 });
					      lostTimeline.to(".timer", 0.5, { top: "50%" });
					      lostTimeline.to(".lost", 0.5, { top: "20%", delay: 1 });
					      lostTimeline.to('.playAgain', 1, {bottom: "20%", ease: Power1.easeOut, onComplete: function(){
					      	
					      	playAgainTimeline.to(".playAgain", 1, {scale:2.1, ease: Bounce.easeOut});

							playAgainTimeline.to(".playAgain", 1, {scale:2, ease: Bounce.easeOut, onComplete: function(){
								playAgainTimeline.restart();
							}});

					      }});
					   }else{
					   	  $('.timer span').text(--sec);
					   } 
					}, 1000);	
				}

				flag = true;		
			}

			$('#startGame').on('click', function(){
				loadGameBoard();
			});

			$('.playAgain').click(function(){
				location.reload();
			});

			$('.celebrate').magnificPopup({
			    items: {
				     src: youtubeVideo
			    },
			    type: 'iframe',
			    iframe: {
				    	markup: '<div class="mfp-iframe-scaler">'+
			            		'<div class="mfp-close"></div>'+
			            		'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
			            		'</div>', 
			        patterns: {
			            youtube: {
				              index: 'youtube.com/', 
				              id: 'v=', 
				              src: '//www.youtube.com/embed/%id%?autoplay=1' 
					        }
					     },
					     srcAction: 'iframe_src', 
			    },
			    callbacks: {
				    open: function() {
			      	
					  $.each($('audio'), function () {
						  $('audio').get(0).pause();
						  $('audio').get(0).currentTime = 0;	
					  });

						
				      $.magnificPopup.instance.close = function() {
				        // Stop all the audios on page
						$.each($('audio'), function () {
						    $(this).get(0).play();
						});
							        

				        // Call the original close method to close the popup
				        $.magnificPopup.proto.close.call(this);
				      };
				    }
				}
			});

			initWelcome();

		});

	});

})(jQuery)