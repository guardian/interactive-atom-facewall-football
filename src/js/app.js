//import 'svelte/ssr/register'
import xr from 'xr'
import Handlebars from 'handlebars/dist/handlebars'
import Scrolling from 'scrolling';
import Blazy from 'blazy';

import { groupBy } from './libs/arrayObjectUtils.js'
//import { share } from './libs/share.js';



import gridTemplate from '../templates/grid.html'
import listTemplate from '../templates/list.html'


import shares from './share'

let shareFn = shares('Who are the best of the football next generation?', 'https://gu.com/p/6mgzm?CMP=share_btn_tw', '');


//import gridPicTemplate from '../templates/gridPic.html'
//import detailItemTemplate from '../templates/detailItem.html'
//import gridThumbTemplate from '../templates/thumbPic.html'
//import thumbsTemplate from '../templates/thumbsGallery.html'
//import cellTemplate from '../templates/gridCell.html'

//import animateScrollTo from 'animated-scroll-to'; //https://www.npmjs.com/package/animated-scroll-to

//var shareFn = share('Grenfell Tower', 'https://gu.com/p/72vvx');
var data;
var gridViewBool = true;
var resizeTimeout = null;
var bLazy;
var lastScrollTop = 0;


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

    // !!!!!!!!!!! ALERT SHEET NAME HERE IS "english" !!!!!!!!!!!!!

    data = resp.data.sheets;
    data = cleanData(data);

    //console.log(data.english[0]);
    var compiledHTML = compileHTML(data);
    document.querySelector(".gv-grid-view-inner").innerHTML = compiledHTML.grid;
    document.querySelector(".gv-list-view-inner").innerHTML = compiledHTML.list;
    drawPositions( data.english );
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
            obj["DOB_text"] = dataIn[key][i]["DOB text"];
            obj["Iso"] = "bgr"; //String(dataIn[key][i]["ISO code"]).toLowerCase() || "_";

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

    Scrolling(window, updateOnScroll);  // method to add a scroll listener -- https://www.npmjs.com/package/scrolling

    bLazy = new Blazy(
        {
            selector: ".gv-blazy",
            offset: 200
        }     
    );

    window.setTimeout(function() {
        updateLazyLoad();
        }, 200);


        [].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
            var network = shareEl.getAttribute('data-network');
            shareEl.addEventListener('click', () => shareFn(network));
        });

}

function updateLazyLoad() {
    
    bLazy.revalidate();
     
    window.setTimeout(function() {
    updateLazyLoad();
    }, 1000);
}


function updateOnScroll() {
    console.log("scrolled");
    //console.log(document.documentElement.scrollTop || document.body.scrollTop);
    checkFixElements();
}

function updateOnResize() {
    //console.log("resized");
    updateOnScroll();
}

function updateOnGridClick( e ) {
    if (e.target !== e.currentTarget) {
        var clickedIndex = parseInt(e.target.dataset.index);
        e.stopPropagation();
        //console.log(clickedIndex);
        //alert(document.querySelector('.gv-grid-view').offsetTop);

        toggleView();
        jumpToIndex(clickedIndex);
  }
    
}

function toggleView() {
    //console.log("toggled");
    gridViewBool = !gridViewBool;

    if (gridViewBool) {
        showGrid();
    } else {
        hideGrid();
    }
}

function showGrid() {
    fixList(true);
    fixGrid(false);
    document.querySelector('.gv-grid-view').classList.remove('close');
    document.querySelector('.gv-grid-view').classList.add('open');
    document.querySelector('.gv-list-view').classList.remove('open');
    document.querySelector('.gv-list-view').classList.add('close');
    document.querySelector('.toggle-view-overlay-btn').classList.remove('grid-icon-show');
    window.scrollTo(0,lastScrollTop);
    window.setTimeout(function() {
        fixList(false);
    }, 1000);
}

function hideGrid() {
    lastScrollTop = document.documentElement.scrollTop || document.body.scrollTop; // Resets to last viewed area of grid
    fixGrid(true);
    fixList(false);
    document.querySelector('.gv-grid-view').classList.remove('open');
    document.querySelector('.gv-grid-view').classList.add('close');
    document.querySelector('.gv-list-view').classList.remove('close');
    document.querySelector('.gv-list-view').classList.add('open');
    document.querySelector('.toggle-view-overlay-btn').classList.add('grid-icon-show');
}

function fixGrid( fix ) {

    //alert(fix);

    var viewportOffset, t, l, w, grid;

    if (fix == true ) {
        // alert("called");
        grid = document.querySelector('#gv-grid-view');
        viewportOffset = grid.getBoundingClientRect();
        t = viewportOffset.top;
        l = viewportOffset.left;
        w = viewportOffset.width;
        grid.style.top = t + "px";
        grid.style.left = l + "px";
        grid.style.width = w + "px";
    } else {
        
        grid = document.getElementById('gv-grid-view');
        grid.style.top = "";
        grid.style.left = "";
        grid.style.width = "";
       
       
    }
}

function fixList( fix ) {
    
        var viewportOffset, t, l, w, list = document.querySelector('.gv-list-view');
    
        if (fix) {
            viewportOffset = list.getBoundingClientRect();
            t = viewportOffset.top;
            l = viewportOffset.left;
            w = viewportOffset.width;
            list.style.top = t + "px";
            list.style.left = l + "px";
            list.style.width = w + "px";
            list.style.position = "fixed";
        } else {
            list.style.top = "";
            list.style.left = "";
            list.style.width = "";
            list.style.position = "";
        }
    }

function jumpToIndex( ind ) {
    document.querySelector('#list-entry_' + ind).scrollIntoView( true );
}

function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var offsetHeight = elem.offsetHeight || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    var bottom = top + offsetHeight;

    return { top: Math.round(top), left: Math.round(left), bottom: Math.round(bottom) };
}

function checkFixElements() {

    if (!isMobile()) {

    //let h = document.getElementById("bannerandheader").offsetHeight || 0;

    var h = getCoords(document.getElementById("gv-header")).bottom;




    //console.log("oh=" + h);
    
    var pos_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
        console.log("pos_top=" + pos_top);
        console.log("oh=" + h);
        
    
        if (pos_top > h) {
            console.log("fixed");
            document.querySelector('#toggle-view-overlay-btn').classList.add('gv-fixed');
            document.querySelector('#toggle-view-overlay-btn').style.marginTop =  -h + "px";
        } else if (pos_top < h) {
            document.querySelector('#toggle-view-overlay-btn').classList.remove('gv-fixed');
            document.querySelector('#toggle-view-overlay-btn').style.marginTop = "0";
        }

    }

}

function getPositionIdArray ( positions ) {

    var i, position, arr = [];

    positions = String(positions).split("/");

    for (i=0; i< positions.length; i++) {

        position = String(positions[i]).toLowerCase().trim();

        switch ( position ) {

            case "goalkeeper" :

            arr.push("GK");

            break;

            case "forward" :
            
            arr.push("F1");
            
            break;

            case "attacking midfielder" :
            
            arr.push("M2");
            
            break;
            
            case "midfielder" :
                        
            arr.push("M3");            
                        
            break;

            case "striker" :
                        
            arr.push("F2");            
                        
            break;
                        
            case "defensive midfielder" :
                                    
            arr.push("M3");                        
                                    
            break;

            case "defender" :
            
            arr.push("D2");
            
            break;

            case "winger" :
            
            arr.push("M1");
            
            break;

        }

    }

    return arr;

}

function drawPositions( data ) {


    var i, ii, position, arr, el, id;


    for (i=0; i< data.length; i++) {
          
        arr = getPositionIdArray ( data[i].Position );
        
    
        for (ii=0; ii< arr.length; ii++) {

            id = arr[ii];

            //console.log(id);
            //var selector = '#gv-pitch_' + i + '_marker_' + id;
            //console.log(selector);

            el = document.getElementById('gv-pitch_' + i + '_marker_' + id );
            //el = document.querySelector('#list-entry_' + i  );

            console.log(el)

            el.style.visibility = "visible";

        }

    }

}





