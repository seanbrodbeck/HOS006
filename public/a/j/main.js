function showArchive(subPage){
	if  (subPage == "branding" || subPage == "in-house" || subPage == "ads-collateral") {
				$(".see-more").hide();
	}else {
		$(".see-more").show();

	}
}

var api = {};
$(function() {
	//alert($siteURL);
	// Functionality Enabling/Disabling
	enableWorkSlider();
	//enableInstagramFeed();
	//enableWorkDetailSticky();
	

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
				options.royalSlider.updateSliderSize(true);
				// reset archive drawer on page change


				//Show Archive Link if correct section
 				showArchive($('nav.subnav ul li.on a').data('page'));

			});
		}

		function loadPage(page) {
			var section = $('section.page#' + page);

			
			if(section.data('loaded') != true)
			{	
				section.find('h1').after('<div class="loading"><img src="'+ $siteURL +'public/a/i/ajax-loader.gif"></div>');
				
				
				section.find('div.page-content').hide().load($siteURL + 'inc/' + page, function(){
					
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
				url: $siteURL + '/a/j/data/instagram-10.json',
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

    // validation for footer forms
    $("#contact_form").validate();
    $("#mailing_form").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent("form"));
        }
    });

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
	
	//Scroll curtain up on click
	$('#masthead').on('click', function(){
		/*
var scrollOffset = $('#home-ps').offset().top;
		$("html, body").animate({ scrollTop: scrollOffset-100 });
*/	
		$(this).slideUp();
	});
	

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
	
	/* if page is refreshed or linked to check for subpage to load archive */
	
	//Show Archive Link if correct section
	//Show Arhicve from page load
	if($('.subnav')){
		showArchive($('.subnav ul li.on a').data('page'));
	}
	
	//Show Archive From click
	$(document).on('click','.subnav a',function(e){
		var subSection = $('nav.subnav ul li.on a').data('page');

		//Show Archive Link if correct section
		showArchive(subSection);
	});


	/* Set up Class for CSS transtion of description */
	$(document).on('mouseover', '.grid-block a',  function(){
		$(this).find('.block-caption-more').addClass('open');
	});
	
	$(document).on('mouseout', '.grid-block a', function(){
		$(this).find('.block-caption-more').removeClass('open');
	});
	
	// Show search modal
	$('#search-modal-button').click(function(e){
		e.preventDefault();
		$('#search-modal').fadeIn(500);
		$('#search-modal-keywords').focus();
	});

	// Close search modal
	$('#search-modal-close').click(function(e){
		e.preventDefault();
		$('#search-modal').fadeOut(100);
	});

	// Catch the search modal submit event
	// and do the searches via ajax
	$('#search-modal-form').submit(function(e){
		e.preventDefault();

		// grab the keywords field
		var keywords = $('#search-modal-keywords').val();
		
		// clear any existing results
		$('.search-results .wrap').html('');

		// set the two hidden keywords field
		// values to the user input
		$('#blog-keywords').val(keywords);
		$('#work-keywords').val(keywords);

		// perform the ajax post for the blog search
		var action = $('#blog-search-form').attr('action');
		var form = $('#blog-search-form').serialize();

		$.post(action, form, function(data){
			$('.search-results .wrap').append(data);
		});

		// perform ajax post for the work search
		var action = $('#work-search-form').attr('action');
		var form = $('#work-search-form').serialize();

		$.post(action, form, function(data){
			$('.search-results .wrap').append(data);
		});

	});

	// Load archives
	$('.see-more h2 a').click(function(e){
		e.preventDefault();
		
		var page = $('nav.subnav ul li.on a').data('page');

		var category = $('section#' + page + ' input.category').val();
		var children = $('section#' + page + ' input.children').val();
		children.replace('|', '&');

		$.get($siteURL + 'inc/archives/' + category + '/' + children, function(data) {
				$('#archive-holder').html(data);
			});
		
	});


	$(document).on('click','.about-list .clients-head',function(e){
		$(".head-wrap h3").removeClass("on");
			$(this).addClass("on");
			$(".accolades, .speaking").hide();
			$(".about-list .clients").show();
	});
	$(document).on('click','.about-list .accolades-head',function(e){
			$(".head-wrap h3").removeClass("on");
			$(this).addClass("on");
		$(".clients, .speaking").hide();
		$(".about-list .accolades").show(); 			
	});
	$(document).on('click','.about-list .speaking-head',function(e){
		$(".head-wrap h3").removeClass("on");
			$(this).addClass("on");
		$(".accolades, .clients").hide();
		$(".about-list .speaking").show();
	});
	
})


