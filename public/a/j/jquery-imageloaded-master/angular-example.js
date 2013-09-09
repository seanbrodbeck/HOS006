.directive('img',["$location","$rootScope", function($location, $scope) {        
        
        var idx = 0;
        
        // Clear the images array on each location start
        $scope.$on('$locationChangeStart', function() {
            $scope.imageArray = [];
            idx = 0;
            //console.log('Content is loaded, we are looking for images now...');
        });
        
        // our linker will collect each image into the array
        var linker = function(scope,element,attrs) {
             
            if(!element.attr('shouldIgnore')) {
                element.imageload({delay: 100 * idx});
                idx++;
            }
            
        };
        
        $scope.$watch('$viewContentLoaded', function() {
            //console.log('Image array contains ' + $scope.imageArray.length + ' images.');
        });
        
        /*

        // create empty array to hold our images
        var pageImages = [];
        
        // linker will run for each img found on page
        // linker pushes each images into our array
        var linker = function(scope,element,attrs) {
            pageImages.push('Matt');
            console.log('Adding 1 image');
        };
        
        // watch for the array to be filled
        // Not sure why, but this only runs one time when the image array has been filled with 
        // all images. It doesn't run for each items
        $scope.$watch('$scope.pageImages', function() {
            console.log('pageImages have changed'); 
            console.log('Image array contains ' + $scope.pageImages.length + ' images.');
        });
        
        $scope.$on('$viewContentLoaded', function(event) {
            //console.log('View content loaded, there are ' + pageImages.length + ' images.');
        });
        
        $scope.$on('$routeChangeStart', function(event) {
            $scope.pageImages = [];
            
            //pageImages = [];
            //console.log('Clearing the pageImages array, length is now: ' + $scope.pageImages.length);
        });
*/

        // return and restrict to class, meaning only classes can be used to trigger this directive
        // the classname will be the first param we passed into the directive, 'backButton'
        return {
            restrict:'CE',
            link:linker,
            scope: {
                shouldIgnore: '@shouldIgnore'
            }
        }; 
    }])