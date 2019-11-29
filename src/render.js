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

// old 2017 F100 url https://interactive.guim.co.uk/docsdata/1ijYpfwo56EuZuE98Qj1k11WMJC-SRTKj_12kw-Pcrvs.json
// old 2018 https://interactive.guim.co.uk/docsdata/1z83ACM3aUr_toXtNlhYPh394Wn9LaGt2_M5Lifgjgrc.json


export function render() {
    return rp({
        uri: 'https://interactive.guim.co.uk/docsdata/1AH6d9-VMIGN9ya326QnbOqpW2yT-RnGJ9vSDN7sNsj8.json',
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

