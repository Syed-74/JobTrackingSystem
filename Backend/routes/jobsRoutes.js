const express = require('express');
const router = express.Router();
const employeeDashboardController = require('../controllers/employeeDashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Secure all routes under /api/jobs with authentication
router.use(authMiddleware);

// Endpoint definitions
router.get('/', employeeDashboardController.searchJobs);
router.get('/:jobId', employeeDashboardController.getJobDetails);
router.post('/:jobId/apply', employeeDashboardController.applyForJob);

module.exports = router;
