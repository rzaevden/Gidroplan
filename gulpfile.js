'use strict';

const { src, dest, series, parallel, watch } = require('gulp');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const groupMediaQueries = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-cleancss');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const replace = require('gulp-replace');
const del = require('del');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();

const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const imagemin = require('gulp-imagemin');

const paths =  {
  src: './src/',              // paths.src
  build: './build/'           // paths.build
};

function styles() {
  return src(paths.src + 'scss/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass()) // { outputStyle: 'compressed' }
    .pipe(groupMediaQueries())
    .pipe(postcss([
      autoprefixer({overrideBrowserslist: ['last 2 version']}),
    ]))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write('/'))
    .pipe(dest(paths.build + 'css/'));
}

function svgSprite() {
  return src(paths.src + 'svg/*.svg')
    .pipe(svgmin(function (file) {
      return {
        plugins: [{
          cleanupIDs: {
            minify: true
          }
        }]
      }
    }))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite-svg.svg'))
    .pipe(dest(paths.build + 'img/'));
}

function scripts() {
  return src(paths.src + 'js/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(dest(paths.build + 'js/'))
}

function scriptsVendors() {
  return src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/slick-carousel/slick/slick.min.js',
      'node_modules/svg4everybody/dist/svg4everybody.min.js'
    ])
    .pipe(concat('vendors.min.js'))
    .pipe(dest(paths.build + 'js/'))
}

function htmls() {
  return src(paths.src + '*.html')
    .pipe(plumber())
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(dest(paths.build));
}

function images() {
  return src(paths.src + 'img/*.{jpg,jpeg,png,gif,svg}')
    //.pipe(imagemin()) // если картинок будет много, то и времени будет уходить много
    .pipe(dest(paths.build + 'img/'));
}

function cssCopy() {
  return src(paths.src + 'css/*.css')
    //.pipe(imagemin()) // если картинок будет много, то и времени будет уходить много
    .pipe(dest(paths.build + 'css/'));
}

function clean() {
  return del('build/')
}

function watcher() {
  watch(paths.src + 'scss/', styles);
  watch(paths.src + 'css/', cssCopy);
  watch(paths.src + 'js/*.js', scripts);
  watch(paths.src + '*.html', htmls);
  watch(paths.src + 'img/', images);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: paths.build
    }
  });
  browserSync.watch(paths.build + '**/*.*', browserSync.reload);
}

exports.styles = styles;
exports.cssCopy = cssCopy;
exports.scripts = scripts;
exports.scriptsVendors = scriptsVendors;
exports.htmls = htmls;
exports.images = images;
exports.svgSprite = svgSprite;
exports.clean = clean;
exports.watcher = watcher;

exports.build = series(
  clean,
  parallel(styles, svgSprite, scripts, scriptsVendors, htmls, images, cssCopy)
);

exports.default = series(
  clean,
  parallel(styles, svgSprite, scripts, scriptsVendors, htmls, images, cssCopy),
  parallel(watcher, serve),
);
