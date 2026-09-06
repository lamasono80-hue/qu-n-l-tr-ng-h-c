import { createApp } from './app';
import { config } from './config/env';

const app = createApp();

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` UniConnect RESTful API Server running on port ${config.port}`);
  console.log(` Environment: ${config.env}`);
  console.log(` Base URL: http://localhost:${config.port}/api/v1`);
  console.log(` Healthcheck: http://localhost:${config.port}/api/health`);
  console.log(`=======================================================`);
});
