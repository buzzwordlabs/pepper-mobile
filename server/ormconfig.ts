module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['database/entities/**/*.js'],
  migrations: ['database/migrations/**/*.js'],
  subscribers: ['database/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'database/entities',
    migrationsDir: 'database/migrations',
    subscribersDir: 'database/subscribers'
  }
};
