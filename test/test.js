var babel = require("babel-core");
var expect = require('expect.js');
var process = require('process');

var createPluginsWithConfigDir = function(configDir) {
  return ['babel-plugin-transform-es2015-modules-commonjs', ['../../../',
  {
    replacedModuleName: 'babel-dotenv',
    configDir: configDir,
  }]];
}

describe('myself in some tests', function() {
  it('should throw if variable not exist', function() {
    expect(function(){
      babel.transformFileSync('test/fixtures/variable-not-exist/source.js')
    }).to.throwException(function (e) {
      expect(e.message).to.contain("Try to import dotenv variable \"foo\" which is not defined in any .env files.");
    });
  });

  it('should throw if default is imported', function() {
    expect(function(){
      babel.transformFileSync('test/fixtures/default-imported/source.js')
    }).to.throwException(function (e) {
      expect(e.message).to.contain("Import dotenv as default is not supported.");
    });
  });

  it('should load default env from .env', function () {
    var result = babel.transformFileSync('test/fixtures/default/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');')
  })

  it('should load default env from .env with expand variables', function () {
    var result = babel.transformFileSync('test/fixtures/expand-variables/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');\nconsole.log(\'abc123:username\');')
  })

  it('should load let .env.development overwrite .env', function(){
    var result = babel.transformFileSync('test/fixtures/dev-env/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'userdonthavename\');')
  })

  it('should load custom env file "build.env" and its overwrites', function(){
    var result = babel.transformFileSync('test/fixtures/filename/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123456\');\nconsole.log(\'userdonthavename123456\');')
  })

  it('should load let .env.production overwrite .env', function(){
    process.env['BABEL_ENV'] = 'production';
    var result = babel.transformFileSync('test/fixtures/prod-env/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'foobar\');')
    process.env['BABEL_ENV'] = undefined;
  })

  it('should support `as alias` import syntax', function(){
    var result = babel.transformFileSync('test/fixtures/as-alias/source.js')
    expect(result.code).to.be('\'use strict\';\n\nvar a = \'abc123\';\nvar b = \'username\';')
  })

  it('should do nothing if no `replacedModuleName` provided', function(){
    var result = babel.transformFileSync('test/fixtures/replaced-module-name-not-provided/source.js')
    expect(result.code).to.be('\'use strict\';\n\nvar _fancyDotenv = require(\'fancy-dotenv\');\n\nvar _fancyDotenv2 = _interopRequireDefault(_fancyDotenv);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }')
  })

  it('should load a specific env file according to ENV_FILE', function(){
    process.env['ENV_FILE'] = '.anyname';
    var result = babel.transformFileSync('test/fixtures/filename-from-env_file/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');')
    process.env['ENV_FILE'] = undefined;
  })

  it('should load let .env.beta overwrite .env', function(){
    process.env['ENV_FILE'] = '.env.beta';
    var result = babel.transformFileSync('test/fixtures/beta-env/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'foobar\');')
    process.env['ENV_FILE'] = undefined;
  })
});
