/*jslint node: true */
'use strict';

var exec = require( 'child_process' ).exec;
var fs = require( 'fs-extra' );
var os = require( 'os' );
var xml2js = require( 'xml2js' );
var semver = require( 'semver' );



var xmlToJson = function( dataXml, callback ) {
	xml2js.parseString(dataXml, 
		{
			explicitRoot: false, 
			explicitArray: false
		},
		function( err, json ) { callback( err, json ); }
	);
};

var execute = function( cmd, options, callback ) {

	options = options || {};
	if ( options.shell === undefined && os.platform === "win32" ) {
		options.shell = 'start "" /B ';  // windows only - this makes it so a cmd window won't pop up when running as a service or through pm2
	}
	options.cwd = options.cwd || process.cwd();
	var execOptions = {
		cwd: options.cwd,
		shell: options.shell,
		maxBuffer: options.maxBuffer || ( 5 * 1024 * 1024 ) // defaults to 5MB
	};
	
	if ( !options.noStandardOptions ) {
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
	}
	if ( options.params ) {
		cmd += ' ' + options.params.join( " " );
	}
	exec( cmd, execOptions, function( err, stdo, stde ) {
		if ( !options.quiet ) {
			process.stderr.write( stde.toString() );
		}
		if ( typeof callback === 'function' ) {
			callback( err, options.stdoutAsBuffer ? stdo : stdo.toString() );
		}
	} );
};


var executeSvn = function( params, options, callback ) {
	options = options || {};
	var cmd = ( options.svn || 'svn' ) + ' ' + ( Array.isArray( options.params ) ? params.concat( options.params ).join( " " ) : params.join( " " ) );
	execute( cmd, options, callback );
};


var executeSvnXml = function( params, options, callback ) {
	executeSvn( params.concat( [ '--xml' ] ), options, function( err, data ) {
		if ( !err ) {
			xmlToJson( data, function( err2, json ) {
				callback( err2, json );
			} );
		} else {
			callback( err, null );
		}
	} );
};


var executeMucc = function( params, options, callback ) {
	options = options || {};
	var cmd = ( options.svnmucc || 'svnmucc' ) + ' ' + ( Array.isArray( options.params ) ? params.concat( options.params ).join( " " ) : params.join( " " ) );
	execute( cmd, options, callback );
};


var execSvnVersion = function( params, options, callback ) {
	options = options || {};
	var cmd = ( options.svnversion || 'svnversion' ) + ' ' + ( Array.isArray( options.params ) ? params.concat( options.params ).join( " " ) : params.join( " " ) );
	options.noStandardOptions = true;
	execute( cmd, options, callback );
};


var checkSvnVersion = function( options, reqVersion, callback ) {
	options = options || {};
	options.noStandardOptions = true;
	var cmd = ( options.svn || 'svn' ) + ' --version --quiet';
	execute( cmd, options, function( err, stdo ) {
		if ( err ) {
			return callback( err );
		}
		stdo = stdo.trim();
		callback( null, semver.satisfies( stdo, reqVersion ) );
	} );
};


var addExtraOptions = function( validOptionsArray, options, addRevProp ) {
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
						if ( addRevProp ) {
							options.params.push( '--revprop' );
						}
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
				case 'msg':
					if ( options.msg ) {
						options.params.push('-m', '"' + options.msg + '"');
					}
					break;
			}
		} );
	}
	return options;
};


exports.commands = {};


/** 
 * @param url {string}
 * @param dir {string}
 * @param options {object=}
 * @param callback {function=}
 */
var checkout = function( url, dir, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'force', 'quiet', 'revision', 'depth', 'ignoreExternals' ], options );
	if ( !fs.existsSync( dir ) ) {
		fs.mkdirsSync( dir );
	}
	executeSvn( [ 'checkout', url, dir ], options, callback );
};
exports.commands.checkout = checkout;
exports.commands.co = checkout;

/** 
 * @param dir {string}
 * @param options {object=}
 * @param callback {function=}
 */
var update = function( dir, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'force', 'quiet', 'revision', 'depth', 'ignoreExternals' ], options );
	executeSvn( [ 'update', dir ], options, callback );
};
exports.commands.update = update;

/** 
 * @param files {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var add = function( files, options, callback ) {
	if ( !Array.isArray( files ) ) {
		files = [files];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'force', 'quiet', 'depth' ], options );
	executeSvn( [ 'add' ].concat( files ), options, callback );
};
exports.commands.add = add;

// TODO: blame

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var cat = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'revision' ], options );
	executeSvn( [ 'cat' ].concat( targets ), options, callback );
};
exports.commands.cat = cat;

// TODO: changelist (cl)

/** 
 * @param wc {string}
 * @param options {object=}
 * @param callback {function=}
 */
var cleanup = function( wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	executeSvn( [ 'cleanup', wc ], options, callback );
};
exports.commands.cleanup = cleanup;

/** 
 * @param files {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var commit = function( files, options, callback ) {
	if ( !Array.isArray( files ) ) {
		files = [files];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	} else if ( typeof options === 'string' ) {
		options = { msg: options };
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth', 'msg' ], options );
	executeSvn( [ 'commit' ].concat( files ), options, callback );
};
exports.commands.commit = commit;
exports.commands.ci = commit;

/** 
 * @param srcs {Array|string}
 * @param dst {string}
 * @param options {object=}
 * @param callback {function=}
 */
var copy = function( srcs, dst, options, callback ) {
	if ( !Array.isArray( srcs ) ) {
		srcs = [srcs];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	} else if ( typeof options === 'string' ) {
		options = { msg: options };
	}
	options = options || {};
	addExtraOptions( [ 'revision', 'quiet', 'depth', 'msg' ], options );
	executeSvn( [ 'copy' ].concat( srcs ).concat( [ dst ] ), options, callback );
};
exports.commands.copy = copy;
exports.commands.cp = copy;

/** 
 * @param srcs {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var del = function( srcs, options, callback ) {
	if ( !Array.isArray( srcs ) ) {
		srcs = [srcs];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	} else if ( typeof options === 'string' ) {
		options = { msg: options };
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'force', 'msg' ], options );
	executeSvn( [ 'del' ].concat( srcs ), options, callback );
};
exports.commands.del = del;
exports.commands.remove = del;
exports.commands.rm = del;

// var diff = function( src, dest, options, callback ) {
	// if ( typeof options === 'function' ) {
		// callback = options;
		// options = null;
	// }
	// options = options || {};
	// addExtraOptions( [ 'revision', 'depth', 'force' ], options );
	// executeSvn( [ 'export', src, dst ], options, callback );
// };
// exports.commands.diff = diff;


/** 
 * @param src {string}
 * @param dst {string}
 * @param options {object=}
 * @param callback {function=}
 */
var exp = function( src, dst, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'revision', 'quiet', 'force' ], options );
	executeSvn( [ 'export', src, dst ], options, callback );
};
exports.commands.export = exp;
exports.commands.exp = exp;

/** 
 * @param src {string}
 * @param dst {string}
 * @param options {object=}
 * @param callback {function=}
 */
var imp = function( src, dst, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	} else if ( typeof options === 'string' ) {
		options = { msg: options };
	}
	options = options || {};
	addExtraOptions( [ 'depth', 'quiet', 'force', 'msg' ], options );
	executeSvn( [ 'import', src, dst ], options, callback );
};
exports.commands.import = imp;
exports.commands.imp = imp;

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var info = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'depth', 'revision' ], options );
	executeSvnXml( [ 'info' ].concat( targets ), options, callback );
};
exports.commands.info = info;

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var list = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'depth', 'revision' ], options );
	executeSvnXml( [ 'list' ].concat( targets ), options, callback );
};
exports.commands.list = list;
exports.commands.ls = list;

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var lock = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	} else if ( typeof options === 'string' ) {
		options = { msg: options };
	}
	options = options || {};
	addExtraOptions( [ 'force', 'msg' ], options );
	executeSvn( [ 'lock' ].concat( targets ), options, callback );
};
exports.commands.lock = lock;

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var log = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth', 'revision' ], options );
	executeSvnXml( [ 'log' ].concat( targets ), options, callback );
};
exports.commands.log = log;

// TODO: merge
// TODO: mergeinfo

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var mkdir = function( targets, options, callback ) {
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	} else if ( typeof options === 'string' ) {
		options = { msg: options };
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'msg' ], options );
	executeSvn( [ 'mkdir' ].concat( targets ), options, callback );
};
exports.commands.mkdir = mkdir;

/** 
 * @param srcs {Array|string}
 * @param dst {string}
 * @param options {object=}
 * @param callback {function=}
 */
var move = function( srcs, dst, options, callback ) {
	if ( !Array.isArray( srcs ) ) {
		srcs = [srcs];
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	} else if ( typeof options === 'string' ) {
		options = { msg: options };
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'force', 'msg' ], options );
	executeSvn( [ 'move' ].concat( srcs ).concat( [ dst ] ), options, callback );
};
exports.commands.move = move;
exports.commands.mv = move;
exports.commands.rename = move;
exports.commands.ren = move;

// var patch = function( patchFile, wc, options, callback ) {
	// if ( typeof options === 'function' ) {
		// callback = options;
		// options = null;
	// }
	// options = options || {};
	// executeSvn( [ 'patch', patchFile, wc ], options, callback );
// };
// exports.commands.patch = patch;

/** 
 * @param propName {string}
 * @param target {string}
 * @param options {object=}
 * @param callback {function=}
 */
var propdel = function( propName, target, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth' ], options, true );
	executeSvn( [ 'propdel', propName, target ], options, callback );
};
exports.commands.propdel = propdel;
exports.commands.pdel = propdel;
exports.commands.pd = propdel;

// propedit (pedit, pe) - not supported

/** 
 * @param propName {string}
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var propget = function( propName, targets, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	options = options || {};
	addExtraOptions( [ 'depth', 'revision' ], options, true );
	executeSvnXml( [ 'propget', propName ].concat( targets ), options, callback );
};
exports.commands.propget = propget;
exports.commands.pget = propget;
exports.commands.pg = propget;

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var proplist = function( targets, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth', 'revision' ], options, true );
	executeSvnXml( [ 'proplist' ].concat( targets ), options, callback );
};
exports.commands.proplist = proplist;
exports.commands.plist = proplist;
exports.commands.pl = proplist;

/** 
 * @param propName {string}
 * @param propVal {string}
 * @param wc {string}
 * @param options {object=}
 * @param callback {function=}
 */
var propset = function( propName, propVal, wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth', 'revision', 'force' ], options, true );
	executeSvn( [ 'propset', propName, propVal, wc ], options, callback );
};
exports.commands.propset = propset;
exports.commands.pset = propset;
exports.commands.ps = propset;

/** 
 * @param url {string}
 * @param wc {string}
 * @param options {object=}
 * @param callback {function=}
 */
var relocate = function( url, wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	executeSvn( [ 'relocate', url, wc ], options, callback );
};
exports.commands.relocate = relocate;

// resolve/resolved - probably doesn't make sense to automate

/** 
 * @param wc {string}
 * @param options {object=}
 * @param callback {function=}
 */
var revert = function( wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth' ], options );
	executeSvn( [ 'revert', wc ], options, callback );
};
exports.commands.revert = revert;

/** 
 * @param wc {string}
 * @param options {object=}
 * @param callback {function=}
 */
var status = function( wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth' ], options );
	executeSvnXml( [ 'status', wc ], options, callback );
};
exports.commands.status = status;
exports.commands.stat = status;
exports.commands.st = status;

/** 
 * @param url {string}
 * @param wc {string}
 * @param options {object=}
 * @param callback {function=}
 */
var switchf = function( url, wc, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	addExtraOptions( [ 'quiet', 'depth', 'revision', 'force' ], options );
	executeSvn( [ 'switch', url, wc ], options, callback );
};
exports.commands.switch = switchf;

/** 
 * @param targets {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var unlock = function( targets, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	if ( !Array.isArray( targets ) ) {
		targets = [targets];
	}
	options = options || {};
	addExtraOptions( [ 'force' ], options );
	executeSvn( [ 'unlock' ].concat( targets ), options, callback );
};
exports.commands.unlock = unlock;

/** 
 * @param wcs {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var update = function( wcs, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	if ( !Array.isArray( wcs ) ) {
		wcs = [wcs];
	}
	options = options || {};
	addExtraOptions( [ 'force', 'revision', 'depth' ], options );
	executeSvn( [ 'update' ].concat( wcs ), options, callback );
};
exports.commands.update = update;
exports.commands.up = update;

/** 
 * @param wcs {Array|string}
 * @param options {object=}
 * @param callback {function=}
 */
var upgrade = function( wcs, options, callback ) {
	// upgrade only works for versions of svn >= 1.7
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	if ( !Array.isArray( wcs ) ) {
		wcs = [wcs];
	}
	options = options || {};
	addExtraOptions( [ 'quiet' ], options );

	checkSvnVersion( options, ">=1.7.0", function( err, isValid ) {
		if ( err ) {
			return callback( err );
		}
		if ( isValid ) {
			executeSvn( [ 'upgrade' ].concat( wcs ), options, callback );
		} else {
			callback();
		}
	} );
};
exports.commands.upgrade = upgrade;


// svnmucc
/*
	commandArray can contain array of the following
  cp REV SRC-URL DST-URL : copy SRC-URL@REV to DST-URL
  mkdir URL              : create new directory URL
  mv SRC-URL DST-URL     : move SRC-URL to DST-URL
  rm URL                 : delete URL
  put SRC-FILE URL       : add or modify file URL with contents copied from
                           SRC-FILE (use "-" to read from standard input)
  propset NAME VALUE URL : set property NAME on URL to VALUE
  propsetf NAME FILE URL : set property NAME on URL to value read from FILE
  propdel NAME URL       : delete property NAME from URL
*/

/** 
 * @param commandArray {Array}
 * @param commitMessage {string}
 * @param options {object=}
 * @param callback {function=}
 */
var mucc = function( commandArray, commitMessage, options, callback ) {
	if ( typeof commitMessage !== 'string' ) {
		throw new Error( "svnUltimate.command.mucc - commitMessage must be a string" );
	}
	if ( typeof options === 'function' ) {
		callback = options;
		options = null;
	}
	options = options || {};
	if ( !Array.isArray( commandArray ) ) {
		commandArray = [commandArray];
	}
	executeMucc( [ '-m "' + commitMessage + '"' ].concat( commandArray ), options, callback );
};
exports.commands.mucc = mucc;


// Utilities

exports.util = {};
// 'lastChangeRevision' option returns the last commit revision, instead of the working copy revision

/** 
 * @param target {string}
 * @param options {object=}
 * @param callback {function=}
 */
var getRevision = function( target, options, callback ) {
	if ( typeof options === "function" ) {
		callback = options;
		options = null;
	}
	options = options || {};
	info( target, options, function( err, data ) {
		var rev;
		if ( !err ) {
			var revString;
			if ( options.lastChangeRevision ) {
				if ( data && data.entry && data.entry.commit && data.entry.commit.$ && data.entry.commit.$.revision ) {
					revString = data.entry.commit.$.revision;
				}
			} else {
				if ( data && data.entry && data.entry.$ && data.entry.$.revision ) {
					revString = data.entry.$.revision;
				}
			}
			if ( revString !== undefined ) {
				try {
					rev = parseInt( revString, 10 );
				}
				catch ( err3 ) {
					err = 'Invalid revision value [' + revString + ']';
				}
			} else {
				err = 'Could not parse info result to get revision [' + JSON.stringify( data ) + ']';
			}
		}
		callback( err, rev );
	} );
};
exports.util.getRevision = getRevision;


/** 
 * @param wcDir {string}
 * @param options {object=}
 * @param callback {function=}
 */
var getWorkingCopyRevision = function( wcDir, options, callback ) {
	if ( typeof options === "function" ) {
		callback = options;
		options = null;
	}
	options = options || {};
	if ( !Array.isArray( wcDir ) ) {
		wcDir = [wcDir];
	}
	var args = [ '-n' ];
	if ( options.lastChangeRevision ) {
		args.push( '-c' );
	}
	execSvnVersion( wcDir.concat( args ), options, function( err, data ) {
		var result;
		if ( !err ) {
			var match = data.match( /(\d+):?(\d*)(\w*)/ );
			if ( match ) {
				result = {};
				result.low = parseInt( match[1] );
				if ( match[2].length > 0 ) {
					result.high = parseInt( match[2] );
				} else {
					result.high = result.low;
				}
				result.flags = match[3];
				if ( result.flags > 0 ) {
					result.modified = result.flags.indexOf( 'M' ) >= 0;
					result.partial = result.flags.indexOf( 'P' ) >= 0;
					result.switched = result.flags.indexOf( 'S' ) >= 0;
				}
			} else {
				err = data;
			}
		}
		callback( err, result );
	} );
};
exports.util.getWorkingCopyRevision = getWorkingCopyRevision;


/** 
 * @param url {string}
 * @returns {string}
 */
var parseUrl = function( url ) {
	var trunkMatch = url.match( /(.*)\/(trunk|branches|tags)\/*(.*)\/*(.*)$/i );
	if ( trunkMatch ) {
		var rootUrl = trunkMatch[1];
		var projectName = rootUrl.match( /\/([^\/]+)$/ )[1];
		return {
			rootUrl: rootUrl,
			projectName: projectName,
			type: trunkMatch[2],
			typeName: trunkMatch[3],
			trunkUrl: trunkMatch[1] + "/trunk",
			tagsUrl: trunkMatch[1] + "/tags",
			branchesUrl: trunkMatch[1] + "/branches"
		};
	}
	throw new Error( "parseUrl: Url does not look like an SVN repository" );
};
exports.util.parseUrl = parseUrl;

/** 
 * @param url {string}
 * @param options {object=}
 * @param callback {function=}
 */
var getTags = function( url, options, callback ) {
	if ( typeof options === "function" ) {
		callback = options;
		options = null;
	}
	options = options || {};
	var tagsUrl = parseUrl( url ).tagsUrl;
	list( tagsUrl, options, function( err, data ) {
		var result = [];
		if ( !err && data && data.list && Array.isArray( data.list.entry ) ) {
			result = data.list.entry.filter( function( entry ) {
					return entry && entry.$ && entry.$.kind === "dir";
				} );
		}
		callback( err, result );
	} );
};
exports.util.getTags = getTags;


/** 
 * @param url {string}
 * @param options {object=}
 * @param callback {function=}
 */
var getLatestTag = function( url, options, callback ) {
	if ( typeof options === "function" ) {
		callback = options;
		options = null;
	}
	options = options || {};
	getTags( url, options, function( err, tagArray ) {
		var latest;
		if ( !err && Array.isArray( tagArray ) && tagArray.length > 0 ) {
			tagArray.sort( function( a, b ) {
				try {
					return semver.rcompare( a.name, b.name );
				}
				catch ( err2 ) {
					return -1;
				}
			} );
			latest = tagArray[0];
		}
		callback( err, latest );
	} );
};
exports.util.getLatestTag = getLatestTag;

