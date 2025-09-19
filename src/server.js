import express from "express";
import dotenv from "dotenv";

import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
import commentsRouter from "./routes/comments.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);
app.use("/comments", commentsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
