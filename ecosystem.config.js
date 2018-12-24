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
      user: 'emily-bot',
      host: '35.200.86.93',
      ref: 'origin/master',
      repo: 'git@github.com:popkirby/emily-bot-test.git',
      path: '/home/emily-bot/deploy',
      'post-deploy':
        'yarn install && pm2 reload ecosystem.config.js --env production'
    }
  }
}
