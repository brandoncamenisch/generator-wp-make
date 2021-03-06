'use strict';
var util = require( 'util' );
var path = require( 'path' );
var yeoman = require( 'yeoman-generator' );
var chalk = require( 'chalk' );
var async = require( 'async' );


var ThemeGenerator = yeoman.generators.Base.extend({
	init: function () {
		this.log( chalk.magenta( 'Thanks for generating with WP Make!' ));

		this.on( 'end', function () {
			var i, length, installs = [],
				chalks = { skipped:[], run:[] },
				installers = ['npm', 'bower', 'composer'];

			this.log( chalk.green.bold( 'Your theme has been generated.' ));

			for ( i = 0, length = installers.length; i < length; i++ ) {
				if ( this.options['skip-install'] || this.options[ 'skip-' + installers[ i ] ] ) {
					chalks.skipped.push( chalk.yellow.bold( installers[ i ] + ' install' ));
				} else {
					chalks.run.push( chalk.yellow.bold( installers[ i ] + ' install' ));
					installs.push( _install( installers[ i ],this ));
				}
			}
			
			if ( 0 < chalks.skipped.length ) {
				this.log( 'Skipping ' + chalks.skipped.join( ', ' ) + '. Just run yourself when you are ready.' );
			}
			if ( 0 < installs.length ) {
				this.log( 'Running ' + chalks.run.join( ', ' ) + ' for you. If this fails try running yourself.' );
				async.parallel( installs );
			}
		});
	},

	options: function () {
		var done = this.async();
		this.basename = path.basename( this.env.cwd );

		var prompts = [
			{
				name:    'projectTitle',
				message: 'Theme name',
				default: 'WP Theme'
			},
			{
				name:    'funcPrefix',
				message: 'PHP function prefix ( lowercase letters and underscores only )',
				default: 'wptheme'
			},
			{
				name:    'description',
				message: 'Description',
				default: 'The best WordPress theme ever made!'
			},
			{
				name:    'projectHome',
				message: 'Theme homepage',
				default: 'http://wordpress.org/themes'
			},
			{
				name:    'authorName',
				message: 'Author name',
				default: this.user.git.name
			},
			{
				name:    'authorEmail',
				message: 'Author email',
				default: this.user.git.email
			},
			{
				name:    'authorUrl',
				message: 'Author URL'
			}
		];
		// gather initial settings
		this.prompt( prompts, function ( props ) {
			this.opts = props;
			this.fileSlug = this.opts.projectTitle.toLowerCase().replace( /[\s]/g, '-' ).replace( /[^a-z-_]/g, '' );
			this.namespace = this.opts.projectTitle.replace( /[\s|-]/g, '_' ).replace( /( ^|_ )( [a-z] )/g, function( match, group1, group2 ){
				return group1 + group2.toUpperCase();
			});
			done();
		}.bind( this ));
	},

	autoprefixer: function() {

		// See if we want to use it on it's own, but only if not using Sass.
		var done = this.async();
		this.prompt( [{
			type:    'confirm',
			name:    'autoprefixer',
			message: 'Use Autoprefixer?',
			default: true
		}],
		function( props ){
			this.opts.autoprefixer = props.autoprefixer;
			done();
		}.bind( this ));
	},

	theme: function() {
		this.template( 'theme/_style.css', 'style.css' );
		this.template( 'theme/_index.php', 'index.php' );
		this.template( 'theme/_header.php', 'header.php' );
		this.template( 'theme/_footer.php', 'footer.php' );
		this.template( 'theme/_functions.php', 'functions.php' );
		this.template( '../../shared/theme/_core.php', 'includes/functions/core.php' );
		this.template( '../../shared/theme/_humans.txt', 'humans.txt' );
		this.copy( 'theme/screenshot.png', 'screenshot.png' );
	},

	i18n: function() {
		this.template( '../../shared/i18n/_language.pot', 'languages/' + this.opts.funcPrefix + '.pot' );
	},

	assets: function() {
		//JS
		this.template( '../../shared/js/_script.js', 'assets/js/src/' + this.fileSlug + '.js' );
		//SCSS
		//Global
		this.template( 'css/_global.css', 'assets/css/scss/global/global.scss' );
		//Base
		this.template( 'css/_reset.css', 'assets/css/scss/base/reset.scss' );
		this.template( 'css/_typography.css', 'assets/css/scss/base/typography.scss' );
		this.template( 'css/_icons.css', 'assets/css/scss/base/icons.scss' );
		this.template( 'css/_wordpress.css', 'assets/css/scss/base/wordpress.scss' );
		//Components
		this.template( 'css/_buttons.css', 'assets/css/scss/components/buttons.scss' );
		this.template( 'css/_callouts.css', 'assets/css/scss/components/callouts.scss' );
		this.template( 'css/_toggles.css', 'assets/css/scss/components/toggles.scss' );
		//Layout
		this.template( 'css/_header.css', 'assets/css/scss/layout/header.scss' );
		this.template( 'css/_footer.css', 'assets/css/scss/layout/footer.scss' );
		this.template( 'css/_sidebar.css', 'assets/css/scss/layout/sidebar.scss' );
		//Templates
		this.template( 'css/_home-page.css', 'assets/css/scss/templates/home-page.scss' );
		this.template( 'css/_single.css', 'assets/css/scss/templates/single.scss' );
		this.template( 'css/_archives.css', 'assets/css/scss/templates/archives.scss' );
		this.template( 'css/_blog.css', 'assets/css/scss/templates/blog.scss' );
		//Admin
		this.template( 'css/_admin.css', 'assets/css/scss/admin/admin.scss' );
		//Editor
		this.template( 'css/_editor.css', 'assets/css/scss/templates/editor.scss' );
		//General
		this.template( 'css/_project.css', 'assets/css/scss/' + this.fileSlug + '.scss' );
		this.template( 'css/_editor-style.css', 'assets/css/scss/' + this.fileSlug + '-editor-style.scss' );
		this.template( 'css/_project-admin.css', 'assets/css/scss/' + this.fileSlug + '-admin.scss' );
	},

	bin: function() {
		this.template( 'bin/_class-wp-cli-utils.php', 'bin/class-wp-cli-utils.php' );
	},

	tests: function() {
		//phpunit
		this.template( '../../shared/tests/phpunit/_Core_Tests.php', 'tests/php/phpunit/Core_Tests.php' );
		this.template( '../../shared/tests/phpunit/_TestCase.php', 'tests/php/phpunit/test-tools/TestCase.php' );
		this.template( '../../shared/tests/phpunit/_bootstrap.php', 'bootstrap.php.dist' );
		this.copy( '../../shared/tests/phpunit/phpunit.xml.dist', 'phpunit.xml.dist' );
		//qunit
		this.template( '../../shared/tests/qunit/_test.html', 'tests/js/qunit/' + this.fileSlug + '.html' );
		this.copy( '../../shared/tests/qunit/test.js', 'tests/js/qunit/tests/' + this.fileSlug + '.js' );
	},

	grunt: function() {
		this.template( 'grunt/_package.json', 'package.json' );
		this.template( 'grunt/_Gruntfile.js', 'Gruntfile.js' );
		this.copy( '../../shared/grunt/_jshintrc', '.jshintrc' );
	},

	bower: function() {
		this.template( '../../shared/bower/_bower.json', 'bower.json' );
		this.copy( '../../shared/bower/bowerrc', '.bowerrc' );
	},

	composer: function() {
		this.template( 'composer/_composer.json', 'composer.json' );
	},

	git: function() {
		this.copy( '../../shared/git/gitignore', '.gitignore' );
	}
});

function _install( command, context ) {
	return function install( cb ) {
		context.emit( command + 'Install' );
		context.spawnCommand( command, ['install'] )
		.on( 'error', cb )
		.on( 'exit', context.emit.bind( context, command + 'Install:end' ))
		.on( 'exit', function ( err ) {
			if ( err === 127 ) {
				this.log.error( 'Could not find Composer' );
			}
			cb( err );
		}.bind( context ));
	}
}

module.exports = ThemeGenerator;
