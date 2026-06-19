const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Department management routes
router.post('/departments', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager', 'Project Manager'), departmentController.createDepartment);
router.get('/departments', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager', 'Project Manager', 'Recruiter', 'Hiring Manager', 'Technical Manager'), departmentController.getAllDepartments);
router.get('/departments/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager', 'Project Manager', 'Recruiter', 'Hiring Manager', 'Technical Manager'), departmentController.getDepartment);
router.put('/departments/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager', 'Project Manager'), departmentController.updateDepartment);
router.delete('/departments/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager', 'Project Manager'), departmentController.deleteDepartment);

module.exports = router;