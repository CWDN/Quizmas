var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var prefix = require('gulp-autoprefixer');
var gutil = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', ['less', 'js']);

gulp.task('less', function () {
  return gulp.src(['assets/less/app.less'])
    .pipe(sourcemaps.init())
    .pipe(less({compress: true}).on('error', gutil.log))
    .pipe(prefix('last 1 version', 'ie 8'))
    .pipe(minifyCSS({keepBreaks: false}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css/'));
});

gulp.task('js', function () {
  return gulp.src('assets/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/js/'));
});

gulp.task('watch', function () {
  gulp.watch(['assets/less/*'], ['less']);
  gulp.watch(['assets/js/*'], ['js']);
});
