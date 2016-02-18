/*global describe:false, it:false */

// Creates a local SVN repositiory using svnadmin to run tests against
'use strict';

var svn = require('../');

var fs = require('fs-extra');
var path = require('path');
var spawn = require('child_process').spawn;


exports.create = function( tempdir, callback ) {
	var dirname = 'temp_' + Math.floor( Math.random() * 999999 );
	if ( fs.existsSync( tempdir ) ) {
		fs.removeSync( tempdir );
	}
	fs.ensureDirSync( tempdir );
	var proc = spawn( 'svnadmin', [ 'create', dirname ], { cwd: tempdir } );
	proc.on( 'error', function( err ) {
		callback( err, '' );
	} );
	proc.on( 'exit', function() {
		var formattedPath = path.resolve( path.join( tempdir, dirname ) );
		formattedPath = formattedPath.replace( /\\/g, '/' );
		callback( null, 'file:///' + formattedPath );
	} );
};

