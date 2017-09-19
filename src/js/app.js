//import 'svelte/ssr/register'
import xr from 'xr'
import Handlebars from 'handlebars/dist/handlebars'
import Scrolling from 'scrolling';
import Blazy from 'blazy';

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
var bLazy;


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

    console.log(dataIn);

    var obj, dataOut = {}, arr;

    for (var key in dataIn) {
        
        arr = [];
        //var obj = data.messages[key];
        for (var i=0;i<dataIn[key].length;i++) {
            obj = dataIn[key][i];
            obj["Index"] = i;
            obj["Rank"] = dataIn[key][i].Rank || i + 1;

            // Corrections from old data

            obj["Grid view image"] = obj["Thumb Image URL 500 x 500px"];
            obj["Grid view image parameters"] = obj["Thumb Image Parameters"];
            obj["Grid_image_src"] = obj["Grid view image"]; // No parameters used

            obj["List view image"] = obj["Main Image URL landscape 900 x 506px"];
            obj["List view image parameters"] = obj["Main Image Parameters"];
            obj["List_image_src"] = obj["List view image"]; // No parameters used


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
      resizeTimeout = setTimeout(updateOnResize, 250);
    });

    window.onbeforeunload = function(){ window.scrollTo(0,0); } //resets scroll on load

    Scrolling(window, updateOnScroll());  // method to add a scroll listener -- https://www.npmjs.com/package/scrolling

    bLazy = new Blazy(
        {
            selector: ".gv-blazy",
            offset: 200
        }     
    );

    window.setTimeout(function() {
        updateLazyLoad();
        }, 200);

    //rightPane = document.getElementById("right-wrap");
    //Scrolling(rightPane, updateViewAfterScroll);

}

function updateLazyLoad() {
    
    bLazy.revalidate();
     
    window.setTimeout(function() {
    updateLazyLoad();
    }, 1000);
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
        e.stopPropagation();
        console.log(clickedIndex);
        toggleView();

//         // default options
//         const options = {
//             // duration of the scroll per 1000px, default 500
//             speed: 500,
           
//             // minimum duration of the scroll
//             minDuration: 250,
           
//             // maximum duration of the scroll
//             maxDuration: 1500,
           
//             // DOM element to scroll, default window
//             // Pass a reference to a DOM object
//             // Example: document.querySelector('#element-to-scroll'),
//             element: window,
           
//             // should animated scroll be canceled on user scroll/keypress
//             // if set to "false" user input will be disabled until animated scroll is complete
//             cancelOnUserAction: false,
           
//             // function that will be executed when the scroll animation is finished
//             onComplete: updateAfter()
//           };
   
//   const desiredOffset = 1000;
//       animateScrollTo(document.getElementById("list-entry_"+ clickedIndex), options);
  }
    
}

function updateAfter() {

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





