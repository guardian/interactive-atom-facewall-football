//import 'svelte/ssr/register'
import xr from 'xr'
import Handlebars from 'handlebars/dist/handlebars'
import Scrolling from 'scrolling';

import { groupBy } from './libs/arrayObjectUtils.js'
import { share } from './libs/share.js';

import gridTemplate from '../templates/grid.html'
import listTemplate from '../templates/list.html'
//import gridPicTemplate from '../templates/gridPic.html'
//import detailItemTemplate from '../templates/detailItem.html'
//import gridThumbTemplate from '../templates/thumbPic.html'
//import thumbsTemplate from '../templates/thumbsGallery.html'
//import cellTemplate from '../templates/gridCell.html'

import animateScrollTo from 'animated-scroll-to'; //https://www.npmjs.com/package/animated-scroll-to

//var shareFn = share('Grenfell Tower', 'https://gu.com/p/72vvx');

var gridViewBool = true;
var resizeTimeout = null;

function isMobile() {
    var dummy = document.getElementById("gv-mobile-dummy");
    if (getStyle(dummy) == 'block') {
        return true;
    } else {
        return false;
    } 
}

function getStyle (element) {
    return element.currentStyle ? element.currentStyle.display :
    getComputedStyle(element, null).display;
}

xr.get('https://interactive.guim.co.uk/docsdata/1_F-62z-eeeV1mP3OS1SNcF4b8s3deiAx0bxVmDqP98Q.json').then((resp) => {

    //var data = formatData(resp.data.sheets.english);
    var data = resp.data.sheets;
    data = cleanData(data);

    console.log(data.english[0]);
    var compiledHTML = compileHTML(data);
    document.querySelector(".gv-grid-view-inner").innerHTML = compiledHTML.grid;
    document.querySelector(".gv-list-view-inner").innerHTML = compiledHTML.list;
    addListeners();
    //updatePageDate();
    //upDatePageView(data);
});

function cleanData(dataIn) {

    var obj, dataOut = {}, arr;

    for (var key in dataIn) {
        
        arr = [];
        //var obj = data.messages[key];
        for (var i=0;i<dataIn[key].length;i++) {
            obj = dataIn[key][i];
            obj.index = i;
            arr.push(obj);
            //console.log(i);
        }
        
        dataOut[key] = arr;
    }

    return dataOut;
}

function compileHTML(dataIn) {

        var newHTML = {}, content;
    
        Handlebars.registerHelper('html_decoder', function(text) {
            var str = unescape(text).replace(/&amp;/g, '&');
            return str;
        });
    
        // Handlebars.registerPartial({
        //     'gridCell': cellTemplate
        // });
    
        content = Handlebars.compile(
            gridTemplate, {
                compat: true
            }
        );
    
        newHTML.grid = content(dataIn);

        content = Handlebars.compile(
            listTemplate, {
                compat: true
            }
        );
    
        newHTML.list = content(dataIn);
    
        return newHTML
    
    }

function addListeners() {
    [].slice.apply(document.querySelectorAll('.gv-share-container button')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click', () => shareFn(network));
    });

    document.querySelector('.toggle-view-overlay-btn').addEventListener('click', toggleView);
    document.querySelector('.gv-grid').addEventListener('click', updateOnGridClick);   
   

    window.addEventListener('resize', function() {
      // clear the timeout
      clearTimeout(resizeTimeout);
      // start timing for event "completion"
      resizeTimeout = setTimeout(resizeUpdate, 250);
    });

    window.onbeforeunload = function(){ window.scrollTo(0,0); } //resets scroll on load

    Scrolling(window, scrollUpdate);  // method to add a scroll listener -- https://www.npmjs.com/package/scrolling

    //rightPane = document.getElementById("right-wrap");
    //Scrolling(rightPane, updateViewAfterScroll);

}


function updateOnScroll() {
    console.log("scrolled");
    checkFixElements();
}

function updateOnResize() {
    console.log("resized");
    updateOnScroll();
}

function updateOnGridClick( e ) {
    if (e.target !== e.currentTarget) {
        var clickedIndex = parseInt(e.target.dataset.index);
        alert(clickedIndex);
    }
    e.stopPropagation();
}

function toggleView() {
    console.log("toggled");
    gridViewBool = !gridViewBool;

    if (gridViewBool) {
        showGrid();
    } else {
        hideGrid();
    }
}

function showGrid() {
    document.querySelector('.gv-grid-view').classList.remove('close');
    document.querySelector('.gv-grid-view').classList.add('open');
}

function hideGrid() {
    document.querySelector('.gv-grid-view').classList.add('close');
    document.querySelector('.gv-grid-view').classList.remove('open');
}

function jumpToIndex( ind ) {
    
}

function checkFixElements() {

}





