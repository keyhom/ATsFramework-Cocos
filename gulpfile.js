const gulp = require('gulp');
const gulp_clean = require('gulp-clean');
const ts = require('gulp-typescript');
const through = require('through2');

const _entries = [];
const _buildDir = 'build';
const _distDir = 'dist';
const _srcDir = 'src';
const _pluginDir = 'plugins';

const tsProject = ts.createProject('tsconfig.json');

function resolveSources() {
    return gulp.src(`${_srcDir}/**/*.ts`).pipe(through.obj(function(file, enc, callback) {
        this.push(file);
        callback();
    })).on('data', function(data) {
        _entries.push(data);
    });
}

function clean() {
    return gulp.src([_distDir, _buildDir], { read: false, allowEmpty: true }).pipe(gulp_clean());
}

function copyAssets() {
    return gulp.src([`${_srcDir}/**/*.ts`, `${_pluginDir}/**/*.js`, `${_pluginDir}/**/*.meta`]).pipe(gulp.dest(_distDir));
}

function typescriptToJs() {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('build'));
}

exports.build = gulp.series(
    clean,
    resolveSources,
    gulp.parallel(
        // copyAssets,
        typescriptToJs
    )
);
