module.exports = {
  apps: [
    {
      name: 'shop-api',
      script: './server.js',
      instances: 4,
      exec_mode: 'cluster',
      env: {
        NODE_CLUSTER_SCHED_POLICY: 'rr'
      }
    }
  ]
};
