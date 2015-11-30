'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require("gulp-minify-css");
var gutil = require('gulp-util');
var del = require('del');


var paths = {

    buildPath : './build/',

    cssPath:[
        'css/bootstrap.css',
        'css/reset.css',
        'css/style.css'
    ],
    appJs:[
        'app.js',
        'controller/GameController.js',
        'model/GameService.js',
        'model/UserService.js',
        'model/transformRequestAsFormPost.js',
        'model/utils.js',
        'directives/gameCards.js'
    ],
    vendorJsPath:[
        'node_modules/jquery/dist/jquery.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-route/angular-route.js',
        'node_modules/angular-cookies/angular-cookies.js',
        'node_modules/angular-ui-bootstrap/ui-bootstrap.js',
        'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.js',
        'prototype.js'
    ]
};

gulp.task('minfy-js', function () {
    return gulp.src(paths.appJs)
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        .pipe(uglify()).on('error', gutil.log)
        .pipe(gulp.dest(paths.buildPath)).on('error', errorHandler);
});

gulp.task('minfy-css', function () {
    gulp.src(paths.cssPath)
        .pipe(concat('app.css'))
        .pipe(minifyCss()).on('error', gutil.log)
        .pipe(gulp.dest(paths.buildPath)).on('error', errorHandler);
});

gulp.task('minfy-vendor-js', function () {
    gulp.src(paths.vendorJsPath)
        .pipe(concat('vendor.js'))
        .pipe(uglify()).on('error', gutil.log)
        .pipe(gulp.dest(paths.buildPath)).on('error', errorHandler);
});

gulp.task('clean', function (cb) {
    del(paths.buildPath+'*', cb);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', [
    'clean',
    'minfy-vendor-js',
    'minfy-js',
    'minfy-css'
]);

// Handle the error
function errorHandler(error) {
    console.log(error.toString());
    this.emit('end');
}

