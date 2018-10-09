import gulp from 'gulp';
import mocha from 'gulp-mocha';
const mochaGlobals = ['stub', 'spy', 'expect', 'Mn'];

function _mocha(setupFile) {
	return gulp.src(
		[setupFile,'test/unit/**/*.js'],
		{read: false}
	)
		.pipe(mocha({
			reporter: 'dot',
			globals: mochaGlobals,
			ignoreLeaks: false,
			require: 'babel-register'
		}));
}


function test() {
	process.env.NODE_ENV = 'test';
	require("babel-register")({
		ignore: /node_modules\/(?!bbmn)/
	});	
	return _mocha('test/setup.js');
}

gulp.task('test', test);
