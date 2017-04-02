var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var babel = require("gulp-babel");
var minify = require('gulp-minify');
var imagemin = require('gulp-imagemin');

gulp.task("js", function () {
  return gulp.src("src/js/main.js")
    .pipe(babel())
    .pipe(gulp.dest("dist/themes/clement/js"))
    .pipe(minify({
      ext:{
        src:'.js',
        min:'.min.js'
      }
    }))
    .pipe(gulp.dest('dist/themes/clement/js'));
});

gulp.task('sass', function () {
  return gulp.src('src/css/sass/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/themes/clement/css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/themes/clement/css'));
});

gulp.task('img', function() {
  gulp.src('src/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/themes/clement/images'))
});

gulp.task('watch', function () {
  gulp.watch('src/css/sass/**/*.scss', ['sass']);
  gulp.watch('src/js/**/*.js', ['js']);
});
