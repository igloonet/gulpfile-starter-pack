import gulp from 'gulp';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import chalk from 'chalk';
import notifier from 'node-notifier';
import plumber from 'gulp-plumber';
import precss from 'precss';
import postcssInlineSvg from 'postcss-inline-svg';
import postcssMixins from 'postcss-mixins';
import notify from 'gulp-notify';
import nano from 'gulp-cssnano';
import lec from 'gulp-line-ending-corrector';
import postcssCalc from 'postcss-calc';
import postcssHexrgba from 'postcss-hexrgba';
import postcssColorFunction from 'postcss-color-function';
import postcssCssNext from 'postcss-cssnext';
import { default as postcssSprites } from 'postcss-sprites';
import babel from 'gulp-babel';
import rimraf from 'rimraf';
import run from 'run-sequence';
import webpack from 'webpack';
import webpackConfig from './webpack.config.babel';
import gutil from 'gulp-util';
import watch from 'gulp-watch';

const paths = {
  watch: {
    css: './src/css/**/*.css',
    js: './src/js/**/*.js'
  },
  compile: {
    css: './src/css/*.css'
  },
  destination: {
    css: './css',
    js: './js',
    images: './images/sprites'
  }
};

gulp.task('default', cb => {
  run('build:css', 'build:js', 'watch', cb);
});

gulp.task('build:css', cb => {
  run('clean:css', 'compile:styles', cb);
});

gulp.task('build:js', cb => {
  run('clean:js', 'babel', 'webpack', cb);
});

gulp.task('clean:css', cb => {
  rimraf(paths.destination.css, cb);
});

gulp.task('clean:js', cb => {
  rimraf(paths.destination.js, cb);
});

gulp.task('babel', () => {
  return gulp.src(paths.watch.js)
    .pipe(plumber({errorHandler: swallowError}))
    .pipe(babel())
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.destination.js));
});

gulp.task('webpack', cb => {
  let config = Object.create(webpackConfig);

  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }

    gutil.log('[webpack]', stats.toString({
      colors: true,
      progress: true
    }));

    sendNotify(`Gulp DONE (${getNotifyTime()})`, 'build:js');

    cb();
  });
});

gulp.task('compile:styles', () => {
  let processors = [
    precss,
    postcssMixins,
    postcssCalc({selectors:true}),
    postcssHexrgba,
    postcssColorFunction,
    postcssSprites({
      stylesheetPath: paths.destination.css,
      spritePath: paths.destination.images,
      groupBy(image) {
        if (image.url.indexOf('svg-icons') !== -1) {
          return Promise.resolve('svg-icons');
        }

        return Promise.reject();
      }
    }),
    postcssCssNext,
    postcssInlineSvg
  ];

  gulp.src(paths.compile.css)
    .pipe(plumber({errorHandler: swallowError}))
    .pipe(sourcemaps.init())
    .pipe(nano())
    .pipe(postcss(processors))
    .pipe(plumber.stop())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.destination.css))
    .pipe(notify({title: `Gulp DONE (${getNotifyTime()})`, message: 'compile:styles', onLast: true}))
    .pipe(lec({eolc: 'LF', encoding: 'utf8'}));
});

gulp.task('watch', () => {
  watch(paths.watch.css, () => {
    gulp.start('build:css');
  });

  watch(paths.watch.js, () => {
    gulp.start('build:js');
  });
});

let swallowError = error => {
  gutil.log(error.message);
  notify.onError(`Error: ${error.message}`);
  sendNotify('Gulp ERROR:', chalk.stripColor(error.message));
}

let sendNotify = (title, message) => {
  notifier.notify({ title, message });
}

let getNotifyTime = () => {
  var d = new Date;

  return [d.getHours(), d.getUTCMinutes() < 10 ? ('0' + d.getUTCMinutes()) : d.getUTCMinutes(), d.getUTCSeconds() < 10 ? ('0' + d.getUTCSeconds()) : d.getUTCSeconds()].join(':');
}
