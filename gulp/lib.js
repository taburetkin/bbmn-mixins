import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import rollup from 'gulp-rollup';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import size from 'gulp-size';

let babelConfig = {
	presets: [['env', { modules: false }]],
	babelrc: false,
	plugins: ['external-helpers']
};

let rollupGlobals = {
	'backbone': 'Backbone',
	'backbone.marionette': 'Mn',
	'jquery': '$',
	'underscore': '_',
	'bbmn-core': 'bbmn',
	'bbmn-utils': 'bbmn.utils',
};

let testExternals = ['jquery','backbone', 'backbone.marionette', 'underscore', 'bbmn-core', 'bbmn-utils'];

let getRollupConfig = (format, babelcfg = babelConfig) => {

	return {
		allowRealFiles: true,
		plugins: [
			resolve({
				module: true,
			}),
			babel(babelcfg)
		],
		external: ['jquery', 'backbone', 'backbone.marionette', 'underscore', "bbmn-core", "bbmn-utils"],
		output: {
			format,
			name: 'bbmn.mixins',
			'globals': rollupGlobals
		},
		input:'src/index.js'
	}
};

function lib(format) {
	let rollupConfig = getRollupConfig(format);
	gulp.src('src/index.js')
		.pipe(sourcemaps.init())
		// note that UMD and IIFE format requires `name` but it will be inferred from the source file name `mylibrary.js`
		.pipe(rollup(rollupConfig))
		// save sourcemap as separate file (in the same folder)
		.pipe(size({ title: format, showFiles: true}))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('lib/' + format));
}

export function rollupForTest(name)
{
	let rollupConfig = getRollupConfig(name);
	rollupConfig.external = testExternals;
	gulp.src('src/index.js')
		.pipe(sourcemaps.init())
		// note that UMD and IIFE format requires `name` but it will be inferred from the source file name `mylibrary.js`
		.pipe(rollup(rollupConfig))
		// save sourcemap as separate file (in the same folder)
		.pipe(sourcemaps.write(''))
		.pipe(size())
		.pipe(gulp.dest('test/lib'));

}


gulp.task('lib-iife', () => lib('iife'));
gulp.task('lib-umd', ['lib-iife'], () => lib('umd'));
gulp.task('lib', ['lib-umd'], () => lib('es'));
gulp.task('lib-test', ['lib-iife'], function(){
	gulp.src('lib/iife/**/*')
	.pipe(gulp.dest('../bbmn-test/js/mixins'));
});
gulp.task('watch', function(){
	gulp.watch('src/**/*', ['lib-test']);
});
