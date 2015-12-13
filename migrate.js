var migrate = require('migrate');
var set = migrate.load('migrations/.migrate', 'migrations');
var args = process.argv.slice(2, 3);
if (typeof args[0] !== 'undefined') {
  var migrateOption = args[0];
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
