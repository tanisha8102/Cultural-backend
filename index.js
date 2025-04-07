// index.js
import app from "./api/server.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});
