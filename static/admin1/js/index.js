webix.ready(function(){
    webix.ui({
        container:"main",
        view:"layout",
        rows: [
            { view:"toolbar", elements:[
                { view:"button", value:"Add",    width:100 },
                { view:"button", value:"Delete", width:100 }
            ]},
            { cols:[
                {view:"form", elements:[
                    { view:"text", placeholder:"Title"},
                    { view:"text", placeholder:"Year"}
                ]},
                { template:"Column 2" } //second column
            ]}
        ]
    });
});