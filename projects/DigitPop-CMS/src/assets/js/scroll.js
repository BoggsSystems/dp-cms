	const ANIM_ARRAY = [ 'fadeInUp', 'flipInX', 'lightSpeedIn', 'bounceIn', 'slideInLeft', 'slideInRight', 'fadeInLeft', 'fadeInRight', 'bounceInLeft', 'bounceInRight', 'bounceInDown', 'bounceInUp' ];
    const $WINDOW = $(window);
	const ANIM_DELAY = 750;
	const ANIM_REPLAY = false;
	const PAD_DESKTOP_RATIO = 0.75;
	const PAD_MOBILE_RATIO = 1.1;

	let IS_MOBILE;
	let PAD;

	$(document).ready(function() {
		$("a.dpop-cta-s").on('click', function(e) { 
			e.preventDefault(); 
			$('html,body').animate({ scrollTop: $('#' + $(this).attr('href').substring(1)).offset().top }, 'slow').trigger('scroll');
		});
		
		$("#top").on('click', function () {
			$("html, body").animate({scrollTop: 0}, 'slow');
		});
		
		$(window).on('scroll', function () {
			if ($('.dpop-sect-top').length && $(this).scrollTop() >= Math.floor($('.dpop-sect-top').next().offset().top)) {
				$('#top').fadeIn();
			} else {
				$('#top').fadeOut();
			}
		});
		
		update_values();

		$('[class*="scrollanim-"]').each(function(){
			var animElem = this.className.match(/^(?:.*?\s)?(?:scrollanim-)(.*?)(?:\s.*)?$/)[1].split('-').filter(Boolean);

			if (animElem.length) {
				if (ANIM_ARRAY.indexOf(animElem[0]) !== -1) {
					$(this).attr('data-animation', animElem[0]).attr('data-timeout', (IS_MOBILE ? ANIM_DELAY : (animElem[1] || ANIM_DELAY)));
				}
            }
		});
      
		if (Modernizr.touch) {
			$('[class*="scrollanim-"]').addClass('animated');
		}

		$WINDOW.on('scroll', function() {
			scroll_reveal();
		}).on('resize', function(){
			update_values();
		});
      
      	scroll_reveal();
	});
	
	function update_values() {
		IS_MOBILE = $WINDOW.width() <= 1019;
		PAD = $WINDOW.height() * (IS_MOBILE ? PAD_MOBILE_RATIO : PAD_DESKTOP_RATIO);
	}

	function scroll_reveal() {
		var scrolled = $WINDOW.scrollTop();

		// Show
		$('[class*="scrollanim-"]:not(.animated)').each(function () {
			var $self = $(this);

			if (scrolled + PAD > $self.offset().top) {

				if ($self.data('timeout')) {
					window.setTimeout(function() {
						$self.addClass('animated ' + $self.data('animation'));
						
						if ($self.prop('tagName') === 'VIDEO' && !$self.hasClass('noautoplay')) {
							$self[0].play();
						}
					}, parseInt($self.data('timeout'), 10) );
				} else {
					$self.addClass('animated ' + $self.data('animation'));
				}
			}
		});

		// Hide
		if (ANIM_REPLAY) {
			$('[class*="scrollanim-"].animated').each( function() {
				var $self = $(this);

				if (scrolled + PAD < $self.offset().top) {
					$self.removeClass(ANIM_ARRAY.concat('animated').join(' '));
					
					if ($self.prop('tagName') === 'VIDEO') {
						$self[0].pause();
						$self[0].currentTime = 0;
					}
				}
			});
		}
	}