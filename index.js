const { DBSQLClient } = require('@databricks/sql');

const client = new DBSQLClient();
const utils = DBSQLClient.utils;

const host = 'e2-dogfood.staging.cloud.databricks.com';
const path = '/sql/1.0/endpoints/3e7395eb91be0770';
const token = 'dapi**********';

client
  .connect({ host, path, token })
  .then(async (client) => {
    try {
      const session = await client.openSession();

      // Execute long-running query
      console.log('Running query...');
      const operation = await session.executeStatement(
        'SELECT * FROM RANGE(100)',
        {runAsync: true},
      );
      await utils.waitUntilReady(operation, false, () => {
      });

      console.log('Fetching data...');
      await utils.fetchAll(operation);
      await operation.close();

      const results = utils.getResult(operation).getValue();
      console.log(results);

      await operation.close();
      await session.close();
    } catch(e) {
      console.log(`Error: ${e.message}`);
      console.log(e.stack);
    }
  })
  .catch((error) => {
    console.log(error);
  });
