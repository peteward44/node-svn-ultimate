/*global describe:false, it:false, before:false, after:false */
/*jslint node: true */
'use strict';

var svn = require('../');

var path = require('path');
var should = require('should');
var fs = require('fs-extra');
var createRepo = require('./createLocalSvnRepo.js' );

var testServer = '';
var nonExistantUrl = "https://fud.com/svn/work";
var tempTestDir = "temp";
var repoTestDir = path.join( tempTestDir, 'repo' );
var checkoutTestDir = path.join( tempTestDir, "out_works" );


describe('node-svn-ultimate', function() {

	this.timeout( 60 * 1000 );

	before( function( done ) {
		createRepo.create( repoTestDir, function( err, url ) {
			testServer = url;
			done( err );
		} );
	} );
	
	after( function() {
		fs.removeSync( tempTestDir );
	} );
	
	
	describe('commands', function() {
		it('checkout', function(done) {
			svn.commands.checkout( testServer, checkoutTestDir, function( err ) {
				should.not.exist(err);
				done();
			} );
		});
		it('checkout invalid url', function(done) {
			var p = path.join( tempTestDir, "out_invalid" );
			svn.commands.checkout( nonExistantUrl, p, { quiet: true }, function( err ) {
				should.exist(err);
				done();
			} );
		});

		it('add', function(done) {
			var fp = path.join( checkoutTestDir, "test2.txt" );
			fs.writeFileSync( fp, "aa" );
			svn.commands.add( fp, function( err ) {
				should.not.exist(err);
				done();
			} );
		});

		it('commit', function(done) {
			svn.commands.commit( checkoutTestDir, { msg: 'test commit' }, function( err ) {
				should.not.exist(err);
				done();
			} );
		});
		
		it('status', function(done) {
			svn.commands.status( checkoutTestDir, function( err, data ) {
				should.not.exist(err);
				should.exist(data);
				done();
			} );
		});
		
		// it('patch', function(done) {
			// var p = path.join( tempTestDir, "test_patch.patch" );
			// svn.commands.patch( p,  function( err ) {
				// should.not.exist(err);
				// should.ok( fs.readFileSync( p ).toString() === 'aa' );
				// done();
			// } );
		// });
		
		it('revert', function(done) {
			var p = path.join( checkoutTestDir, "test2.txt" );
			fs.writeFileSync( p, 'bbbbbb' );
			svn.commands.revert( p, function( err ) {
				should.not.exist(err);
				should.ok( fs.readFileSync( p ).toString() === 'aa' );
				done();
			} );
		});
		
		it('cat', function(done) {
			svn.commands.cat( testServer + "/test2.txt", function( err, data ) {
				should.not.exist(err);
				should.ok( data.length > 0 );
				should.ok( data === "aa" );
				done();
			} );
		});
		
		it('cat fails on non-existant file', function(done) {
			svn.commands.cat( testServer + "/bower2.json", { quiet: true }, function( err, data ) {
				should.exist(err);
				done();
			} );
		});
		
		it('copy', function(done) {
			svn.commands.copy( testServer + "/test2.txt", testServer + "/test3.txt", "copy commit", function( err ) {
				should.not.exist(err);
				// make sure copied file exists
				svn.commands.cat( testServer + "/test2.txt", function( err2, data ) {
					should.not.exist(err2);
					should.ok( data.length > 0 );
					should.ok( data === "aa" );
					done();
				} );
			} );
		});
		
		it('cleanup', function(done) {
			svn.commands.cleanup( checkoutTestDir, function( err, data ) {
				should.not.exist(err);
				done();
			} );
		});
		
		it('log', function(done) {
			svn.commands.log( testServer, function( err, data ) {
				should.not.exist(err);
				should.exist(data);
				done();
			} );
		});

		it('info', function(done) {
			svn.commands.info( testServer, function( err, data ) {
				should.not.exist(err);
				should.exist(data);
				done();
			} );
		});

    it('merge', function(done) {
      svn.commands.info( testServer, function( err, data ) {
        var oldRev = data.entry.$.revision;
        var fp = path.join( checkoutTestDir, "test2.txt" );
        var oldContent = fs.readFileSync(fp);
        fs.writeFileSync( fp, "aabb" );
				svn.commands.commit( checkoutTestDir, { msg: 'test commit' }, function( err ) {
					svn.commands.info( testServer, function( err, data ) {
						var newRev = data.entry.$.revision;
						var mergeOption = newRev + ':' + oldRev
						svn.commands.merge( fp, { revision: mergeOption }, function( err ) {
							should.not.exist(err);
							svn.commands.commit( checkoutTestDir, { msg: 'test commit 2' }, function( err ) {
                var newContent = fs.readFileSync(fp);
                should.ok( newContent.toString('utf8') === oldContent.toString('utf8') );
                done();
							} );
						} );
					} );
				} );
      } );
    });

		it('list', function(done) {
			svn.commands.list( testServer, function( err, data ) {
				should.not.exist(err);
				should.exist(data);
				done();
			} );
		});
				
		it('move', function(done) {
			svn.commands.move( testServer + "/test3.txt", testServer + "/test4.txt", "move commit", function( err ) {
				should.not.exist(err);
				// make sure moved file exists
				svn.commands.cat( testServer + "/test4.txt", function( err2, data ) {
					should.not.exist(err2);
					should.ok( data.length > 0 );
					should.ok( data === "aa" );
					// make sure old file no longer exists
					svn.commands.cat( testServer + "/test3.txt", function( err3, data ) {
						should.exist(err3);
						done();
					} );
				} );
			} );
		});
		
		it('del', function(done) {
			svn.commands.del( testServer + "/test4.txt", "del commit", function( err ) {
				should.not.exist(err);
				// make sure file deleted
				svn.commands.cat( testServer + "/test4.txt", function( err2, data ) {
					should.exist(err2);
					done();
				} );
			} );
		});

		it('export - single file', function(done) {
			var exportPath = path.join( tempTestDir, 'test2.txt' );
			svn.commands.export( testServer + "/test2.txt", exportPath, function( err ) {
				should.not.exist(err);
				should.ok( fs.existsSync( exportPath ) );
				should.ok( fs.readFileSync( exportPath ).toString() === "aa" );
				done();
			} );
		});
		
		it('import - single file', function(done) {
			var importPath = path.join( tempTestDir, 'test2.txt' );
			svn.commands.import( importPath, testServer + "/test20.txt", 'import msg', function( err ) {
				should.not.exist(err);
				svn.commands.cat( testServer + "/test20.txt", function( err2, data ) {
					should.not.exist(err2);
					should.ok( data.length > 0 );
					should.ok( data === "aa" );
					done();
				} );
			} );
		});
		
		it('mucc - single mkdir command', function(done) {
			svn.commands.mucc( [ "mkdir " + testServer + "/testdir" ], "mucc commit", function( err, data ) {
				should.not.exist(err);
				//console.log( data );
				done();
			} );
		});
		
		it('update working copy', function(done) {
			svn.commands.update( checkoutTestDir, function( err ) {
				should.not.exist(err);
				should.ok( fs.statSync( path.join( checkoutTestDir, "test20.txt" ) ).isFile() );
				should.ok( fs.statSync( path.join( checkoutTestDir, "testdir" ) ).isDirectory() );
				done();
			} );
		});

		it('lock: local file in working copy', function(done) {
			var p = path.join( checkoutTestDir, "test20.txt" );
			svn.commands.lock( p, function( err, data ) {
				should.not.exist(err);
				// trying to delete the file should fail
				svn.commands.del( testServer + "/test20.txt", "del commit", function( err2 ) {
					should.exist(err2);
					done();
				} );
			} );
		});

		it('unlock: local file in working copy', function(done) {
			var p = path.join( checkoutTestDir, "test20.txt" );
			svn.commands.unlock( p, function( err, data ) {
				should.not.exist(err);
				// trying to delete the file should succeed
				svn.commands.del( testServer + "/test20.txt", "del commit", function( err2 ) {
					should.not.exist(err2);
					done();
				} );
			} );
		});
		
		it('lock: remote file in repo', function(done) {
			svn.commands.lock( testServer + "/test2.txt", function( err, data ) {
				should.not.exist(err);
				// trying to delete the file should fail
				svn.commands.del( testServer + "/test2.txt", "del commit", function( err2 ) {
					should.exist(err2);
					done();
				} );
			} );
		});
		
		it('unlock: remote file in repo', function(done) {
			svn.commands.unlock( testServer + "/test2.txt", function( err, data ) {
				should.not.exist(err);
				// trying to delete the file should succeed
				svn.commands.del( testServer + "/test2.txt", "del commit", function( err2 ) {
					should.not.exist(err2);
					done();
				} );
			} );
		});

		it('mkdir: working copy', function(done) {
			var p = path.join( checkoutTestDir, "newdir" );
			svn.commands.mkdir( p, function( err ) {
				should.not.exist(err);
				should.ok( fs.existsSync( p ) && fs.statSync( p ).isDirectory() );
				done();
			} );
		});
		
		it('mkdir: remote repo', function(done) {
			svn.commands.mkdir( testServer + "/newdir_remote", 'mkdir commit', function( err ) {
				should.not.exist(err);
				// delete dir after
				svn.commands.del( testServer + "/newdir_remote", "del commit", function( err2 ) {
					should.not.exist(err2);
					done();
				} );
			} );
		});
		
		it('upgrade', function(done) {
			// TODO: run svnadmin to create an old version repo, then upgrade it and verify its the new version
			svn.commands.upgrade( checkoutTestDir, function( err ) {
				should.not.exist(err);
				done();
			} );
		});

		it('propset', function(done) {
			var p = path.join( checkoutTestDir, "newdir" );
			svn.commands.propset( 'testprop', 'myvalue', p, function( err ) {
				should.not.exist(err);
				done();
			} );
		});
		
		it('propget', function(done) {
			var p = path.join( checkoutTestDir, "newdir" );
			svn.commands.propget( 'testprop', p, function( err, data ) {
				should.not.exist(err);
				should.exist(data);
				done();
			} );
		});
				
		it('proplist', function(done) {
			var p = path.join( checkoutTestDir, "newdir" );
			svn.commands.proplist( p, function( err, data ) {
				should.not.exist(err);
				should.exist(data);
				done();
			} );
		});
				
		it('propdel', function(done) {
			var p = path.join( checkoutTestDir, "newdir" );
			svn.commands.propdel( 'testprop', p, function( err ) {
				should.not.exist(err);
				done();
			} );
		});

		// it('relocate', function(done) {
			// svn.commands.relocate( p, function( err, data ) {
				// should.not.exist(err);
				// done();
			// } );
		// });
		
		// it('switch', function(done) {
			// svn.commands.switch( p, function( err, data ) {
				// should.not.exist(err);
				// done();
			// } );
		// });
	});
	
	describe( 'util', function() {
							
		it('getRevision path', function(done) {
			svn.util.getRevision( checkoutTestDir, function( err, data ) {
				should.not.exist(err);
				data.should.be.a.Number;
				done();
			} );
		});

		it('getRevision url', function(done) {
			svn.util.getRevision( testServer, function( err, data ) {
				should.not.exist(err);
				data.should.be.a.Number;
				done();
			} );
		});
		
		// it('getTags', function(done) {
			// svn.util.getTags( testServer, function( err, data ) {
				// should.not.exist(err);
				// data.should.be.instanceof( Array );
				// done();
			// } );
		// });
		
		// it('getLatestTag', function(done) {
			// svn.util.getLatestTag( testServer, function( err, data ) {
				// should.not.exist(err);
				// //console.log( data );
				// done();
			// } );
		// });
	} );
	
	
	describe( 'SVNMucc helper', function() {
		it( 'put', function( done ) {
			var h = new svn.util.MuccHelper();
			h.put( 'contents of new file', testServer + '/newfile.txt' );
			h.commit( function( err ) {
				should.not.exist(err);
				done();
			} );
		} );
		
		it( 'cp', function( done ) {
			var h = new svn.util.MuccHelper();
			h.cp( testServer + '/newfile.txt', testServer + '/newfile2.txt' );
			h.commit( function( err ) {
				should.not.exist(err);
				done();
			} );
		} );
	} );
});

