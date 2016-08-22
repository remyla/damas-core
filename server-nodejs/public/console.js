require.config({
	packages: ['assetViewer'],
/*
	packages: [{
		name: 'assetViewer',
		location: 'scripts/assetViewer',
		main: 'ui_overlay'
	}],
*/
	paths: {
		'damas': "damas",
		'utils': "utils",
		'ui_log': "ui_log",
		'ui_upload': 'generic-ui/scripts/uiComponents/ui_upload',
		'ui_editor': 'generic-ui/scripts/uiComponents/ui_editor',
		'domReady': '//cdn.rawgit.com/requirejs/domReady/2.0.1/domReady'
	},
	urlArgs: "v=" +  (new Date()).getTime()
});
		//'domReady': '//raw.githubusercontent.com/requirejs/domReady/latest/domReady'


window.addEventListener("hashchange", function() {                                                                    
    process_hash();
});

process_hash = function() {
	//if(/#graph=/.test(location.hash))
	var keys = getHash();

	if (/#view=/.test(window.previousHash)) {
		window.previousHash = location.hash;
		return;
	}
	if (/#view=/.test(location.hash)) {
		window.previousHash = location.hash;
		return;
	}
	for (var elem of document.querySelectorAll('#menubar2 .selected')) {
		elem.classList.remove('selected');
	}
	if (keys.hasOwnProperty('users')) {
		document.querySelector('#but_users').classList.add('selected');
		show_users();
		window.previousHash = location.hash;
		return;
	}
	if (keys.hasOwnProperty('locks')) {
		document.querySelector('#but_locks').classList.add('selected');
		show_locks();
		window.previousHash = location.hash;
		return;
	}
	if (/#log/.test(location.hash) || location.hash === '' ) {
		document.querySelector('#but_log').classList.add('selected');
		show_log();
	}
	window.previousHash = location.hash;
};



define(['domReady', "damas", "utils", "assetViewer"], function (domReady, damas) {
	require(["ui_log"], function () {
	require(["ui_upload"]);
	require(["ui_editor"]);
	//require(["scripts/assetViewer/ui_overlay"]);
	//require(["assetViewer"]);
	window.damas = damas;
	loadCss('console.css');
	//loadCss('console_design.css');
	loadCss('console_mono.css');
	damas_connect('/api/', function (res) {
		if (!res) {
			window.location='/signIn?back=console'
		}
		if (res){
			if (damas.user)
			{
				document.querySelector('.username').innerHTML = damas.user.username;
				document.querySelector('#signOut').style.display = 'inline';
				document.querySelector('#signIn').style.display = 'none';
				document.querySelector('#authInfo').style.display = 'inline';
			}
			document.querySelector('#menubar2').style.display = 'block';
			//show_log();
			process_hash();
			window.previousHash = location.hash;
		}
		else
		{
			document.querySelector('#connection').style.display = 'block';
		}

/*
				var button = document.getElementById('but_locks');
				button.addEventListener('click', function(e){
					show_locks();
				});
				var button = document.getElementById('but_users');
				button.addEventListener('click', function(e){
					show_users();
				});
*/


				/* UI */
				var signOut = document.getElementById('signOut');
				signOut.addEventListener('click', function( e ){
					damas.signOut( function(e){
						localStorage.removeItem("token");
						localStorage.removeItem("user");
						document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
						//window.location='/signIn?back=console'
						document.location.reload();
					});
				});


/*
window.show_users = show_users;
window.show_locks = show_locks;
window.show_log = show_log;
*/

	});

	});
});



		/**
		 * Methods
		 */
		function show_users(){
			//damas.search('username:/.*/', function(res){
			damas.search_mongo({'username':'REGEX_.*'}, {"username":1},0,0, function(res){
				damas.read(res, function(users){
					window.users = users;
					var out = document.querySelector('#contents');
					var table = document.createElement('table');
					var thead = document.createElement('thead');
					var tbody = document.createElement('tbody');
					var th1 = document.createElement('th');
					var th2 = document.createElement('th');
					table.classList.add('users');
					th1.classList.add('username');
					th2.classList.add('userclass');
					th1.innerHTML = 'username &xutri;';
					th2.innerHTML = 'class';
					thead.appendChild(th1);
					thead.appendChild(th2);
					table.appendChild(thead);
					table.appendChild(tbody);
					out.innerHTML = '';
					out.appendChild(table);
					for (var i=0; i<users.length; i++) {
						var tr = document.createElement('tr');
						var td1 = document.createElement('td');
						var td2 = document.createElement('td');
						td1.classList.add('username');
						td2.classList.add('userclass');
						tr.setAttribute('title', JSON_tooltip(users[i]));
						td1.innerHTML= users[i].username;
						td2.innerHTML= users[i].class;
						tr.appendChild(td1);
						tr.appendChild(td2);
						tbody.appendChild(tr);
						(function (node){
							if (require.specified('ui_editor')) {
								tr.addEventListener('click', function(){
									initEditor(node);
								});
							}
						}(users[i]));
					}
				});
			});
		}

		function show_locks(){
			//damas.search('lock:/.*/', function(res){
			damas.search_mongo({'lock':'REGEX_.*'}, {"lock":1},0,0, function(res){
				damas.read(res, function(assets){
					var out = document.querySelector('#contents');
					var table = document.createElement('table');
					var thead = document.createElement('thead');
					var tbody = document.createElement('tbody');
					var th1 = document.createElement('th');
					var th2 = document.createElement('th');
					table.classList.add('locks');
					th1.classList.add('lock');
					th2.classList.add('file');
					th1.innerHTML = 'lock &xdtri;';
					th2.innerHTML = 'file';
					thead.appendChild(th1);
					thead.appendChild(th2);
					table.appendChild(thead);
					table.appendChild(tbody);
					out.innerHTML = '';
					out.appendChild(table);
					for (var i=0; i<assets.length; i++) {
						var file = assets[i].file || assets[i]['#parent'];
						var a = '<a href="#view=/api/file'+file+'"><span class="nomobile">'+file.split('/').slice(0,-1).join('/')+'/</span>'+file.split('/').pop()+'</a>';
						var tr = document.createElement('tr');
						var td1 = document.createElement('td');
						var td2 = document.createElement('td');
						td1.classList.add('lock');
						td2.classList.add('file');
						tr.setAttribute('title', JSON_tooltip(assets[i]));
						td1.innerHTML= assets[i].lock;
						td2.innerHTML= a;
						tr.appendChild(td1);
						tr.appendChild(td2);
						tbody.appendChild(tr);
						(function (node){
							if (require.specified('ui_editor')) {
								tr.addEventListener('click', function(){
									initEditor(node);
								});
							}
						}(assets[i]));
					}
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

