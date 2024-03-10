const express = require('express');

const customerRoutes = require('./customer');

const router = express.Router();

// Mount customer routes under /customer endpoint
router.use('/customer', customerRoutes);

module.exports = router;