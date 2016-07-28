define(['webix.mvc.core.menu'],function(menu){
	app.use(menu);

	var header = {
		type:"header", template:app.config.name
	};

	var menuId="home:menu"
	var menu = {
		view:"menu",
		id:menuId,
		width:180, layout:"y",
		select:true,
		template:"<span class='webix_icon fa-#icon#'></span> #value# ",
		data:[
			{ id:"start",	value:"start",	href:"#!/home/start"	},
			{ id:"v1",		value:"v1",		href:"#!/home/v1"		},
			{ id:"logout",	value:"退出登录",	href:"javascript:(app.doLogout())"}
		]
	};

	var ui = {
		type:"line", cols:[
			{ type:"clean", css:"app-left-panel",
				padding:10, margin:20, borderless:true, rows: [ header, menu ]},
			{ rows:[
				{ height:10},
				{
					type:"clean",
					css:"app-right-panel",
					padding:4,
					rows:[
						{$subview:true}
					]
				}
			]}
		]
	};

	return {
		$ui: ui,
		$menu: menuId,
		$onurlchange:function(config, url, $scope){
			app.checkLogin();
		}
	};
	
});
