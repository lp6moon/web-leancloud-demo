define([],function(){
	var checkLogin=function(){
		$.get('common/user/token').then(function(res){
			if(res.data) AV.User.become(res.data);
		})
	}

	checkLogin();
	return {
		$ui:{template:"<div>home</div>"},
		$oninit:function(view,$scope){
			window.$v=$(view.$view);
		},
		$onurl:function(){
			console.log(arguments)
		}
	};
	
});
