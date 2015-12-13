var migrate = require('migrate');
var set = migrate.load('migrations/.migrate', 'migrations');
var args = process.argv.slice(2, 4);
var migrateOption = '';

if (typeof args[0] !== 'undefined') {
  migrateOption = args[0];
  if (migrateOption === 'down') {
    down();
  } else if (migrateOption === 'refresh') {
    down(up);
  } else {
    up();
  }
} else {
  up();
}

function up () {
  set.up(function (err) {
    if (err) throw err;

    console.log('Migration completed');
    seed();
  });
}

function down (callback) {
  set.down(function (err) {
    if (err) throw err;

    console.log('Migrations rolled back');

    if (callback !== undefined) {
      callback();
    }
  });
}

function seed () {
  if (typeof args[1] !== 'undefined' &&
    args[1] === 'seed'
  ) {
    require(__dirname + '/database/seeders/QuestionSeeder');
  }
}
