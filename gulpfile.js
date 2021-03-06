var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    jsonminify = require('gulp-jsonminify'),
    minifyhtml = require('gulp-minify-html'),
    uglify = require('gulp-uglify');

var env,
    coffeeSources,
    htmlSources,
    jsonSources,
    jsSources,
    sassSources,
    sassStyle,
    outputDir;

env = process.env.NODE_ENV || 'development';

if(env == 'development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/tagline.coffee'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + 'js/*.json'];
jsSources = [
    'components/scripts/rclick.js',
    'components/scripts/pixgrid.js',
    'components/scripts/tagline.js',
    'components/scripts/template.js'
];

sassSources = ['components/sass/style.scss'];

gulp.task('coffee', function() {
    console.log(env + ' environment');
    gulp.src(coffeeSources)
        .pipe(coffee({ bare: true })
              .on('error', gutil.log))
        .pipe(gulp.dest('components/scripts'))
});

gulp.task('html', function() {
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env == 'production', minifyhtml()))
        .pipe(gulpif(env == 'production', gulp.dest(outputDir)))
        .pipe(connect.reload());
});

gulp.task('json', function() {
    gulp.src('builds/development/js/*.json')
        .pipe(gulpif(env == 'production', jsonminify()))
        .pipe(gulpif(env == 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload());
});

gulp.task('js', function() {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(gulpif(env == 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload())
});

gulp.task('compass', function() {
    console.log(sassStyle + ' style, send to ' + outputDir);
    gulp.src(sassSources)
        .pipe(compass({
            sass: 'components/sass',
            image: outputDir + 'images',
            style: sassStyle
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload())
});

gulp.task('connect', function() {
    connect.server({
        root: outputDir,
        livereload: true
    })
});

gulp.task('watch', function() {
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch('builds/development/*.json', ['json']);
    gulp.watch('components/sass/*.scss', ['compass']);
});

gulp.task('default', ['coffee', 'html', 'json', 'js', 'compass', 'connect', 'watch']);