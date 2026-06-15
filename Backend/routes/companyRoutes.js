const express = require('express');
const router = express.Router();

const companyController = require('../controllers/companyController');
const authController = require('../controllers/authController');
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Authentication gateway routing endpoints
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);

const upload = require('../middleware/uploadMiddleware');

// Setup system structures endpoints 
router.post('/superadmin/setup', superAdminController.createRootAdmin);
router.post('/company/register', companyController.registerCompanyWorkspace);
router.post('/upload', authMiddleware, upload.single('logo'), companyController.uploadLogo);

// Company workspace administration routes
router.get('/companies', authMiddleware, restrictTo('SUPER_ADMIN'), companyController.getAllCompanies);
router.get('/company/:id', authMiddleware, companyController.getCompanyById);
router.get('/company/:id/details', authMiddleware, companyController.getCompanyDetails);
router.put('/company/:id', authMiddleware, companyController.updateCompanyDetails);
router.delete('/company/:id', authMiddleware, restrictTo('SUPER_ADMIN'), companyController.deleteCompanyDetails);

// Company admin member provisioning routes
router.post('/companies/:companyId/admins', authMiddleware, companyController.createCompanyAdmin);
router.get('/companies/:companyId/admins', authMiddleware, companyController.getCompanyAdmins);
router.get('/company-admins', authMiddleware, restrictTo('SUPER_ADMIN'), companyController.getAllCompanyAdmins);
router.put('/company-admins/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_USER'), companyController.updateCompanyAdmin);
router.delete('/company-admins/:id', authMiddleware, restrictTo('SUPER_ADMIN', 'COMPANY_USER'), companyController.deleteCompanyAdmin);

module.exports = router;
