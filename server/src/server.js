import app from "./app.js";

const PORT =
  Number(
    process.env.PORT
  ) || 5000;

const HOST =
  "0.0.0.0";

app.listen(
  PORT,
  HOST,
  () => {
    console.log(
      `TEMPEST LEADS API running on port ${PORT}`
    );
  }
);