module.exports = {
  apps: [
    {
      name: "ngoding-backend",
      cwd: "./backend",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "ngoding-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run preview -- --host 0.0.0.0",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
