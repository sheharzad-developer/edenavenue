// PM2 Ecosystem Configuration for Production
// Run with: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'eden-avenue',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/path/to/eden-avenue', // Update this path
      instances: 2, // Number of instances (use 'max' for all CPU cores)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto-restart settings
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Health check
      health_check_grace_period: 3000,
    },
  ],
}
