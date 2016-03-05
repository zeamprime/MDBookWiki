module.exports = function(manager) {
	var express = require('express');
	var router = express.Router();

	/* GET home page. */
	router.get('/', function(req, res, next) {
		res.render('index', { 
			title: manager.title,
			pages: manager.getRecentAndTopPages(10)
		});
	});
	
	/* POST book name (should be PUT but forms only support POST) */
	router.post('/', function(req, res, next) {
		var action = req.body.act;
		if( action !== 'Rename' ) {
			res.send('Invalid action: ' + action + "<br/>" + JSON.stringify(req.body));
			return;
		}
		var name = req.body.bookname;
		if( !name || !name.match(/[a-zA-Z0-9 _+&@!-]/) ) {
			res.send('Invalid book name: ' + name);
			return;
		}
		
		manager.title = name;
		manager.saveBookInformation();
		
		res.render('index', { 
			title: manager.title,
			pages: manager.getRecentAndTopPages(10)
		});
	});
	
	return router;
}