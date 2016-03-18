# Bookwriter Markdown Wiki

One of my favorite writers, Brandon Sanderson, often talks about using a local, personal wiki to track characters, world building, and plot lines while writing stories. I want one too, but I don't like MediaWiki format and would prefer Markdown.

BookWiki is:
- Personal wiki running on your machine
- Saves to flat files which can be read independent of the wiki software
- Uses GIT to track changes
- Node.js (Express) app, using npm and bower partly as a learning exercise
- Uses [marked](https://github.com/chjj/marked) to render on both client and server

BookWiki is intended for a single user. As such, it does nothing to lock files or check if someone else has modified the file when saving it. Nor does it have user accounts to track who did what. You can loosely get those features anyway by hosting your content directory GIT repo in a shared location and having separate users on their own computers use git pull/push so that GIT will track the user and resolve conflicts.

## Setup

First, make sure you have npm and git installed. Then a simple npm install and bower install will make sure all the dependencies are downloaded and up-to-date.

Create a directory named `content` in the root folder of the project. Then initialize it as a git repository.

    git clone https://github.com/zeamprime/MDBookWiki.git MDBookWiki
    cd MDBookWiki
    npm install -g nodemon
    npm install -g bower
    npm install
    bower install
    mkdir content
    cd content
    git init

To run, double-click the `BookWiki.command` file on a Mac, or on any Unix-like system run `npm run server` and open your browser to `http://localhost:3000`.

## Future Plans

Provide a GUI in the web app for viewing the GIT history and diffs, and to revert changes.

Maybe use this as a learning tool for React by making this improved GUI in React and doing both server-side and client-side rendering the same. At present the scaffolding for Express set up EJS templates so I just used those with minimal Javascript and jQuery on the client.

Ideally text would be formatted as you type instead of toggling between edit and view modes. This would probably require creating a more complex custom editor component.
