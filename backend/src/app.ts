import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from "./routes/index"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});