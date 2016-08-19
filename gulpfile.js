var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

gulp.task('sass', function () {
  return gulp.src('css/sass/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('css'));
});


gulp.task('default', function () {
  gulp.watch('css/sass/**/*.scss', ['sass']);
});