const express = require('express');
const router = express.Router();

const employeeRegisterController = require('../controllers/employeeRegisterController');
const employeeDashboardController = require('../controllers/employeeDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/documentUploadMiddleware');

// Public route for employee registration
router.post('/register', employeeRegisterController.registerEmployee);

// Protected routes (require valid JWT session)
router.use(authMiddleware);

// Profile Management routes
router.get('/profile', employeeDashboardController.getProfile);
router.put('/profile', employeeDashboardController.updateProfile);
router.post('/upload-resume', upload.single('resume'), employeeDashboardController.uploadResume);
router.post('/upload-avatar', upload.single('avatar'), employeeDashboardController.uploadAvatar);

// Job workflows routes
router.get('/jobs', employeeDashboardController.searchJobs);
router.post('/jobs/:jobId/apply', employeeDashboardController.applyForJob);
router.post('/jobs/:jobId/save', employeeDashboardController.toggleSaveJob);
router.get('/saved-jobs', employeeDashboardController.getSavedJobs);
router.get('/applied-jobs', employeeDashboardController.getAppliedJobs);

// Notifications routes
router.get('/notifications', employeeDashboardController.getNotifications);
router.put('/notifications/:id/read', employeeDashboardController.markNotificationAsRead);
router.put('/notifications/read-all', employeeDashboardController.markAllNotificationsAsRead);

// Security & Account deletion settings routes
router.put('/settings', employeeDashboardController.updateSettings);
router.delete('/account', employeeDashboardController.deleteAccount);

module.exports = router;
