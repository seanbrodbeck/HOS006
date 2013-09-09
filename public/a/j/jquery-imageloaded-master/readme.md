This plugin abstracts the typical use case for [https://github.com/desandro/imagesloaded](https://github.com/desandro/imagesloaded) which is as follows:

- Select a group of images
- Hide the image and show a loading indicator
- Trigger imagesloaded
- On imagesloaded success, remove the loading indicator and show the image
- On imagesloaded failure, remove the loading indicator and show a broken image icon

It allows you to do all this with one call: 

```
$images = $('img');

$images.each(function(elem, idx) {
    element.imageload({delay: 100 * idx});
});
// @Note support for calling $('img').imageload({delay: 100}); was removed when angular support was added. 
// It should be added back in future revisions
```

Each image will get wrapped with a `<span class="image-loading"><span>`. Use the following css to ensure the span wraps the image properly. 
__@note this has only been tested with bootstrap and responsive images, but should work in most cases.__ 

```
.image-loading {
    position: relative;
    display: inline-block;
    /*float: left;*/
    width: 100%;
}
```

In additon, it adds the followng options

- Minimum time before image is shown
- Time for the image fade in
- Option to show all images at once or fade them in sequentially
- Callbacks support
- More options...

**Notes**

- The plugin needs some documentaiton Love. It was used on the A1 project and before FacultyCreate and before that on BDDW. 
- It may have been modified for A1, but I'm not positive and if so, changes wasn't integrated back into the repo. 
- On the FacultyCreative site, we added a check for IE. We also changed it to not watch the doucment automatically, and changed how the images were passed in (collection vs. single element)
- @note is uses the previous version of Images Loaded. Which works fine, but could benefit from updating. 


**Todo**

- Add demo, tests and gruntfile
- Update to imagesloaded 3
- add event shim, etc. for ie legacy support
- Cleanup single / collection support
- provide clear demos for both angular and jquery, single and collection. For angular provide a scope watch example.

