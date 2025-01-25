import { config } from 'dotenv-safe';
config({
   path: './.env',
   example: './.env.example',
});
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
