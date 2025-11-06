import express from "express";
import dotenv from "dotenv";

import { setupSwagger } from "./swagger.js"; 
import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
import commentsRouter from "./routes/comments.js";
import authRouter from "./routes/auth.js"

dotenv.config();
const app = express();

app.use(express.json());

setupSwagger(app);
app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);
app.use("/comments", commentsRouter);
app.use("/auth", authRouter)


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;