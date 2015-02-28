/*jslint node: true */
'use strict';

var exec = require( 'child_process' ).exec;
var fs = require( 'fs.extra' );
var xml2js = require( 'xml2js' );



var execute = function( cmd, options, callback ) {

	options = options || {};
	if ( options.shell === undefined && os.platform === "win32" ) {
		options.shell = 'start "" /B '  // windows only - this makes it so a cmd window won't pop up when running as a service or through pm2
	}
	options.cwd = options.cwd || process.cwd();
	var execOptions = {
		cwd: options.cwd,
		shell: options.shell
	};
	
	cmd += ' --non-interactive';
	if ( options.trustServerCert ) {
		cmd += ' --trust-server-cert';
	}
	if ( typeof options.username === 'string' ) {
		cmd += ' --username=' + options.username;
	}
	if ( typeof options.password === 'string' ) {
		cmd += ' --password=' + options.password;
	}
	if ( options.params ) {
		cmd += options.params.join( " " );
	}
	exec( cmd, execOptions, function( err, stdo, stde ) {
		if ( !options.quiet ) {
			stde.pipe( process.stderr );
		}
		if ( typeof callback === 'function' ) {
			callback( err, stdo.toString() );
		}
	} );
};


var executeSvn = function( params, options, callback ) {
	options = options || {};
	var cmd = ( options.svn || 'svn' ) + ' ' + ( Array.isArray( options.params ) ? params.concat( options.params ).join( " " ) : params.join( " " ) );
	execute( cmd, options, callback );
};


var executeSvnmucc = function( params, options, callback ) {
	options = options || {};
	execute( ( options.svnmucc || 'svnmucc' ) + ' ' + params.join( " " ), options, callback );
};


var addExtraOptions = function( validOptionsArray, options ) {
	if ( options ) {
		options.params = options.params || [];
		validOptionsArray.forEach( function( validOption ) {
			switch ( validOption ) {
				case 'force':
					if ( options.force ) {
						options.params.push('--force');
					}
					break;
				case 'quiet':
					if ( options.quiet ) {
						options.params.push('--quiet');
					}
					break;
				case 'revision':
					if ( options.revision ) {
						options.params.push('--revision',options.revision.toString());
					}
					break;
				case 'depth':
					if ( options.depth ) {
						options.params.push('--depth',options.depth.toString());
					}
					break;
				case 'ignoreExternals':
					if ( options.depth ) {
						options.params.push('--ignore-externals');
					}
					break;
			}
		} );
	}
};

var xmlToJson = function( dataXml, callback ) {
	xml2js.parseString(dataXml, 
		{
			explicitRoot: false, 
			explicitArray: false
		},
		callback
	);
};




var checkout = function( url, dir, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'force', 'quiet', 'revision', 'depth', 'ignoreExternals' ], options );
	fs.mkdirsSync( dir );
	executeSvn( [ 'checkout', url, dir ], options, callback );
};
exports.checkout = checkout;
exports.co = checkout;

var update = function( dir, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'force', 'quiet', 'revision', 'depth', 'ignoreExternals' ], options );
	executeSvn( [ 'update', dir ], options, callback );
};
exports.update = update;

var add = function( files, options, callback ) {
	if ( !Array.isArray( files ) ) {
		files = [files];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'force', 'quiet', 'depth' ], options );
	executeSvn( [ 'add' ].concat( files ), options, callback );
};
exports.add = add;

// TODO: blame

var cat = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'revision' ], options );
	executeSvn( [ 'cat' ].concat( targets ), options, callback );
};
exports.cat = cat;

// TODO: changelist (cl)

var cleanup = function( wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
	}
	executeSvn( [ 'cleanup', wc ], options, callback );
};
exports.cleanup = cleanup;

var commit = function( files, options, callback ) {
	if ( !Array.isArray( files ) ) {
		files = [files];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'quiet', 'depth' ], options );
	executeSvn( [ 'commit' ].concat( files ), options, callback );
};
exports.commit = commit;
exports.ci = commit;

var copy = function( srcs, dst, options, callback ) {
	if ( !Array.isArray( srcs ) ) {
		srcs = [srcs];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'revision', 'quiet', 'depth' ], options );
	executeSvn( [ 'copy' ].concat( srcs ).push( dst ), options, callback );
};
exports.copy = copy;
exports.cp = copy;

var del = function( srcs, options, callback ) {
	if ( !Array.isArray( srcs ) ) {
		srcs = [srcs];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'quiet', 'force' ], options );
	executeSvn( [ 'del' ].concat( srcs ), options, callback );
};
exports.del = del;
exports.remove = del;
exports.rm = del;

// TODO: diff

// export method
var exp = function( src, dst, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
	}
	fs.mkdirsSync( dst );
	addExtraOptions( [ 'revision', 'quiet', 'force' ], options );
	executeSvn( [ 'export', src, dst ], options, callback );
};
exports.exp = exp;

// import method
var imp = function( src, dst, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'depth', 'quiet', 'force' ], options );
	executeSvn( [ 'import', src, dst ], options, callback );
};
exports.imp = imp;

var info = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'depth', 'revision' ], options );
	executeSvn( [ 'info' ].concat( targets ).push( '--xml' ), options, function( err, data ) {
		var json;
		if ( !err ) {
			json = xmlToJson( data ).entry;
		}
		callback( err, json );
	} );
};
exports.info = info;

var list = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'depth', 'revision' ], options );
	executeSvn( [ 'list' ].concat( targets ).push( '--xml' ), options, function( err, data ) {
		var json;
		if ( !err ) {
			json = xmlToJson( data ).entry;
		}
		callback( err, json );
	} );
};
exports.list = list;
exports.ls = list;

var lock = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'force' ], options );
	executeSvn( [ 'lock' ].concat( targets ), options, callback );
};
exports.lock = lock;

// TODO: log
// TODO: merge
// TODO: mergeinfo

var mkdir = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'quiet' ], options );
	executeSvn( [ 'mkdir' ].concat( targets ), options, callback );
};
exports.mkdir = mkdir;

var move = function( srcs, dst, options, callback ) {
	if ( !Array.isArray( srcs ) ) {
		srcs = [srcs];
	}
	if ( typeof options === 'function' ) {
		callback = options;
	}
	addExtraOptions( [ 'quiet', 'force' ], options );
	executeSvn( [ 'move' ].concat( srcs ).push( dst ), options, callback );
};
exports.move = move;
exports.mv = move;
exports.rename = move;
exports.ren = move;

var patch = function( patchFile, wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
	}
	executeSvn( [ 'patch', patchFile, wc ], options, callback );
};
exports.patch = patch;

// propdel (pdel, pd)
// propedit (pedit, pe)
// propget (pget, pg)
// proplist (plist, pl)
// propset (pset, ps)
// relocate
// resolve
// resolved
// revert
// status (stat, st)
// switch (sw)
// unlock
// update (up)
// upgrade

