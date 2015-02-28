# node-svn-ultimate
The ultimate SVN wrapper for node. Contains all the basic methods checkout, update, info, etc, and includes svnmucc support.

Has methods for manipulating both working copies and the repo directly.

```
npm install node-svn-ultimate --save
```

Example usage

```
var svnUltimate = require('node-svn-ultimate');

svnUltimate.checkout( 'https://my.url/svn/repo', '/home/user/checkout', function( err ) {
	console.log( "Checkout complete" );
} 

svnUltimate.update( '/home/user/checkout', function( err ) {
	console.log( "Checkout complete" );
} );
```

