var api = {};
$(function() {
	// Functionality Enabling/Disabling
	enableWorkSlider();
	//enableInstagramFeed();
	enableWorkDetailSticky();
	

	function enableWorkDetailSticky() {
		if ( $('body.work-detail').length < 1 || $(window).width() < 767 ) return false;
		var sss = { toStick: [//{selector: 'header .inner-wrap', onStick: skinnyHead}, 
		{selector: '.wrap .split3_1-2 .col.first'}],
	                bottomBound: {selector: '#contact', margin: 60},
				    labelLove: {
				        labelSel: '.ss_stuck .module p.meta',
				        matchSel: '.split3_1-2 .col img[data-caption]',
				        attribute: 'data-caption'
				    }
	              };
	    stickyStack(sss);
	};

	function enableWorkSlider() {
		if ( $('.wrap.work').length < 1 ) return false;

		var options = {};
		init();

		function init() {
			options = {
				container: $('.wrap.work'),
				nav: $('.subnav'),
				currentIndex: getCurrentIndex(),
				royalSlider: undefined
			};
			
			setCurrentIndex(options.currentIndex);
			enableListeners();
			enableRoyalSlider();
			setupHTML();

		}

		function setCurrentIndex(index) {
			var max = ( options.royalSlider != undefined )?options.royalSlider.numSlides - 1:options.nav.find('li').length - 1;
			index = Math.max(0,index);
			index = Math.min(max,index);
			options.currentIndex = index;

			// Update Interface to Reflect New Index
			options.nav.find('.on').removeClass('on');
			options.nav.find('li').eq(options.currentIndex).addClass('on');
			if ( options.royalSlider != undefined ) options.royalSlider.goTo(options.currentIndex);
		}

		function getCurrentIndex() {
			var urlHash = document.location.hash;
			var currentIndex;
			if (urlHash.indexOf('#work-') >= 0) {
				currentIndex = parseInt(urlHash.replace('#work-',''), 10) - 1;
			} else {
				currentIndex = 0;
			}
			return currentIndex;
		}

		function setupHTML() {
			// the branding page is always loaded with the template
			$('section.page#branding').data('loaded', true);

			// determine if there's a url hash, and if so, we need to load that page too
			if(getCurrentIndex() != 0)
			{
				href = "/site/work/" + document.location.hash;
				page = $('nav.subnav a[href$="' + href + '"]').data('page');
				loadPage(page);
			}
		}

		function enableListeners() {
			$(document).on('click','.subnav a',function(e){
				setCurrentIndex($(e.target).parent().index());
				e.preventDefault();

				loadPage($(this).attr('data-page'));
				//$('.wrap.work').royalSlider('updateSliderSize', true);
				options.royalSlider.updateSliderSize(true);
				// reset archive drawer on page change
 				$(".see-more .drawer").slideUp("fast").html('');
 					

 				if  ($('nav.subnav ul li.on a').data('page') == "branding" || $('nav.subnav ul li.on a').data('page') == "in-house" || $('nav.subnav ul li.on a').data('page') == "ads-collateral") {
 					$(".see-more").hide();
 				}
 				else {
 					$(".see-more").show();

 				}

			});
		}




		function loadPage(page) {
			var section = $('section.page#' + page);

			if(section.data('loaded') != true)
			{	
				section.find('h1').after('<div class="loading"><img src="/public/a/i/ajax-loader.gif"></div>');
				
				
				section.find('div.page-content').hide().load('/inc/' + page, function(){
					
					section.find('div.loading').remove();
					$(this).fadeIn(1000);
				});
				
				section.data('loaded', true);
				$('.wrap.work').royalSlider('updateSliderSize', true);
			}

			setTimeout(function(){
				options.royalSlider.updateSliderSize(true);
			}, 1000);

			setTimeout(function(){
				options.royalSlider.updateSliderSize(true);
			}, 2000);

			setTimeout(function(){
				options.royalSlider.updateSliderSize(true);
			}, 5000);

			setTimeout(function(){
				options.royalSlider.updateSliderSize(true);
			}, 7000);
			
		}

		$(window).resize(function(){
			options.royalSlider.updateSliderSize(true);
		})

		function enableRoyalSlider() {
			options.royalSlider = options.container.find('.pages').royalSlider({
				keyboardNavEnabled: true,
				autoHeight: true,
				startSlideId: options.currentIndex,
				slidesSpacing: 75,
				allowCSS3: false,
				numImagesToPreload: 2,
				transitionType: 'fade',
				deeplinking: {
		    		enabled: true,
		    		change: true,
		    		prefix: 'work-'
		    	},
		    	sliderDrag: false
			});
			options.royalSlider = options.royalSlider.data('royalSlider');

			options.royalSlider.ev.on('rsBeforeAnimStart',function(e){
				setCurrentIndex(options.royalSlider.currSlideId);
			});
		}

		api.options = options;
		api.setCurrentIndex = setCurrentIndex;
	}


	function enableInstagramFeed() {
		if ( $('[data-load="instagram"]').length < 1 ) return false;

		var options = {};
		init();

		function init() {
			options = {
				container: $('[data-load="instagram"]')
			};

			setupHTML();
			requestData();
		}

		function setupHTML() {
			options.container.empty();
		}

		function buildHTML(items) {
			for (var i in items) {
				outputItem(items[i]);
			}
		}

		function outputItem(item) {
			
			var likeWord = (item.likes == 1)?'Like':'Likes';
			var block = $('<div class="block-instagram" data-id="' + item.id + '" />');
			var link = $('<a href="' + item.link + '">');
			link.append('<img src="' + item.url + '" alt="' + item.caption + '" />');
			var para = $('<p/>');
			para.append('<span class="likes">' + item.likes + ' ' + likeWord + '</span>');
			para.append('<em>' + $.timeago(item.time) + '</em>');
			block.append(link).append(para).appendTo(options.container);
		}

		function requestData() {
			$.ajax({
				url: '/a/j/data/instagram-10.json',
				success: function(response){
					var items = [];
					options.pagination = response.pagination;
					for (var i in response.data) {
						var item = response.data[i];
						items.push(parseInstagramObject(item));
					}
					buildHTML(items);
				}
			});
		}

		function parseInstagramObject(item) {
			var datetime = new Date(0);
			datetime.setUTCSeconds(item.created_time);

			var parsed = {
				id: item.id,
				url: item.images.standard_resolution.url,
				link: item.link,
				likes: item.likes.count,
				time: datetime
			};
			if ( item.caption != null ) parsed.caption = item.caption.text;
			return parsed;
		}
	}
});


jQuery(document).ready(function($) {
 	$(".contact-trigger a").click(function(event){
		event.preventDefault();
		$('html,body').animate({scrollTop:$(this.hash).offset().top}, 800);
	});

 	$(".see-more h2 a").click(function(event){
 		$(".drawer").slideToggle("fast");
 		event.preventDefault();
 	});

 	$(".blog-trigger").click(function(event){
 		$(".social-footer .adjunct-header a").removeClass("on");
 		$(this).addClass("on");
 		$(".blog-panel").fadeIn("fast");
 		$(".insta-panel").fadeOut("fast");
 		$('.royalSlider').royalSlider('updateSliderSize', true);
 		event.preventDefault();
 	});
 	$(".insta-trigger").click(function(event){
 		$(".social-footer .adjunct-header a").removeClass("on");
 		$(this).addClass("on");
 		$(".royalSlider").data('royalSlider');
		$(".insta-panel").fadeIn("fast");
 		$(".blog-panel").fadeOut("fast");
 		$('.royalSlider').royalSlider('updateSliderSize', true); 
 		event.preventDefault();
 	}) 	
 	/* Scroll to top on load */
	//$('html, body').stop().animate({ scrollTop: 0 }, 500);


});

$(window).load(function (){

	$('.royalSlider').royalSlider('updateSliderSize', true); 


	var $carouselHeight = $(".carousel").height();
	var $controlPosition = $carouselHeight/2;

	$(".image-pager").css("top", $controlPosition)


	var $contentHeight = $(window).height();
	var $pagerPosition = $contentHeight/2;

	
	$(".pager").css("top", $pagerPosition).show()
});


$(window).load(function (){
	$('.social-footer .blog-panel .split3').each(function(){  
	     var $columns = $('.col',this);
	     var maxHeight = Math.max.apply(Math, $columns.map(function(){
	         return $(this).height();
	     }).get());
	     $columns.height(maxHeight);
	});
});


$(window).resize(function (){
	$('.social-footer .blog-panel .split3').each(function(){  
	     var $columns = $('.col',this);
	     var maxHeight = Math.max.apply(Math, $columns.map(function(){
	         return $(this).height();
	     }).get());
	     $columns.height(maxHeight);
	});
});

// $(document).ready(function (){
// 	$('.split3_2-1-alt.cards').each(function(){  
// 	     var $columns = $('.col',this);
// 	     var maxHeight = Math.max.apply(Math, $columns.map(function(){
// 	         return $(this).height();
// 	     }).get());
// 	     $columns.height(maxHeight);
// 	});
// });	

// $(window).resize(function (){
// 	$('.split3_2-1-alt.cards').each(function(){  
// 	     var $columns = $('.col',this);
// 	     var maxHeight = Math.max.apply(Math, $columns.map(function(){
// 	         return $(this).height();
// 	     }).get());
// 	     $columns.height(maxHeight);
// 	});
// });	

$(window).load(function (){
	var $headerHeight = $("header").height();
	var $drawerHeight = $(".search-drawer").height();
	var $windowHeight = $(window).height();
	var $footerHeight = $("footer").height();
	var $contentHeight = $('.search-wrap').height();

	var $newContentHeight = $windowHeight - $headerHeight - $footerHeight

	$(".search-results").css('height', $contentHeight );
	$(".search-wrap").css('min-height', $newContentHeight );


});	

$(window).resize(function (){
	var $headerHeight = $("header").height();
	var $drawerHeight = $(".search-drawer").height();
	var $windowHeight = $(window).height();
	var $footerHeight = $("footer").height();
	var $contentHeight = $('.search-wrap').height();

	var $newContentHeight = $windowHeight - $headerHeight - $footerHeight
	
	$(".search-results").css('height', $contentHeight );
	$(".search-wrap").css('min-height', $newContentHeight );
	
});	


$(document).ready(function(){
	var $label = $(".col img:first-child").attr("data-caption");
	$(".work-detail .meta").text($label);
})


// $(document).ready(function(){
// 	if ($(window).width() < 800){
// 		var $slider = $(".social-footer .blog-panel")
// 		slider.destroy(); 
// 	}
// });





