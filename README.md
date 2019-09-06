# node-svn-ultimate

***This project is no longer maintained***

The ultimate SVN wrapper for node. Contains all the methods exposed by the command line svn tool, including checkout, update, info, etc, and includes svnmucc support.

Has methods for manipulating both working copies and the repo directly.

All direct svn command line functions are exposed through the commands object, and accept the same parameters as the command line tool.

Utility methods are provided through a util object.

```
npm install node-svn-ultimate --save
```

### Example usage

```js
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
		params: [ '-m "Commit comment"' ], // extra parameters to pass
		'config-option': [
			'servers:global:http-proxy-host=proxy.someProxy.com',
			'servers:global:http-proxy-port=8080',
		] // provide --config-option to commands that accept it.  Use an array for multiple config options
	},
	function( err ) {
		console.log( "Update complete" );
	} );

```

### Utility methods

```js
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

## Methods

<dl>
<dt><a href="#commands">commands</a> : <code>object</code></dt>
<dd><p>Exposes the commands for the command line svn tool.</p>
</dd>
<dt><a href="#util">util</a> : <code>object</code></dt>
<dd><p>Exposes some custom utility methods</p>
</dd>
</dl>
<a name="commands"></a>

## commands : <code>object</code>

Exposes the commands for the command line svn tool.

**Kind**: global namespace  

* [commands](#commands) : <code>object</code>
  * [.checkout(url, dir, [options], [callback])](#commands.checkout)
  * [.add(files, [options], [callback])](#commands.add)
  * [.cat(targets, [options], [callback])](#commands.cat)
  * [.cleanup(wc, [options], [callback])](#commands.cleanup)
  * [.commit(files, [options], [callback])](#commands.commit)
  * [.copy(srcs, dst, [options], [callback])](#commands.copy)
  * [.del(srcs, [options], [callback])](#commands.del)
  * [.export(src, dst, [options], [callback])](#commands.export)
  * [.import(src, dst, [options], [callback])](#commands.import)
  * [.info(targets, [options], [callback])](#commands.info)
  * [.list(targets, [options], [callback])](#commands.list)
  * [.lock(targets, [options], [callback])](#commands.lock)
  * [.log(targets, [options], [callback])](#commands.log)
  * [.merge(targets, [options], [callback])](#commands.merge)
  * [.mergeinfo(source, target, [options], [callback])](#commands.mergeinfo)
  * [.mkdir(targets, [options], [callback])](#commands.mkdir)
  * [.move(srcs, dst, [options], [callback])](#commands.move)
  * [.propdel(propName, target, [options], [callback])](#commands.propdel)
  * [.propget(propName, targets, [options], [callback])](#commands.propget)
  * [.proplist(targets, [options], [callback])](#commands.proplist)
  * [.propset(propName, propVal, wc, [options], [callback])](#commands.propset)
  * [.relocate(url, wc, [options], [callback])](#commands.relocate)
  * [.revert(wc, [options], [callback])](#commands.revert)
  * [.status(wc, [options], [callback])](#commands.status)
  * [.switch(url, wc, [options], [callback])](#commands.switch)
  * [.unlock(targets, [options], [callback])](#commands.unlock)
  * [.update(wcs, [options], [callback])](#commands.update)
  * [.upgrade(wcs, [options], [callback])](#commands.upgrade)
  * [.mucc(commandArray, commitMessage, [options], [callback])](#commands.mucc)

<a name="commands.checkout"></a>
### commands.checkout(url, dir, [options], [callback])
Checks out a repository to a working copy

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Repository URL |
| dir | <code>string</code> | Working copy dir |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.add"></a>
### commands.add(files, [options], [callback])
Adds a file / folder to a working copy

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array</code> &#124; <code>string</code> | Add given files / folders |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.cat"></a>
### commands.cat(targets, [options], [callback])
Gets the content of a file from either a working copy or a URL.

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Array of URLs or working copy files to catalogue |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.cleanup"></a>
### commands.cleanup(wc, [options], [callback])
Performs an svn cleanup operation on the working copy

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| wc | <code>string</code> | Working copy directory to clean |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.commit"></a>
### commands.commit(files, [options], [callback])
Commits a working copy to a repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array</code> &#124; <code>string</code> | Array of files / folders to commit |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.copy"></a>
### commands.copy(srcs, dst, [options], [callback])
Copies a file / folder within either a working copy or a URL

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| srcs | <code>Array</code> &#124; <code>string</code> | URLs / files to copy |
| dst | <code>string</code> | destination |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.del"></a>
### commands.del(srcs, [options], [callback])
Deletes a file/folder from either a working copy or a URL

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| srcs | <code>Array</code> &#124; <code>string</code> | Array of URLs / files to delete |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.export"></a>
### commands.export(src, dst, [options], [callback])
Exports a file from the repository to a local file

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| src | <code>string</code> | Source URL |
| dst | <code>string</code> | Destination file |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.import"></a>
### commands.import(src, dst, [options], [callback])
Imports a file to the repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| src | <code>string</code> | Source file |
| dst | <code>string</code> | Destination URL |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.info"></a>
### commands.info(targets, [options], [callback])
Performs an svn info command on a given working copy file / URL

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Target URLs / files to info |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.list"></a>
### commands.list(targets, [options], [callback])
Lists the files within a directory, either working copy or URL

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Target URLs / files to list |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.lock"></a>
### commands.lock(targets, [options], [callback])
Locks a file in a working copy / repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Target URLs / files to lock |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.log"></a>
### commands.log(targets, [options], [callback])
Gets the SVN message log and returns as a JSON object

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Target URLs / files to get logs for |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.merge"></a>
### commands.merge(targets, [options], [callback])
Apply the differences between two sources to a working copy path

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Target URLs |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.mergeinfo"></a>

### commands.mergeinfo(source, target, [options], [callback])
Query information related to merges (or potential merges) between SOURCE and TARGET.

**Kind**: static method of [<code>commands</code>](#commands)  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | SOURCE URL |
| target | <code>string</code> | TARGET URL |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.mkdir"></a>
### commands.mkdir(targets, [options], [callback])
Creates a directory in the working copy or repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Target URLs / folders to create |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.move"></a>
### commands.move(srcs, dst, [options], [callback])
Moves a file / folder in a working copy or URL

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| srcs | <code>Array</code> &#124; <code>string</code> | Target URLs / files to move |
| dst | <code>string</code> | Destination URL / file |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.propdel"></a>
### commands.propdel(propName, target, [options], [callback])
Deletes an svn property from a working copy / repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| propName | <code>string</code> | Property name |
| target | <code>string</code> | Target file / folder or URL |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.propget"></a>
### commands.propget(propName, targets, [options], [callback])
Gets an svn property from a working copy / repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| propName | <code>string</code> | Property name |
| targets | <code>Array</code> &#124; <code>string</code> | Target file / folder or URL |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.proplist"></a>
### commands.proplist(targets, [options], [callback])
Lists svn properties from a working copy / repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Target file / folder or URL |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.propset"></a>
### commands.propset(propName, propVal, wc, [options], [callback])
Sets an svn property from a working copy / repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| propName | <code>string</code> | Property name |
| propVal | <code>string</code> | Property value |
| wc | <code>string</code> | Target file / folder or URL |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.relocate"></a>
### commands.relocate(url, wc, [options], [callback])
Relocates an svn working copy

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Relocation URL |
| wc | <code>string</code> | Working copy to relocate |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.revert"></a>
### commands.revert(wc, [options], [callback])
Reverts files / folders in a working copy to their uncommited state

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| wc | <code>string</code> | Working copy target |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.status"></a>
### commands.status(wc, [options], [callback])
Performs an svn status command on a working copy

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| wc | <code>string</code> | Working copy target |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.switch"></a>
### commands.switch(url, wc, [options], [callback])
Switches to a given branch / tag for a working copy

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Switch URL |
| wc | <code>string</code> | Working copy target |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.unlock"></a>
### commands.unlock(targets, [options], [callback])
Unlocks a previously locked svn file from a working copy / repository

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| targets | <code>Array</code> &#124; <code>string</code> | Working copy / URL targets |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.update"></a>
### commands.update(wcs, [options], [callback])
Updates an svn working copy

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| wcs | <code>Array</code> &#124; <code>string</code> | Working copy targets |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.upgrade"></a>
### commands.upgrade(wcs, [options], [callback])
Upgrades a given svn working copy (requires v1.7 of svn client)

**Kind**: static method of <code>[commands](#commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| wcs | <code>Array</code> &#124; <code>string</code> | Working copy targets |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="commands.mucc"></a>
### commands.mucc(commandArray, commitMessage, [options], [callback])
Executes svnmucc command, for multiple commands

**Kind**: static method of <code>[commands](#commands)</code>  
**See**: http://svnbook.red-bean.com/en/1.8/svn.ref.svnmucc.re.html  

| Param | Type | Description |
| --- | --- | --- |
| commandArray | <code>Array</code> | Array of command strings, see above link for options |
| commitMessage | <code>string</code> | Commit message to use |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="util"></a>
## util : <code>object</code>
Exposes some custom utility methods

**Kind**: global namespace  

* [util](#util) : <code>object</code>
  * [.getRevision(target, [options], [callback])](#util.getRevision)
  * [.getWorkingCopyRevision(wcDir, [options], [callback])](#util.getWorkingCopyRevision)
  * [.parseUrl(url)](#util.parseUrl) ? <code>object</code>
  * [.getTags(url, [options], [callback])](#util.getTags)
  * [.getLatestTag(url, options, [callback])](#util.getLatestTag)

<a name="util.getRevision"></a>
### util.getRevision(target, [options], [callback])
Gets head revision of a given URL

**Kind**: static method of <code>[util](#util)</code>  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>string</code> | Target URL |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="util.getWorkingCopyRevision"></a>
### util.getWorkingCopyRevision(wcDir, [options], [callback])
Gets the revision of a working copy.

**Kind**: static method of <code>[util](#util)</code>  

| Param | Type | Description |
| --- | --- | --- |
| wcDir | <code>string</code> | Working copy folder |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="util.parseUrl"></a>
### util.parseUrl(url) ? <code>object</code>
Parse a url for an SVN project repository and breaks it apart

**Kind**: static method of <code>[util](#util)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL to parse |

<a name="util.getTags"></a>
### util.getTags(url, [options], [callback])
Gets all available tags for the given svn URL

**Kind**: static method of <code>[util](#util)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Project URL to get tags for |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="util.getLatestTag"></a>
### util.getLatestTag(url, options, [callback])
Uses node's semver package to work out the latest tag value

**Kind**: static method of <code>[util](#util)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Project URL to get latest tag for |
| options | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |

<a name="util.getBranches"></a>
### util.getBranches(url, [options], [callback])
Gets all available branches for the given svn URL

**Kind**: static method of <code>[util](#util)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Project URL to get branches for |
| [options] | <code>object</code> | Options object |
| [callback] | <code>function</code> | Complete callback |




