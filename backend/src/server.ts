import { app } from './app';
import { ready } from './db';

await ready;
app.listen(3000, () => console.log('API on http://localhost:3000'));
