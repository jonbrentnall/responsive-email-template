# Responsive Email Template

Run `npm install`, update the deets in `secrets-example.json` and rename to `secrets.json`. Details for mailgun & tinypng can be found in the [wiki](http://wiki.pdcx.uk/index.php).

The `gulp` default task will spin up a local web server on port 3000 and output the compiled `app/base/base.hbs` to `app/index.html`.

`gulp build` cleans the dist directory before inlining all css, compressing any images and syncing it with the app directory, so don't put anything in the dist directory unless you're happy for it to disappear!

`gulp send` will run the build task and send to the email specified in the secrets.json file using Mailgun.

The handlebars task has a function to save out multiple files using the `emailTitle` field found within `app/base/base.json`. Uncomment `fileName = email.emailTitle.replace(/ +/g, '-').toLowerCase();`, comment out `fileName = 'index';` and handlebars will output every emailTitle field found in the base.json as a seperate email.

Visit the [wiki](http://wiki.pdcx.uk/index.php/HTML_email) for further help / bug fixes.
