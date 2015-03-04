# node-svn-ultimate
The ultimate SVN wrapper for node. Contains all the methods exposed by the command line svn tool, including checkout, update, info, etc, and includes svnmucc support.

Has methods for manipulating both working copies and the repo directly.

All direct svn command line functions are exposed through the commands object, and accept the same parameters as the command line tool.

Utility methods are provided through a util object.

```
npm install node-svn-ultimate --save
```

Example usage

```
var svnUltimate = require('node-svn-ultimate');

svnUltimate.commands.checkout( 'https://my.url/svn/repo', '/home/user/checkout', function( err ) {
	console.log( "Checkout complete" );
} );

svnUltimate.commands.update( '/home/user/checkout',
	{	// optional options object - can be passed to any command not just update
		trustServerCert: true,	// same as --trust-server-cert
		username: "username",	// same as --username
		password: "password",	// same as --password
		shell: "sh", 			// override shell used to execute command
		cwd: process.cwd(),		// override working directory command is executed
		quiet: true,			// provide --quiet to commands that accept it
		force: true,			// provide --force to commands that accept it
		revision: 33050,		// provide --revision to commands that accept it
		depth: "empty",			// provide --depth to commands that accept it
		ignoreExternals: true,	// provide --ignore-externals to commands that accept it
		params: [ '-m "Commit comment"' ] // extra parameters to pass
	},
	function( err ) {
		console.log( "Update complete" );
	} );
	
```

Utility methods

```
// Gets the working copy revision or the HEAD revision if the target is a URL
svnUltimate.util.getRevision( 'https://my.url/svn/repo', function( err, revision ) {
	console.log( "Head revision=" + revision );
} );

var obj = svnUltimate.util.parseUrl( 'https://my.url/svn/repo/trunk' );
// this call will return an object comprising of
obj = {
	rootUrl: 'https://my.url/svn/repo',
	type: 'trunk', // either trunk, tags, or branches
	typeName: '1.3.5' // only populated if a tag or a branch, name of the tag or branch
	trunkUrl: 'https://my.url/svn/repo/trunk',
	tagsUrl: 'https://my.url/svn/repo/tags',
	branchesUrl: 'https://my.url/svn/repo/branches'
};


svnUltimate.util.getTags( 'https://my.url/svn/repo/trunk', function( err, tagsArray ) {
	// tagsArray will be an array of strings containing all tag names
} );

svnUltimate.util.getLatestTag( 'https://my.url/svn/repo/trunk', function( err, latestTag ) {
	// latestTag will be the most recent tag, worked out by semver comparison (not the date it was created)
} );

```

