const gulp = require('gulp'),
browserSync = require('browser-sync').create();

function sync(done){
    browserSync.init({
        server: {
            baseDir: './'
        },
        port: 3000
    });
    done();
}

function browserReload(done){
    browserSync.reload();
    done();
}

function watchFiles(){
    gulp.watch('app/css/*.css', browserReload);
    gulp.watch('./**/*.html', browserReload);
    gulp.watch('app/js/*.js', browserReload);
}
gulp.task('default', gulp.parallel(sync, watchFiles));