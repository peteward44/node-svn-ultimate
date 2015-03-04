/*global describe:false, it:false */

// Note: These tests require a functional Artifactory server to test against
'use strict';

var svnUltimate = require('../');

var path = require('path');
var should = require('should');
var fs = require('fs.extra');

var testServer = "https://localhost/svn/work/tagtest/trunk";
var nonExistantUrl = "https://fud.com/svn/work";
var tempTestDir = "temp";

describe('node-svn-ultimate', function() {

	describe('commands', function() {
		it('checkout', function(done) {
			var p = path.join( tempTestDir, "out_works" );
			svnUltimate.commands.checkout( testServer, p, function( err ) {
				should.not.exist(err);
				done();
			} );
		});
		it('checkout invalid url', function(done) {
			var p = path.join( tempTestDir, "out_invalid" );
			svnUltimate.commands.checkout( nonExistantUrl, p, { quiet: true }, function( err ) {
				should.exist(err);
				done();
			} );
		});
		
		it('update', function(done) {
			var p = path.join( tempTestDir, "out_works" );
			svnUltimate.commands.update( p, function( err ) {
				should.not.exist(err);
				done();
			} );
		});

		it('add', function(done) {
			var p = path.join( tempTestDir, "out_works" );
			var fp = path.join( p, "test2.txt" );
			fs.writeFileSync( fp, "aa" );
			svnUltimate.commands.add( fp, function( err ) {
				should.not.exist(err);
				// TODO: check status command to make sure test2.txt has been added
				done();
			} );
		});

		it('cat', function(done) {
			svnUltimate.commands.cat( testServer + "/bower.json", function( err, data ) {
				should.not.exist(err);
				should.ok( data.length > 0 );
				done();
			} );
		});
		
		it('cat fails', function(done) {
			svnUltimate.commands.cat( testServer + "/bower2.json", { quiet: true }, function( err, data ) {
				should.exist(err);
				done();
			} );
		});

		it('cleanup', function(done) {
			var p = path.join( tempTestDir, "out_works" );
			svnUltimate.commands.cleanup( p, function( err, data ) {
				should.not.exist(err);
				done();
			} );
		});
		
		it('log', function(done) {
			svnUltimate.commands.log( testServer, function( err, data ) {
				should.not.exist(err);
				console.log( data );
				done();
			} );
		});
				
		it('info', function(done) {
			svnUltimate.commands.info( testServer, function( err, data ) {
				should.not.exist(err);
				console.log( data );
				done();
			} );
		});
						
		it('list', function(done) {
			svnUltimate.commands.list( testServer, function( err, data ) {
				should.not.exist(err);
				console.log( data );
				done();
			} );
		});
		
		it('mucc', function(done) {
			svnUltimate.commands.mucc( [ "mkdir " + testServer + "/testdir" ], "commit", function( err, data ) {
				should.not.exist(err);
				console.log( data );
				done();
			} );
		});
	});
	
	describe( 'util', function() {
							
		it('getRevision path', function(done) {
			var p = path.join( tempTestDir, "out_works" );
			svnUltimate.util.getRevision( p, function( err, data ) {
				should.not.exist(err);
				data.should.be.a.Number;
				done();
			} );
		});

		it('getRevision url', function(done) {
			svnUltimate.util.getRevision( testServer, function( err, data ) {
				should.not.exist(err);
				data.should.be.a.Number;
				done();
			} );
		});
		
		it('getTags', function(done) {
			svnUltimate.util.getTags( testServer, function( err, data ) {
				should.not.exist(err);
				data.should.be.instanceof( Array );
				done();
			} );
		});
		
		it('getLatestTag', function(done) {
			svnUltimate.util.getLatestTag( testServer, function( err, data ) {
				should.not.exist(err);
				console.log( data );
				done();
			} );
		});
	} );
	
	after( function() {
		fs.deleteSync( tempTestDir );
	} );
});

