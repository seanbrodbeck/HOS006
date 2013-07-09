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
*/var stickyStack=function(e){var t=[];$(e.toStick).each(function(){var e=$(this.selector)[0];e&&t.push({node:e,initTop:$(e).offset().top,onStick:this.onStick})});if(t.length){t.sort(function(e,t){return e.initTop-t.initTop});var n=document.createElement("div");n.style.position="fixed";n.style.top="0px";n.style.margin="0px auto";n.style.zIndex="99";n.id="ss_fixedDiv";var r=$(e.wrapper)[0];if(r){n.style.width=$(r).width()+"px";$(r).prepend(n)}else{n.style.width="100%";$("body").prepend(n)}var i;if(e.bottomBound&&e.bottomBound.selector)var i=$(e.bottomBound.selector)[0];var s,o=0;$(window).scroll(function(){var r;s=window.scrollY;$(t).each(function(e){var t=this.cloned;if(this.initTop<s){r=e;t&&(s=$(t).offset().top+$(t).outerHeight())}else if(t){o-=$(t).outerHeight();this.node.style.visibility="visible";t.parentNode.removeChild(t);delete this.cloned}});if(r!==undefined){for(var u=0;u<=r;u++)if(!t[u].cloned){var a=t[u],f=t[u-1],l=a.node,c=$(l).clone(!0)[0];$(n).append(c);c.style.position="absolute";c.style.top=u==0?"0px":o+"px";c.style.left=$(l).offset().left-$(n).offset().left+"px";c.style.width=$(l).innerWidth()+"px";c.className+=" ss_stuck";l.style.visibility="hidden";a.cloned=c;a.onStick&&a.onStick(c);o+=$(c).outerHeight()}if(i&&t[r].cloned){var h=$(i).offset().top;h-=e.bottomBound.margin?e.bottomBound.margin:0;o+window.scrollY>h?n.style.top="-"+(o+window.scrollY-h)+"px":n.style.top="0px"}}e.labelLove&&updateLabel(e.labelLove.labelSel,e.labelLove.matchSel,e.labelLove.attribute)})}else console.log("No stickyStack target elements found");$(document).ready(function(){updateLabel(e.labelLove.labelSel,e.labelLove.matchSel,e.labelLove.attribute)})},updateLabel=function(e,t,n){var r=$(e)[0],i=$(r).offset().top;$(t).each(function(){var e=i-$(this).offset().top;e>0&&e<$(this).outerHeight(!0)&&$(r).html($(this).attr(n))})},skinnyHead=function(e){console.log("header callback")};