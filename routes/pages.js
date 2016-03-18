// @param manager - Manages all the page and website information
module.exports = function(manager) {
	var express = require('express');
	var router = express.Router();

	/* GET all pages. */
	router.get('/page-index', function(req, res, next) {
		var pages = [];
		for(var key in manager.pages) {
			pages.push(manager.pages[key]);
		}
		res.render('allpages', { 
			title: manager.title,
			pages: pages
		});
	});
	
	/* GET a pages. */
	router.get('/:id', function(req, res, next) {
		name = req.params.id;
		if( name.indexOf('.') !== -1 || name.indexOf('/') !== -1 ) {
			res.send('Invalid page name: ' + name);
			return;
		}
		name = name.replace(/[^a-zA-Z0-9 +-_]/g,"")
		var page = manager.getPage(name);
		if( page === undefined ) {
			res.render('page', { 
				title: req.params.id + ' - ' + manager.title,
				content: 'Page ' + name + ' has not been created yet.',
				htmlContent: "",
				editMode: true,
				url: '/page/' + name
			});
		} else {
			manager.addRecent(page.name);
			page.load(function() {
				res.render('page', { 
					title: page.name + ' - ' + manager.title,
					content: page.content,
					htmlContent: page.htmlContent,
					editMode: false,
					url: page.url
				});
			});
		}
	});


	/* POST :page */
	router.post('/:id', function(req, res, next) {
		name = req.params.id;
		if( name.indexOf('.') !== -1 || name.indexOf('/') !== -1 ) {
			res.send('Invalid page name: ' + name);
			return;
		}
		name = name.replace(/[^a-zA-Z0-9 +-_]/g,"")
		
		manager.updatePage(name, req.body.content);
		res.send('Updated - ' + req.body.content.length + ' chars');
	});

	return router;
}