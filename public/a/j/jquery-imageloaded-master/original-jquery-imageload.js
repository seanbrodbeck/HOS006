/**
* jQuery Plugin Template
*
* @author Faculty Creative
*
* This plugin will init itself on elements with a class you specify. Data attrs can be used to override
* default options of the plugin.
*
*
* Insipired by Bootstrap and smashing magazine patterns
* @see http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
* @see https://github.com/twitter/bootstrap
*
*
* HOW TO USE:
* - Change instances of ImageLoad and imageload to YourPluginName and yourpluginname
* - Add defaults functions
* - Plugin auto-inits based on class
*
* HOW TO AUTOINIT your plugin
* - Add classes to elements you want to be pluggable
* - Add data attrs, which will override defaults
*
* HOW TO TRIGGER PLUGIN FUNCTIONS in your code
* $(elem).yourPluginName('functionName', {option: value})
*
*/

!function ($) {
    "use strict"; // jshint ;_;
    /*jslint smarttabs:true */

    /**
    * Not much to see here, this calls init when we create a new plugin instance
    */
    var ImageLoad = function (element, options) {

        // check to make sure the element exists we are calling this on
        if(element.length === 0) return false;

        this.init('imageload', element, options);
    };

    /**
    * Main plugin functionality
    * - You should not remove 'constructor', just change to YourPluginName (note camelcase)
    * - Add default vars and call functions from init as needed, ie: this.enabled = true would be at home in init
    * - Keep log for good measures
    *
    * Beyond this, add whatever functions you need, ie: 'show', 'hide', 'toggle', 'render'
    * - Access these functions from each other by calling this.functionName
    *
    */
    ImageLoad.prototype = {

        constructor: ImageLoad,

        /**
        * Init our plugin
        */
        init: function(type, element, options) {

            // cache DOM element and jQuery element
            this.element = element;
            this.$element = $(element);
            
            // browser hacks! 
            // IE will not load hidden images, so we need to 
            this.isIE = $.browser.msie && parseInt($.browser.version, 10) === 7 ? true : false;
            this.isIE7 = $.browser.msie && parseInt($.browser.version, 10) ? true : false;

            // type is passed from init, and is what we store data inside
            this.type = type;

             // allows us to set data attrs per element, which extend
             this.options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data());

             // empty vars to hold our images on fail and success
             this.images = null;
             this.broken = null;

             // initial setup and style of image and wrapper
             
             
             this.$element.each(function(idx, elem) {
	             $(elem).attr('src', $(elem).data('src'));
             })
                
             
             
             this.$element
                .fadeTo(0,0)
                .wrap($('<span class="image-loading" />'));
             $('.image-loading').append('<span class="loading-progress" ><span class="inner" >');

             console.log(this.options.showlimit);

             // hide our images after set limit
             if(this.options.showlimit !== null) {
                  this.$element.filter(':gt('+(this.options.showlimit - 1)+')').parents('.image-loading').hide();
             }

             //
             if(this.options.mintime !== null) {
                this.mintimeReached = false;
                this.needsFadeStart = false;
                this.timer = setTimeout($.proxy(this.tooEarly, this), this.options.mintime);
             } else {
                  this.mintimeReached = true;
             }

             this.startLoad();

        },

        /**
        * Allows us to easily elinimate all console logs from our plugin by commenting out one line
        * send all logs here!
        */
        log: function(message) {
            console.log(message);
        },

        /**
        * Example function
        */
        yourFunction: function() {

            // this.$element is the jQuery element
            // this.element is the DOM element
            // this.options.optionName will return options

        },

        /**
        * Helps make sure the loader shows for a min time before images fade in
        */
        tooEarly: function() {

            // clear timeout and make sure our plugin in aware its reached the min time
            clearTimeout(this.timer);
            this.mintimeReached = true;

            this.log('Checking timer');

            // needsFadeStart will be set to true if the images are loaded and try to fade
            // before our min time is reached. In this case, lets fadeInImage now!
            if(this.needsFadeStart) {

                this.log('We need to fade!');
                this.fadeInImage();
            }

        },

        startLoad: function() {
            
            // support a callback before we start loading
	        this.options.callbackBeforeLoad();
	        
	        // @hack for IE, we need a way to "hide" the images without setting display: none
	        // because the later causes IE not to download them at all! 
	        this.$element.css({ 'height': 'auto' });
	        
            // Save a deferred object with postponed determination process
            var dfd = this.$element.imagesLoaded(),
                self = this
            ;


            // Always
            dfd.always( function(){
                   self.log( 'all images has finished with loading, do some stuff...' );
                   //self.fadeInImage();

            });

            // Resolved
            dfd.done( function( $images ){
                   // callback provides one argument:
                   // $images: the jQuery object with all images
                   self.log( 'deferred is resolved with ' + $images.length + ' properly loaded images' );

                   self.images = $images;

                   self.fadeInImage();
            });

            // Rejected
            dfd.fail( function( $images, $proper, $broken ){
                   // callback provides three arguments:
                   // $images: the jQuery object with all images
                   // $proper: the jQuery object with properly loaded images
                   // $broken: the jQuery object with broken images
                   self.log( 'deferred is rejected with ' + $broken.length + ' out of ' + $images.length + ' images broken' );

                   self.broken = $broken;

                   self.handleFailedImages();
                   
                   self.images = $images;

                   self.fadeInImage();
                   
            });

            // Notified
            dfd.progress( function( isBroken, $images, $proper, $broken ){
                   // function scope (this) is a jQuery object with image that has just finished loading
                   // callback provides four arguments:
                   // isBroken: boolean value of whether the loaded image (this) is broken
                   // $images:  jQuery object with all images in set
                   // $proper:  jQuery object with properly loaded images so far
                   // $broken:  jQuery object with broken images so far
                   self.log( 'Loading progress: ' + ( $proper.length + $broken.length ) + ' out of ' + $images.length );
            });

        },

        handleFailedImages: function() {

            var self = this;

            this.broken.each(function(idx, el){
                $(this).delay(idx * self.options.delay).animate({opacity:0}, self.options.speed, function() {
                    $(this).after('<span class="broken-image">!</span>');
                   });

                   // always fade out loading graphics
                   $(this).next('.loading-progress')
                    .delay(idx * self.options.delay)
                    .animate({opacity:0}, 100, function() {
                        $(this).remove();
                    });
            });

        },

        fadeInImage: function() {

            // if images are trying to fade in before our min time, abort
            // we set needsFadeStart so that when the min timer runs out, it knows fadeInImage
            // still needs to be triggered
            if(this.mintimeReached === false) {
                this.needsFadeStart = true;
                this.log('We are trying to fade in to early! Aborting fade.');
                return;
            }

            var self = this;

            console.log(this.images);

            this.images.each(function(idx, el){

                   // only fade in images below limit
                   if(!self.options.showlimit || idx < self.options.showlimit) {
                    $(this).delay(idx * self.options.delay).animate({opacity:1}, self.options.speed, function() {
                         if(idx === 0) {
                            self.options.callbackAfterFirstShow();
                        }
                    });
                   }

                   // always fade out loading graphics
                   $(this).next('.loading-progress')
                    .delay(idx * self.options.delay)
                    .animate({opacity:0}, 100, function() {
                        $(this).remove();
                    });
            });

            // make sure all images we didnt fade in are still visible!
            if(this.options.showlimit) {
                this.$element.filter(':gt('+(this.options.showlimit-1)+')').fadeTo(0,1);
            }

            // callback
            this.options.callbackAfterAllShow();

        }
    };

    /**
    * Simple constructor that will create new instance of plugin or call prototype functions.
    * ie: $(elem).yourPluginName() will init an new instance of the plugin
    * ie: $(elem).yourPluginName('show', {speed : 400}) will call the show method with options, if it exists
    *
    */
    $.fn.imageload = function ( option ) {

        var $this = $(this)
            , data = $this.data('imageload')
            , options = typeof option == 'object' && option
        if (!data) $this.data('imageload', (data = new ImageLoad(this, options)))
        if (typeof option == 'string') data[option]()

        return $this;
    };

    $.fn.imageload.Constructor = ImageLoad;

    /**
    * Define defaults
    */
    $.fn.imageload.defaults = {
        autoSelector: '.image-load-single',
        message : 'Hello! Matt this plugin template is working!',
        speed: 400,
        delay: 200,
        showlimit: null,
        mintime: null,
        callbackBeforeAllShow: function() {},
        callbackAfterFirstShow: function() {},
        callbackAfterAllShow: function() {},
        callbackBeforeLoad: function() {}
    };

    /**
    * Autoload out plugin by class. Will inherit data attrs.
    *
    */
    $(document).ready(function() {
    	var elems = $($.fn.imageload.defaults.autoSelector);
        elems.imageload();
    });

}(window.jQuery);
