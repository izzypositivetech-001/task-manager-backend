app.use(
  cors({
    origin: [
        "http://localhost:5173", // local frontend
        "https://task-manager-client-virid.vercel.app/", // your deployed frontend
      ],
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
