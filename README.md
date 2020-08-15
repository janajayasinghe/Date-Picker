# JQuery mobile date picker
HTML input tag
`< input id='datepicker' type="text" / >`

Script :
```
  jQuery("#datepicker").dateSelector({
  
                        onChange: function(date) {
                        
                            var currDate = formatDate(date);
                            
                            }                            
                    });
```

Default options:

position: "C", // T-top C-center B-bottom I-inline

selectedDate: new Date(), // today

maxDate: null,

minDate: null,

dateFmt: "MM/dd/yyyy",

dmyOrder: "MDY", // Month Day Year

monthFormat: "NNN", // MM,MMM,NNN (02,February,Feb)

onChange: function(date) {} // Empty function
