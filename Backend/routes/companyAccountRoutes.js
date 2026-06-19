const express = require('express');
const router = express.Router();
const companyAccountController = require('../controllers/companyAccountController');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Provisioning and list routes
router.post('/company-account-manage', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager'), companyAccountController.createAccount);
router.get('/company-account-manage', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager'), companyAccountController.getCompanyAccounts);

// Individual CRUD operations
router.get('/company-account-manage/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager'), companyAccountController.getAccount);
router.put('/company-account-manage/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager'), companyAccountController.updateAccount);
router.delete('/company-account-manage/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR Manager'), companyAccountController.deleteAccount);

module.exports = router;
