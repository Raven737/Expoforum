import browsersync from 'browser-sync';   // Перезавантажує сторінку.
import del from 'del';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';   // Додає автопрефікси.
import fileinclude from 'gulp-file-include';   // Збирає в один файл.
import group_media from 'gulp-group-css-media-queries';   // Групує і вставляє медіа запити в кінець файлу.
import rename from 'gulp-rename';   // Переіменовує файл: додає до імя + "... те що вкажемо в ф-ії ...".
import scss from 'gulp-sass';   // scss -> css.
import uglify from 'gulp-uglify';   // Оптимізує (стискає) файл.

const project_folder = "dist"; // Production folder.
const source_folder = "#src";  // Source folder.

const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    images: project_folder + "/images/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    images: source_folder + "/images/**/*", // {jpg, png, svg, gif, ico, webp}
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    images: source_folder + "/images/**/*.*", // {jpg, png, svg, gif, ico, webp}
    fonts: source_folder + "/fonts/*.ttf",
  }
};

export const deleteDist = () => {       // Видаляє папку dist.
  return del(project_folder);
};

export const html = () => {						  // HTML з папки SRC -> в папку dist -> перезавантаження сторінки.
  return gulp.src(path.src.html)		 	  // Обирає файл html (#src/.html, а файли _*.html НЕ обирає).
    .pipe(fileinclude())			 	        // Збирає в один файл.
    .pipe(gulp.dest(path.build.html))   // Вивантаження файлу html в папку dist/.
    .pipe(browsersync.stream())	        // Перезавантажує сторінку.
};

export const css = () => {							// SCSS -> CSS -> в dist/css -> перезавантаження сторінки.
  return gulp.src(path.src.css)			    // Обираємо файл style.scss (#src/scss/style.scss).
    .pipe(scss({ outputStyle: "expanded" })) // scss -> css.
    .pipe(group_media())                // Групує і вставляє медіа запити в кінець файлу.
    .pipe(autoprefixer({                // Додає автопрефікси.
      overrideBrowserslist: ["last 5 versions"],
      cascade: true
    }))
    .pipe(gulp.dest(path.build.css))		// Вивантаження файлу css в папку dist/css --> (1 файл: css"expanded").
    .pipe(scss({ outputStyle: "compressed" })) // Стискає файл.
    .pipe(rename({ extname: ".min.css" }))  // Переіменовує файл: додає до імя + ".min.css".
    .pipe(gulp.dest(path.build.css))		// Вивантаження файлу css в папку dist/css --> (2 файл: name.min.css "compressed").
    .pipe(browsersync.stream())		      // Перезавантажує сторінку.
};

export const js = () => {								// JS з папки SRC -> в папку dist -> перезавантаження сторінки.
  return gulp.src(path.src.js)					// Обираємо файл script.js. (#src/js/script.js).
    .pipe(fileinclude())					      // Збирає в один файл.
    .pipe(gulp.dest(path.build.js))		  // Вивантаження файлу js в папку dist/js. (1-й файл).
    .pipe(uglify())                     // Оптимізує (стискає) файл.
    .pipe(rename({ extname: ".min.js" })) // Переіменовує файл: додає до імя + ".min.js".
    .pipe(gulp.dest(path.build.js))		  // Вивантаження файлу js в папку dist/js. (2-й файл .min).
    .pipe(browsersync.stream())		      // Перезавантажує сторінку.
};

export const images = () => {
  return gulp.src(path.src.images)      // Обираємо файл #src/images/**/*.{jpg, png, svg, gif, ico, webp}.
    .pipe(gulp.dest(path.build.images))	// Вивантаження в папку dist/images.
    .pipe(browsersync.stream())		      // Перезавантажує сторінку.
};

export const fonts = () => {
  return gulp.src(path.src.fonts)       // Обираємо файл #src/fonts/*.ttf".
    .pipe(gulp.dest(path.build.fonts))  // Вивантаження в папку dist/fonts.
    .pipe(browsersync.stream())         // Перезавантажує сторінку.
};

export const watchFiles = () => {
  gulp.watch([path.watch.html], build, html);	// "Слідкує" за html (#src/**/*.html), якщо є зміни - спрацьовує функція html().
  gulp.watch([path.watch.css], build, css);		// "Слідкує" за css (#src/scss/**/*.scss), якщо є зміни - спрацьовує функція css().
  gulp.watch([path.watch.js], build, js);			// "Слідкує" за js (#src/js/**/*.js), якщо є зміни - спрацьовує функція js().
  gulp.watch([path.watch.images], build, images);	// "Слідкує" за images (#src/images/**/*.{jpg, png, svg, gif, ico, webp}), якщо є зміни - спрацьовує функція images().
  gulp.watch([path.watch.fonts], build, fonts);   // "Слідкує" за fonts (#src/fonts/*.ttf"), якщо є зміни - спрацьовує функція fonts().
};

export const sync = () => {             // Синхронізація.  
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
};

const build = gulp.series(deleteDist, gulp.parallel(html, css, js, images, fonts));	// Видаляє папку dist, а потім одночасно виконує функції html(), css(), js(), images() та fonts().
// const watching = gulp.parallel(build, watchFiles, sync);
// export default gulp.parallel(build, watchFiles, sync);

export default gulp.series(build, gulp.parallel(watchFiles, sync));