'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var envify = require('envify/custom');
var partialify = require('partialify');
var source = require('vinyl-source-stream');
var rimraf = require('gulp-rimraf');
var notify = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');



// default task /////////////////////////////////////////////////
gulp.task('default', ['build', 'browser-sync', 'watch']);


gulp.task('clean', function() {
    return gulp.src(['build/**/*'], {
        read: false
    }).pipe(rimraf());
});


// build tasks //////////////////////////////////////////////////
gulp.task('build', ['browserify', 'css', 'html', 'images']);

gulp.task('browserify', function() {
    var environ = {
        NODE_ENV: process.env.NODE_ENV
    };
    return browserify('./public/main.js')
        .transform(envify(environ))
        .transform(partialify)
        .bundle({
            debug: process.env.NODE_ENV === 'development'
        })
        .on('error', notify.onError('Error: <%= error.message %>'))
        .pipe(source('index.js'))
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.reload({
            stream: true,
            once: true
        }));
});



// assets //////////////////////////////////////////////////////
gulp.task('html', function() {
    gulp.src('./public/**/*.html')
        .pipe(gulp.dest('build/'));
});

gulp.task('css', function() {
    return gulp.src('public/**/*.css')
        .pipe(autoprefixer('last 1 version'))
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});


gulp.task('images', ['favicon'], function() {
    return gulp.src('public/img/**/*')
        .pipe(gulp.dest('build/img'));
});

gulp.task('favicon', function() {
    return gulp.src('public/img/favicon.ico')
        .pipe(gulp.dest('build/'));
});


gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: './build',
        }
    });
});


gulp.task('watch', function() {
    gulp.watch('public/**/*', ['build']);
});