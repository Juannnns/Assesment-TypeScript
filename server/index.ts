import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { initDatabase } from "./config/database";
import { startCronJobs } from "./services/cronService";
import path from "path";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// Extend Express Request interface to include session
declare module "express-serve-static-core" {
  interface Request {
    session?: {
      user?: {
        username: string;
        role: string;
      };
      [key: string]: any;
    };
  }
}

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL, 
    }),
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, 
    },
  })
);

const defaultAccounts = [
  {
    username: "client_user",
    password: "client_password", 
    role: "client",
  },
  {
    username: "agent_user",
    password: "agent_password", 
    role: "agent",
  },
];


app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const account = defaultAccounts.find(
    (acc) => acc.username === username && acc.password === password
  );

  if (!account) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  if (req.session) {
    req.session.user = { username: account.username, role: account.role };
  }


  if (account.role === "client") {
    return res.json({ message: "Inicio de sesión exitoso", redirect: "/ClientDashboard" });
  } else if (account.role === "agent") {
    return res.json({ message: "Inicio de sesión exitoso", redirect: "/AgentDashboard" });
  }
});

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "No estás autenticado" });
  }
  next();
}

app.get("/session", (req, res) => {
  if (req.session?.user) {
    return res.json({ user: req.session.user });
  }
  res.status(401).json({ message: "No estás autenticado" });
});

function authorizeRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user?.role !== role) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  };
}

app.get("/client-view", authorizeRole("client"), (req, res) => {
  res.sendFile(path.join(__dirname, "client-view.html"));
});

app.get("/agent-view", authorizeRole("agent"), (req, res) => {
  res.sendFile(path.join(__dirname, "agent-view.html"));
});


app.get("/ClientDashboard", isAuthenticated, authorizeRole("client"), (req, res) => {
  res.sendFile(path.join(__dirname, "../client/src/pages/ClientDashboard.html"));
});


app.get("/AgentDashboard", isAuthenticated, authorizeRole("agent"), (req, res) => {
  res.sendFile(path.join(__dirname, "../client/src/pages/AgentDashboard.html"));
});

(async () => {
  // Initialize database connection
  await initDatabase();
  
  // Start cron jobs for ticket reminders
  startCronJobs();

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
