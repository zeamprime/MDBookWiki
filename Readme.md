# React Experiment + Bookwriter Markdown Wiki

I found something to build for my learning process: Brandon Sanderson often talks about using a local, personal wiki to track characters, world building, and plot lines while writing stories. I want one too, but I don't like MediaWiki format and would prefer Markdown.

## Plan

Each page is a tiny bit of chrome/frame with most of the contents being the HTML rendered Markdown in the middle. Long-term I want this to actually be the markdown just with font, color, and styles applied to it, so I'll need my own parser. Short term there will be a button to switch into a text box to edit the MD and then switch back.

I can use https://github.com/chjj/marked to render the md, which the Facebook React tutorial included (I forget why) so thanks. That means client-side rendering after every edit. But send the md back to the server to save as well. We can do server-side rendering too when a new page is loaded.

I could use a database, but I could also use flat files for the md and commit them with git, thereby gaining the diff history which I can later build a GUI to. Which is a better idea? The advantage of flat files and git is that I can see and edit them independent of the web app too.

I want this to be quick to build, maybe even a single client page. The same one will be returned by server over and over just with a different name and different pre-rendered content. The server? Well, Express is the most common so maybe stick with that for now. (Was looking at Nodal, but it is young.) Or I could make a simple PHP app which would not require running an extra process to access the wiki, but then I don't get the symmetrical server side rendering.

## Links / Notes

https://quickleft.com/blog/react-on-express-tutorial-the-twitter-timeline-game-part-1/
For building a React + Express server that renders views. Shows some npm dependencies and such. 
- What is browser.json for? What is Bower for? (I don't like blindly installing things.)
- Ah, apparently Bower is like npm for the client side part, so I'm guessing browser.json goes with that. Oh, and it is bower.json anyway. Haha.

