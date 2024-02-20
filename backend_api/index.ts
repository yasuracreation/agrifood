import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import _routes from "./core/routes/index";
//For env File 
dotenv.config();


const app: Application = express();
const port = process.env.PORT || 8000;

app.use(
    cors({
        credentials: true,
    })
);

app.use("/api/", _routes);
app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
