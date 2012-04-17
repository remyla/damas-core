#!/usr/bin/python

import damas

dam = damas.project( "https://lab.primcode.com/damas/server" );
if dam.signIn( "remyl", "demo" ):
	print "authentication success"
	#n = dam.createNode( 381, "PYTEST" )
	#print n.id
	#print dam.setKey( 1381, "key1", "value1" );
	#print dam.removeNode( 1373 )
	#print dam.getNode( 1381 );
	#print dam.searchKey( 'id', 'testpy')
	#print dam.cmd("getparam", {'id':450001, 'name':'out'} )
	print dam.lock( 1431, 'lockfrompython' )
	#print dam.getNodes( [ 1480, 123, 1485] );
	#print dam.getNodes( [ 1480, 1485] );
	#print dam.getNode(0)
	
	#print dam.backup( 1431 );
	
	#dam.getChildren( n )
	#print n

	
else:
	print "authentication failure"

