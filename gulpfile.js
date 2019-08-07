var gulp        = require('gulp');

var config      = require('./config.json');
var secrets     = require('./secrets.json');

var handlebars  = require('gulp-compile-handlebars');
var rename      = require('gulp-rename');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var del         = require('del');
var juice       = require('gulp-juice');
var mail        = require('gulp-mail');
var purgecss    = require('gulp-purgecss');
var tinypng     = require('gulp-tinypng-compress');

var fs          = require('fs');


gulp.task('sass', function(){
    return gulp.src('app/assets/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(gulp.dest('app/assets/css'))

        .pipe(browserSync.reload({
            stream: true
        }))
});


gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
        open: false
    });
});


gulp.task('juice', function(){
    return gulp.src(['app/*.html'])
        .pipe(juice({
            preserveMediaQueries: true,
            applyAttributesTableElements: true,
            applyWidthAttributes: true,
            preserveImportant: true,
            preserveFontFaces: true,
            removeStyleTags: false,
            webResources: {
                images: false,
                relativeTo: 'app/'
            }
        }))
        .pipe(gulp.dest('dist'));
});


gulp.task('watch:handlebars', function (){
    gulp.watch(['app/base/*.hbs', 'app/base/*.json', 'app/assets/scss/*.scss'], () => runSequence('sass', 'handlebars', browserSync.reload));
});


gulp.task('tinypng', function () {
    gulp.src('app/assets/img/**/*.{png,jpg,jpeg}')
        .pipe(tinypng({
            key: secrets.tinyPNG.apiKey,
            sigFile: 'app/assets/img/.tinypng-sigs',
            log: true
        }))
        .pipe(gulp.dest('dist/assets/img'));
});


gulp.task('clean:src', function() {
    return del.sync('app/*.html');
});


gulp.task('clean:dist', function() {
    return del.sync('dist/*.html');
});


gulp.task('purgecss', () => {
    return gulp
        .src('app/assets/css/styles.css')
        .pipe(
            purgecss({
                content: ['app/*.html']
            })
        )
        .pipe(gulp.dest('app/assets/css/'))
});


gulp.task('mail', function () {
    var smtpInfo = {
        auth: {
            user: secrets.mailgun.user,
            pass: secrets.mailgun.pass
        },
        host: secrets.mailgun.host,
        secureConnection: true,
        port: 465
    };

    return gulp.src('dist/index.html')
        .pipe(mail({
            subject: 'Email Preview',
            to: [
                secrets.recipient.email
            ],
            from: secrets.from.email,
            smtp: smtpInfo
        }));
});


gulp.task('handlebars', function() {

    emails = JSON.parse(fs.readFileSync('./app/base/base.json'))

    for(var i=0; i<emails.length; i++) {
        var email = emails[i],
        // Output files name as emailTitle variable in base.json, convert to lowercase and add '-' between the words.
        // fileName = email.emailTitle.replace(/ +/g, '-').toLowerCase();
        fileName = 'index';

        // console.log(email);

        gulp.src('app/base/*.hbs')
            .pipe(handlebars(email))
            .pipe(rename(fileName + ".html"))
            .pipe(gulp.dest('app/'));
    }

});


gulp.task('build', function (callback) {
    runSequence('clean:dist', 'handlebars', 'tinypng', 'sass', 'purgecss', 'juice',
        callback
    )
});


gulp.task('send', function (callback) {
    runSequence('build', 'mail',
        callback
    )
});


gulp.task('default', function (callback) {
    runSequence('sass', 'browserSync', 'handlebars', 'watch:handlebars',
        callback
    )
});

gulp.task('config', function() {
    console.log(config.paths.app); // ./app/
});
