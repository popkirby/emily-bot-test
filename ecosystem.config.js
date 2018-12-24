module.exports = {
  apps: [
    {
      name: 'Emily twitter bot',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  deploy: {
    production: {
      user: process.env.USER_NAME,
      host: process.env.HOST_NAME,
      ref: 'origin/master',
      repo: 'https://github.com/popkirby/emily-bot-test',
      ssh_options: ['StrictHostKeyChecking=no', 'PasswordAuthentication=no'],
      path: '/home/emily-bot/deploy',
      'post-deploy':
        'yarn install && pm2 reload ecosystem.config.js --env production'
    }
  }
}
