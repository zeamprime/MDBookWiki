module.exports = function(app) {
	
	var path = require('path');
	var fs = require('fs');
	var marked = require('marked');
	var child_process = require('child_process');
	
	var MAX_HISTORY = 30;
	
	/***
	 * Class for managing the site metadata and list of pages.
	 * It handles saving this data too.
	 */
	var Manager = function(app, contentDir) {
		this.app = app;
		this.contentDir = contentDir;
		this.pages = {}; //name => Page map
		this.info = {}; //blank by default, but we'll load it below.
		this.recent = []; //names of pages recently updated or accessed.
		
		this.loadBookInformation();
		this.discoverContent();
	}
	Manager.prototype = {
		
		/**
		 * Read the metadata site information file.
		 * 
		 * (Synchronous since this is part of server startup)
		 */
		loadBookInformation: function() {
			var filepath = path.join(this.contentDir, "info.json");
			if( fs.existsSync(filepath) ) {
				this.info = JSON.parse(fs.readFileSync(filepath));
			}
			
			if( this.info.title === undefined ) {
				this.info.title = "MyBook";
			}
			if( Array.isArray(this.info.recent) ) {
				this.recent = this.info.recent;
			}
			console.log(JSON.stringify(this.info));
		},
		
		/**
		 * Save (async) the metadata about this book.
		 */
		saveBookInformation: function() {
			this.info.recent = this.recent; //save this too
			
			//If manually called, turn off any delayed save
			if( this._saveTimeout ) {
				clearTimeout(this._saveTimeout);
				this._saveTimeout = null;
			}
			
			var filepath = path.join(this.contentDir, "info.json");
			fs.writeFile(filepath, JSON.stringify(this.info), function(err) {
				if(err) {
					console.log("Error saving book information: " + err);
				} else {
					console.log("Saved info.json");
				}
			});
		},
		
		/**
		 * Initial scan of content directory to discover what pages we have.
		 */
		discoverContent: function() {
			var self = this; //cheap bind
			fs.readdir(this.contentDir, function(err, files) {
				if (err || files === undefined) {
					console.log("Error loading content directory: " + err);
					return;
				}
				files.forEach(function(file) {
					if( path.extname(file) === '.md' ) {
						console.log("Loading " + file);
						var name = path.basename(file,'.md');
						self.pages[name.toLowerCase()] = new Page(name, path.join(self.contentDir, file));
					}
				});
			});
		},
		
		get title() {
			return this.info.title;
		},
		set title(value) {
			this.info.title = value;
		},
		
		getPage: function(name) {
			return this.pages[name.toLowerCase()];
		},
		
		/**
		 * Create or update a page of the given name.
		 * If it is new, we create a new Page object.
		 * Schedule a write to disk.
		 */
		updatePage: function(name, content) {
			var page = this.getPage(name);
			if(!page) {
				page = new Page(name, path.join(this.contentDir, name + '.md'));
				this.pages[name.toLowerCase()] = page;
			}
			page.content = content;
			this.addRecent(page.name);
			
			page.save();
		},
		
		/**
		 * Get a list of recent pages. Also includes "top" or "main" pages that should always be in
		 * the home page's list.
		 */
		getRecentAndTopPages: function(limit) {
			if( !limit ) limit = MAX_HISTORY;
			var self = this;
			var list = [];
			
			//Add in the "top" pages. These might not all exist.
			['home', 'overview', 'index', 'book', 'main'].forEach(function(name) {
				var page = self.pages[name];
				if(page) list.push(page);
			});
			
			//Grab the N most recent pages
			limit -= list.length;
			for(var i = 0; i < limit && i < this.recent.length; i++) {
				var page = this.pages[this.recent[i]];
				if(page) list.push(page); //sanity check to make sure it was not deleted
			}
			
			return list;
		},
		
		/**
		 * Add a page to the recents list. If already on there, just moves it up.
		 */
		addRecent: function(pageName) {
			var newList = [pageName.toLowerCase()];
			for(var i = 0; i < this.recent.length && i < MAX_HISTORY; i++) {
				if( this.recent[i] != pageName.toLowerCase() ) {
					newList.push(this.recent[i]);
				}
			}
			this.recent = newList;
			
			//Periodically save to keep the recent list up-to-date.
			if( !this._saveTimer ) {
				var self = this;
				this._saveTimer = setTimeout(function() { self._saveCallback() }, 5 * 60 * 1000);
			}
		},
		
		_saveCallback: function() {
			this._saveTimeout = null;
			this.saveBookInformation();
		}
	};
	
	var Page = function(name, path) {
		this.name = name;
		this.path = path;
		
		this._content = null; //not loaded yet
	}
	Page.prototype = {
		
		/**
		 * Async load the page's contents from disk, if not already loaded.
		 */
		load: function(cb) {
			if( this._content !== null ) {
				if(cb) cb();
				return;
			}
			var self = this;
			fs.readFile(this.path, function(err, data) {
				if(err || !data) {
					self._content = "Error loading " + self.name + " from " + self.path + ": " + err;
				} else {
					self._content = data.toString(); //is a buffer, need toString
				}
				if(cb) cb();
			});
		},
		
		/**
		 * Async write back to the file
		 */
		save: function(cb) {
			var self = this;
			fs.writeFile(this.path, this._content, function(err) {
				if(err) {
					console.log("Failed to save " + self.name + ": " + err);
					return;
				}
				
				//Save in GIT to preserve history
				var cmd = 'cd content && git add "' + path.basename(self.path) + 
						'" && git commit -m "Updated ' + self.name + '"';
				child_process.exec(cmd, function(err, out) {
					if( !err && out && out.indexOf("Error") !== -1 ) { err = out; }
					if(err) {
						console.log("Failed to commit " + self.name + ": " + err);
						return;
					}
					console.log("Saved " + self.name + ": " + out);
				});
				
				if(cb) cb(err);
			});
		},
		
		/**
		 * Get the raw Markdown content
		 */
		get content() { return this._content; },
		
		/**
		 * Update the contents of this file.
		 * This should be done by the manager, so that it can properly schedule a delayed write to
		 * the content file. 
		 */
		/*protected*/ set content(data) { this._content = data; },
		
		/**
		 * Get the content rendered as HTML
		 */
		get htmlContent() {
			return marked(this._content);
		},
		
		/**
		 * Compute a URL for accessing this page.
		 */
		get url() {
			return '/page/' + this.name;
		}
	};
	
	return new Manager(app, './content');
};