/*
var sampleSettings = {
    toStick:[
        {
            selector: 'selector1',
            onStick: function(stuckElement) // Optional
        },
        {selector: 'selector2'} // Optional
    ],
    wrapper: 'selector3', // Optional
    bottomBound: { // Optional
        selector: 'selector4',
        margin: 100
    },
    labelLove: { // Optional
        labelSel: 'selector5', // Will only use first match
        matchSel: 'selector6', // Should be a set of multiple matches
        attribute: 'attrName' // Attribute to pull text from.
    }
}
*/

var stickyStack = function(settings) {
    var stackEles = [];
    // Use the array of toStick objects to build a new array that includes initial top offsets.
    $(settings.toStick).each(function() {
        var stackEle = $(this.selector)[0];
        if (stackEle) {
            stackEles.push({node: stackEle, initTop: $(stackEle).offset().top, onStick: this.onStick});
        }
    });

    if (stackEles.length) {
        // Sort the array by initial top offset.
        stackEles.sort(function(a,b) {
            return a.initTop - b.initTop;
        });

        // Add the fixed container
        var fixedDiv = document.createElement('div');
        fixedDiv.style.position = 'fixed';
        fixedDiv.style.top = '0px';
        fixedDiv.style.margin = '0px auto';
        fixedDiv.style.zIndex = '99';
        fixedDiv.id = 'ss_fixedDiv';
        var target = $(settings.wrapper)[0];
        if (target) {
            fixedDiv.style.width = $(target).width() + 'px';
            $(target).prepend(fixedDiv);
        } else {
            fixedDiv.style.width = '100%';
            $('body').prepend(fixedDiv);
        }

        // Get the bottom boundary element, if applicable.
        var boundingEle;
        if (settings.bottomBound && settings.bottomBound.selector) {
            var boundingEle = $(settings.bottomBound.selector)[0];
        }

        var stickyBottom, stackHeight = 0;
        // The actual onScroll handler.
        $(window).scroll(function(){
            var lowestEle;
            stickyBottom = window.scrollY;
            // Check each node's position against y-scroll to determine whether it should be stuck.
            $(stackEles).each(function(index) {
                var stuckCopy = this.cloned;
                if (this.initTop < stickyBottom) {
                    lowestEle = index;
                    if (stuckCopy) {
                        stickyBottom = $(stuckCopy).offset().top + $(stuckCopy).outerHeight();
                    }
                } else if (stuckCopy) {
                    // Remove the cloned copy & unhide the original.
                    stackHeight -= $(stuckCopy).outerHeight();
                    this.node.style.visibility = 'visible';
                    stuckCopy.parentNode.removeChild(stuckCopy);
                    delete this.cloned;
                }
            });
            // If something should be stuck...
            if (lowestEle !== undefined) {
                for (var i = 0; i <= lowestEle; i++) {
                    if (!stackEles[i].cloned) {
                        // Clone & insert fixed node. Hide original.
                        var currentItem = stackEles[i];
                        var prevItem = stackEles[i - 1];
                        var eleToHide = currentItem.node;
                        var eleToStick = $(eleToHide).clone(true)[0];
                        $(fixedDiv).append(eleToStick);

                        eleToStick.style.position = 'absolute';
                        eleToStick.style.top = i == 0 ? '0px' : stackHeight + 'px';
                        eleToStick.style.left = $(eleToHide).offset().left - $(fixedDiv).offset().left + 'px';
                        eleToStick.style.width = $(eleToHide).innerWidth() + 'px';
                        eleToStick.className += ' ss_stuck';
                        eleToHide.style.visibility = 'hidden';
                        currentItem.cloned = eleToStick;
                        if (currentItem.onStick) {
                            currentItem.onStick(eleToStick);
                        }
                        stackHeight += $(eleToStick).outerHeight();
                    }
                }
                if (boundingEle && stackEles[lowestEle].cloned) {
                    // Get the bottom boundary. May be a moving target.
                    var bottomBoundary = $(boundingEle).offset().top;
                    bottomBoundary -= settings.bottomBound.margin ? settings.bottomBound.margin : 0;
                    // This is what to do if we hit the bottomBoundary.
                    if ((stackHeight + window.scrollY) > bottomBoundary) {
                        fixedDiv.style.top = '-' + ((stackHeight + window.scrollY) - bottomBoundary) + 'px';
                    } else {
                        fixedDiv.style.top = '0px';
                    }
                }
            }
            if (settings.labelLove) {
                updateLabel(settings.labelLove.labelSel, settings.labelLove.matchSel, settings.labelLove.attribute);
            }
        });
    } else {
        console.log('No stickyStack target elements found');
    }
    $(document).ready(function(){
        updateLabel(settings.labelLove.labelSel, settings.labelLove.matchSel, settings.labelLove.attribute);
    })
};


var updateLabel = function(labelSel, matchSel, attrName) {
    var labelEle = $(labelSel)[0];
    var labelViewY = $(labelEle).offset().top;
    $(matchSel).each(function() {
        var matchDiff = labelViewY - $(this).offset().top;
        if (matchDiff > 0 && matchDiff < $(this).outerHeight(true)) {
            $(labelEle).html($(this).attr(attrName));
        }
    });
};


var skinnyHead = function(headNode) {
    // Do something to the cloned header node.
    console.log('header callback');
};

