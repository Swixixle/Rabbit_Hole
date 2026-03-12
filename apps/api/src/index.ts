import { createApp } from './app';

const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Rabbit Hole API listening on port ${PORT}`);
});
