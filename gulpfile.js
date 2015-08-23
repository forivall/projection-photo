const gulp = require('gulp');
const babel = require('gulp-babel');
const stylus = require('gulp-stylus');

const paths = {
  'node-js': ['src/**/*.js', '!src/{creator,presenter}/**/*.js'],
  'system-js': ['src/{creator,presenter}/**/*.js', '!**/jspm_packages/**'],
  'copy-jspm': ['src/**/jspm_packages/**'],
  css: 'src/**/*.styl',
  'css-copy': 'src/**/*.css',
  html: 'src/**/*.html'
};

gulp.task('build-node-js', function() {
  return gulp
  .src(paths['node-js'])
  .pipe(babel())
  .pipe(gulp.dest('lib'));
});

gulp.task('build-system-js', function() {
  return gulp
  .src(paths['system-js'])
  .pipe(babel({modules: 'system'}))
  .pipe(gulp.dest('lib'));
});

gulp.task('build-css', function() {
  return gulp
  .src(paths.css)
  .pipe(stylus())
  .pipe(gulp.dest('lib'));
});

gulp.task('build-css-copy', function() {
  return gulp
  .src(paths['css-copy'])
  .pipe(gulp.dest('lib'));
});

gulp.task('build-copy-jspm', function() {
  return gulp
  .src(paths['copy-jspm'])
  .pipe(gulp.dest('lib'));
});

gulp.task('build-html', function() {
  return gulp
  .src(paths.html)
  .pipe(gulp.dest('lib'));
});

gulp.task('build', ['build-node-js', 'build-system-js', 'build-copy-jspm', 'build-css', 'build-css-copy', 'build-html'])
gulp.task('watch', function() {
  gulp.watch(paths['node-js'], ['build-node-js']);
  gulp.watch(paths['system-js'], ['build-system-js']);
  gulp.watch(paths.css, ['build-css']);
  gulp.watch(paths['css-copy'], ['build-css-copy']);
  gulp.watch(paths['copy-jspm'], ['build-copy-jspm']);
  gulp.watch(paths.html, ['build-html']);
});
