const { src, dest, parallel, series, watch } = require("gulp");
const browsersync = require("browser-sync").create();
const concat = require("gulp-concat");
const fileinclude = require("gulp-file-include");
const sourcemaps = require("gulp-sourcemaps");
const htmlmin = require("gulp-htmlmin");
const scss = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");
// const svgSprite = require("gulp-svg-sprite");
const del = require("del");

const entry = "./src";
const output = "./dist";

const path = {
  src: {
    html: entry + "/index.html",
    scss: entry + "/scss/style.scss",
    js: entry + "/js/index.js",
    image: entry + "/assets/images/**/*.{png,jpg,jpeg,gif,ico}",
    fonts: entry + "/assets/fonts/*.ttf",
  },
  build: {
    html: output + "/",
    css: output + "/css/",
    js: output + "/js/",
    image: output + "/assets/images/",
    fonts: output + "/assets/fonts/",
  },
};

const clear = () => {
  return del(output);
};

const html = () => {
  return src(path.src.html)
    .pipe(
      fileinclude({
        prefix: "@@",
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
};
const style = () => {
  return src(path.src.scss)
    .pipe(sourcemaps.init())
    .pipe(scss())
    .pipe(autoprefixer())
    .pipe(concat("style.min.css"))
    .pipe(csso())
    .pipe(sourcemaps.write("."))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
};

const script = () => {
  return src(path.src.js)
    .pipe(sourcemaps.init())
    .pipe(concat("build.min.js"))
    .pipe(babel({ presets: ["@babel/env"] }))
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
};

const image = () => {
  return src(path.src.image)
    .pipe(
      imagemin({
        progressive: true,
        interlaced: true,
        optimizationLevel: 7,
      })
    )
    .pipe(dest(path.build.image));
};
// const svg = () => {
//   return src(path.src.image + "svg/*.svg")
//     .pipe(
//       svgSprite({
//         shape: {
//           dimension: {
//             maxWidth: 500,
//             maxHeight: 500,
//           },
//           spacing: {
//             padding: 0,
//           },
//           transform: [
//             {
//               svgo: {
//                 plugins: [
//                   { removeViewBox: false },
//                   { removeUnusedNS: false },
//                   { removeUselessStrokeAndFill: true },
//                   { cleanupIDs: false },
//                   { removeComments: true },
//                   { removeEmptyAttrs: true },
//                   { removeEmptyText: true },
//                   { collapseGroups: true },
//                   { removeAttrs: { attrs: "(fill|stroke|style)" } },
//                 ],
//               },
//             },
//           ],
//         },
//         mode: {
//           symbol: {
//             dest: ".",
//             sprite: "sprite.svg",
//           },
//         },
//       })
//     )
//     .pipe(dest(path.build.image + "svg/"));
// };
const server = () => {
  browsersync.init({
    server: { baseDir: output },
    notify: false,
    port: 8080,
  });
};

const fileWatch = () => {
  watch("src/**/*.html", html);
  watch("src/**/*.scss", style);
  watch("src/**/*.js", script);
};

exports.html = html;
exports.style = style;
exports.script = script;
exports.image = image;
// exports.svg = svg;
exports.server = server;
exports.default = series(
  clear,
  parallel(style, image, html, script, server, fileWatch)
);
