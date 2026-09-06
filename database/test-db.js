const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'uniconnect_db',
  user: 'postgres',
  password: 'postgres'
});

client.connect()
  .then(() => client.query('SELECT current_user, current_database()'))
  .then(result => {
    console.log(result.rows[0]);
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
