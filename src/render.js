import Handlebars from 'handlebars/dist/handlebars'
import rp from 'request-promise'
import mainTemplate from './src/templates/main.html!text'


// Handlebars.registerHelper("ifvalue", function(conditional, options) {
//     if (conditional == options.hash.equals) {
//         return options.fn(this);
//     } else {
//         return options.inverse(this);
//     }
// }); DELETE


export function render() {
    return rp({
        uri: 'https://interactive.guim.co.uk/docsdata/1yKh0V2u8VnW1B_MYCHG1ggcTN6a0bl8gDuXmY8LEAtY.json',
        json: true
    }).then((data) => {
        var sheets = data.sheets;        
        //var maxSteps = sheets.Floors.length; DELETE

        // sheets.Floors.map((obj,k)=>{
        //     obj.maxSteps = maxSteps; //aded maxSteps ref for app.js

        //     if(obj.Victims_status){
        //         obj.hasVictims = true;
        //     }else{
        //         obj.hasVictims = false;
        //     }

        //     console.log(obj.hasVictims);


        // }) DELETE

        var hbMainTemplate = Handlebars.compile(mainTemplate);
        var compiled = hbMainTemplate(sheets);
        var html = compiled;
        return html;
    });

  
}

