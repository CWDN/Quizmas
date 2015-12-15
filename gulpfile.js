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

function createJS (srcFiles, dest) {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(concat(dest))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/js/'));
}

gulp.task('js:admin', function () {
  return createJS(['assets/js/*.js', 'assets/js/admin/*.js'], 'admin.js');
});

gulp.task('js:presenter', function () {
  return createJS(['assets/js/*.js', 'assets/js/presenter/*.js'], 'presenter.js');
});

gulp.task('js:player', function () {
  return createJS(['assets/js/*.js', 'assets/js/player/*.js'], 'player.js');
});

gulp.task('js', ['js:admin', 'js:presenter', 'js:player']);

gulp.task('watch', function () {
  gulp.watch(['assets/less/*'], ['less']);
  gulp.watch(['assets/js/*', 'assets/js/admin/*'], ['js:admin']);
  gulp.watch(['assets/js/*', 'assets/js/presenter/*'], ['js:presenter']);
  gulp.watch(['assets/js/*', 'assets/js/player/*'], ['js:player']);
});
