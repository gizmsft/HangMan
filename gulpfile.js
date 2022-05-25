const { src, dest } = require('gulp');
const sassPlugin = require('gulp-sass')(require('sass'));
const uglifyPlugin = require('gulp-uglify');
const renamePlugin = require('gulp-rename');
const minifyCssPlugin = require('gulp-clean-css');

var copyCssTask = function (callback) {
    src('./css/*.css')
        .pipe(dest('./dist/css'));

    callback();
}

var copyJsTask = function (callback) {
    src('./lib/*.js')
        .pipe(dest('./dist/js'));

    callback();
}

var minifyCssTask = function (callback) {
    src('./css/*.css')
        .pipe(sassPlugin())
        .pipe(minifyCssPlugin())
        .pipe(renamePlugin(function (path) {
            path.basename += '.min';
        }))
        .pipe(dest('./dist/css'));

    callback();
}

var minifyJsTask = function (callback) {
    src('./lib/*.js')
        .pipe(uglifyPlugin())
        .pipe(renamePlugin(function (path) {
            path.basename += '.min';
        }))
        .pipe(dest('./dist/js'));

    callback();
}

var defaultTask = function (callback) {
    copyCssTask(callback);
    copyJsTask(callback);
    minifyCssTask(callback);
    minifyJsTask(callback);

    callback();
}

exports.copyCss = copyCssTask;
exports.copyJs = copyJsTask;
exports.minifyCss = minifyCssTask;
exports.minifyJs = minifyJsTask;
exports.default = defaultTask;