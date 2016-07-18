require.config({
	paths: {
		'damas': "damas",
		'utils': "utils",
		'ui_log': "ui_log",
		'ui_upload': 'generic-ui/scripts/uiComponents/ui_upload',
		'domReady': '//cdn.rawgit.com/requirejs/domReady/2.0.1/domReady'
	},
	urlArgs: "v=" +  (new Date()).getTime()
});
		//'domReady': '//raw.githubusercontent.com/requirejs/domReady/latest/domReady'

require(['domReady', "damas", "utils"], function (domReady, damas) {
	require(["ui_log","ui_upload"], function () {
	window.damas = damas;
	loadCss('console.css');
	damas_connect('/api/', function (res) {
		if (!res) {
			window.location='/signIn?back=console'
		}
		if (res){
			if (damas.user)
			{
				document.querySelector('.username').innerHTML = damas.user.username;
				document.querySelector('#signOut').style.display = 'inline';
				document.querySelector('#menubar1').style.display = 'block';
			}
			document.querySelector('#menubar2').style.display = 'block';
			show_log();
		}
		else
		{
			document.querySelector('#connection').style.display = 'block';
		}

				var button = document.getElementById('but_locks');
				button.addEventListener('click', function(e){
					show_locks();
				});
				var button = document.getElementById('but_users');
				button.addEventListener('click', function(e){
					show_users();
				});


				/* UI */
				var signOut = document.getElementById('signOut');
				signOut.addEventListener('click', function( e ){
					damas.signOut( function(e){
						localStorage.removeItem("token");
						localStorage.removeItem("user");
						window.location='/signIn?back=console'
						//document.location.reload();
					});
				});

		/**
		 * Methods
		 */
		function show_users(){
			//damas.search('username:/.*/', function(res){
			damas.search_mongo({'username':'REGEX_.*'}, {"username":1},0,0, function(res){
				damas.read(res, function(users){
					console.log(users);
					window.users = users;
					var out = document.querySelector('#contents');
					out.innerHTML = '';
					for(var i=0; i<users.length; i++)
					{
						out.innerHTML +=  '<li title="'+JSON_tooltip(users[i])+'">'+users[i].username+'</li>';
					}
				});
			});
		}

		function show_locks(){
			//damas.search('lock:/.*/', function(res){
			damas.search_mongo({'lock':'REGEX_.*'}, {"lock":1},0,0, function(res){
				damas.read(res, function(assets){
					var out = document.querySelector('#contents');
					var str = '<table><tr><th>lock &xdtri;</th><th>file</th></tr>'
					for(var i=0; i<assets.length; i++)
					{
						str +=  '<tr title="'+JSON_tooltip(assets[i])+'"><td>'+assets[i].lock+'</td><td>'+assets[i].file+'</td></tr>';
					}
					str += '</table>';
					out.innerHTML = str;
				});
			});
		}

		function show_wait(){
				damas.search_mongo(
					{online:"1", file:{$exists: true}, ino_write: {$exists: false}, time: { $gt: 1463200887000} },
					{origin:1, file:1}, 0,0, function(res){

				damas.read(res, function(assets){
					var out = document.querySelector('#contents');
					var str = '<table><tr><th>file</th><th>origin &xutri;</th></tr>';
					for(var i=0; i<assets.length; i++)
					{
						str +=  '<tr>';
						//str +=  '<td title="'+JSON_tooltip(assets[i])+'">'+assets[i].file+'</td>';
						 str +=  '<td title="'+JSON_tooltip(assets[i])+'"><span class="nomobile">'+assets[i].file.split('/').slice(0,-1).join('/')+'/</span>'+assets[i].file.split('/').pop()+'</td>';
						str +=  '<td>'+(assets[i].origin||'?')+'</td>';
						str +=  '</tr>';
					}
					str += '</table>';
					out.innerHTML = str;
				});
			});
		}

	});
	});
});
