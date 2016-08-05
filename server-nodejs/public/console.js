require.config({
	paths: {
		'damas': "damas",
		'utils': "utils",
//		'ui_log': "ui_log",
        'ui_log': "generic-ui/scripts/uiComponents/ui_log",
		'ui_upload': 'generic-ui/scripts/uiComponents/ui_upload',
//		'ui_search': 'generic-ui/scripts/uiComponents/ui_search',
//		'ui_editor': 'generic-ui/scripts/uiComponents/ui_editor',
		'ui_overlay': 'generic-ui/scripts/uiComponents/ui_overlay',
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
	for (var elem of document.querySelectorAll('#menubar2 .selected')) {
		elem.classList.remove('selected');
	}
	if (keys.hasOwnProperty('users')) {
		document.querySelector('#but_users').classList.add('selected');
		show_users();
		return;
	}
	if (keys.hasOwnProperty('locks')) {
		document.querySelector('#but_locks').classList.add('selected');
		show_locks();
		return;
	}
	document.querySelector('#but_log').classList.add('selected');
//	show_log();
};



require(['domReady', "damas", "utils"], function (domReady, damas) {
//	require(["ui_log","ui_upload", "ui_search", "ui_editor", "ui_overlay"], function () {
    require(["ui_log","ui_upload", "ui_overlay"], function () {
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
				document.querySelector('#signIn').style.display = 'none';
				document.querySelector('#authInfo').style.display = 'inline';
			}
			document.querySelector('#menubar2').style.display = 'block';
			//show_log();
			process_hash();
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
					//console.log(users);
					window.users = users;
					var out = document.querySelector('#contents');
					var str = '<table class="users"><tr><th>username &xdtri;</th><th class="userclass">class</th></tr>';
					for (var i=0; i<users.length; i++) {
						//out.innerHTML +=  '<li title="'+JSON_tooltip(users[i])+'">'+users[i].username+'</li>';
						str +=  '<tr title="'+JSON_tooltip(users[i])+'"><td>'+users[i].username+'</td><td class="userclass">'+users[i].class+'</td></tr>';
					}
					str += '</table>';
					out.innerHTML = str;
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

function previousHash(){
    var currentHash = window.location.hash;
    var splitHash = currentHash.split('&');
    splitHash.pop();
    window.location.hash = splitHash.join('&');
}

function viewHashNode(){
    var currentHash = window.location.hash;
    var nHash = currentHash.substr(1);
    var splitHash = nHash.split('&');
    for (var i=0; i<splitHash.length; i++){
        if (/(view|edit)=/.test(splitHash[i])){
            var filepath = splitHash[i].replace(/.*=/,'');
            return filepath;
        }
    }
}

function addHash(hash){
    var currentHash = window.location.hash;
    var splitHash = currentHash.split('&');
    var arr = [];
    for (var i=0; i<splitHash.length; i++){
        if (splitHash[i] !== ''){
            arr.push(splitHash[i]);
        }
    }
    arr.push(hash);
    window.location.hash = arr.join('&');
}

