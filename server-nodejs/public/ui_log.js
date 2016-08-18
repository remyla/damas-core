
    require(['domReady'], function (domReady) {
        domReady(function () {
            //loadBtUpload(); 
        });
    });

		function show_log(){
			offsetElements = 0;
			compLog(document.querySelector('#contents'));
			tableBody = document.querySelector('#contents tbody');
		}

	/**
	* Generate Log Table
	* 
	*/
	var ui_log = {
	};
		nbElements = 100;
		offsetElements = 0;

	compLog = function(container){
		container.innerHTML = '';
		var tableBody = tableLog(container);
		damas.search_mongo({'time': {$exists:true}, '#parent':{$exists:true}}, {"time":-1},nbElements,offsetElements, function(res){
		//damas.search_mongo({'time': {$exists:true, $type: 1}}, {"time":-1},nbElements,offsetElements, function(res){
			damas.read(res, function(assets){ 
				tableLogContent(tableBody, assets);
					offsetElements += nbElements;
			});
		});
	};

	var scrollElem = document.getElementById('panelPrincipal');

	scrollElem.addEventListener('scroll', function(){
	//console.log(scrollElem.scrollY);
		//if (scrollElem.scrollHeight - scrollElem.scrollTop === scrollElem.clientHeight){
		//if (scrollElem.scrollY === scrollElem.scrollMaxY){
		if (this.scrollHeight - this.scrollTop === this.clientHeight) {
			damas.search_mongo({'time': {$exists:true}, '#parent':{$exists:true}}, {"time":-1},nbElements,offsetElements, function(res){
			//damas.search_mongo({'time': {$exists:true, $type: 1}}, {"time":-1},nbElements,offsetElements, function(res){
				damas.read(res, function(assets){
					tableLogContent(tableBody, assets);
					offsetElements += nbElements;
				});
			});
		}
	});

	function getChildrenLog( id, out ){
		damas.search_mongo({'#parent': id }, {"time":1},100, 0, function(res){
			//console.log(res);
			damas.read(res, function(children){
				var td_time = out.querySelector('td.time');
				var td_file = out.querySelector('td.file');
				var td_size = out.querySelector('td.file');
				for(var i=0; i< children.length; i++){
					var n =  children[i];

					var tr = tableLogTr(n);
					tr.classList.add('history');
					out.parentNode.insertBefore(tr, out.nextSibling);
/*

					var div = document.createElement('div');
					div.innerHTML = human_time(new Date(parseInt(n.time)));
					td_time.appendChild(div);

					var div = document.createElement('div');
					div.innerHTML = human_time(new Date(parseInt(n.time)))+" "+ n.author+" "+human_size(n.bytes || n.size || n.source_size);
					div.setAttribute('title', JSON_tooltip(n));
					td_file.appendChild(div);
*/
				}
				//console.log(str);
			});
		});
	}


function tableLog(container) {
	var table = document.createElement('table');
	var thead = document.createElement('thead');
	var th1 = document.createElement('th');
	var th2 = document.createElement('th');
	var th3 = document.createElement('th');
	var th4 = document.createElement('th');
	var tbody = document.createElement('tbody');

	table.className = 'log';

	th1.innerHTML = 'time &xutri;';
	th2.innerHTML = 'file';
	th3.innerHTML = 'size';
	th4.innerHTML = 'comment';

	th1.classList.add('time');
	th2.classList.add('file');
	th3.classList.add('size');
	th4.classList.add('comment');
	
	thead.appendChild(th1);
	thead.appendChild(th2);
	thead.appendChild(th3);
	thead.appendChild(th4);
	table.appendChild(thead);
	table.appendChild(tbody);

	container.appendChild(table);
	return tbody;
}

/**
* Generate Table Content
* 
*/
function tableLogContent(container, assets) {
	for (var i=0; i<assets.length; i++) {
		container.appendChild(tableLogTr(assets[i]));
	}
}

function tableLogTr(asset) {
	var tr = document.createElement('tr');
	var td1 = document.createElement('td');
	var td2 = document.createElement('td');
	var td3 = document.createElement('td');
	var td4 = document.createElement('td');
	var td5 = document.createElement('td');
	td1.classList.add('time');
	td2.classList.add('file');
	td3.classList.add('size');
	//td2.className = 'clickable';
	var time = new Date(parseInt(asset.time));
	var file = asset.file || asset['#parent'] || asset._id;
	td1.setAttribute('title', time);
	td1.style.width = '15ex';
	td1.innerHTML= human_time(new Date(parseInt(asset.time)))
	td2.setAttribute('title', JSON_tooltip(asset));
	if (file) {
		td2.innerHTML = '<a href="#view=/api/file'+file+'"><span class="nomobile">'+file.split('/').slice(0,-1).join('/')+'/</span>'+file.split('/').pop()+'</a>';
	} 
	//td3.style.whiteSpace = 'normal';
	td3.innerHTML = human_size( asset.bytes || asset.size || asset.source_size);
	td3.setAttribute('title', asset.bytes || asset.size || asset.source_size);
	td4.innerHTML = '&lt;'+asset.author+'&gt; '+asset.comment;
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	tr.appendChild(td4);
	tr.appendChild(td5);

	var td2d1 = document.createElement('div');
	td2d1.classList.add('children');
	td2.appendChild(td2d1);

	td1.addEventListener('click', function(e){
		if (asset['#parent']) {
			//getChildrenLog(asset['#parent'], e.target.parentNode.querySelector('.children'));
			getChildrenLog(asset['#parent'], e.target.parentNode);
		}
		else {
			//getChildrenLog(asset._id, e.target.parentNode.querySelector('.children'));
			getChildrenLog(asset._id, e.target.parentNode);
		}
	});


	var td5span1 = document.createElement('span');
	td5span1.innerHTML = 'x';
	td5.appendChild(td5span1);
	td5span1.addEventListener('click', function(e){
		if (confirm('Delete '+asset._id+' ?')) {
			damas.delete(asset._id);
		}
	});
	return tr;
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['socket.io/socket.io'], factory);
    } else if (typeof module === 'object' && module.exports) { // Node
        module.exports = factory(require('socket.io-client'));
    } else { // Browser globals
        root.returnExports = factory(root.io);
    }
}(this, function (io) {
    if (typeof window !== 'undefined') {
        var address = location.protocol + '//' + location.host;
        var socket = io.connect(address, { path: '/socket.io' });

        window.addEventListener('beforeunload', function (event) {
            socket.close();
        });
    } else {
        // Suppose a local Socket.io server over TLS
        var address = 'wss://0.0.0.0:8443';
        var socket = io.connect(address, {
            path: '/socket.io',
            rejectUnauthorized: false
        });
    }

    socket.on('connect', function () {
        console.log('Connected to the Socket server ' + address);
    });

    socket.on('disconnect', function (reason) {
        console.log('Disconnected: ' + reason);
    });

    socket.on('create', function (nodes) {
        console.log(nodes.length + ' nodes created');
        console.log(nodes);
        var tbody = document.querySelector('tbody');
        nodes.forEach(function(node){
            if (node.time === undefined || node['#parent'] !== undefined ) {
				return;
			}
            var tr = tableLogTr(node);
            tr.style.opacity = '0';
            tbody.insertBefore(tr, tbody.firstChild);
            setTimeout(function() {
                tr.style.opacity = '1';
            }, 1);
        });
    });

    socket.on('update', function (nodes) {
        console.log(nodes.length + ' nodes updated');
        console.log(nodes);
    });

    socket.on('remove', function (nodes) {
        console.log(nodes.length + ' nodes removed');
        console.log(nodes);
    });

    return socket;
}));
