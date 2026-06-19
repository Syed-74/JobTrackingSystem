const companyAccountService = require('../services/companyAccountService');
const catchAsync = require('../utils/catchAsync');

// Create a new company staff account
exports.createAccount = catchAsync(async (req, res, next) => {
    const { 
        company_id,
        email, 
        password, 
        fullName, 
        contactPhone, 
        alternatePhone, 
        gender, 
        dateOfBirth, 
        departmentId, 
        designation, 
        bio, 
        address, 
        role 
    } = req.body;

    const companyId = company_id || req.params.companyId;

    if (!companyId || !email || !password || !fullName || !contactPhone || !role) {
        return res.status(400).json({
            success: false,
            message: 'company_id, email, password, fullName, contactPhone, and role are required fields.'
        });
    }

    const payload = {
        email,
        password,
        fullName,
        contactPhone,
        alternatePhone,
        gender,
        dateOfBirth,
        departmentId,
        designation,
        bio,
        address,
        role,
        createdBy: req.user.id
    };

    const account = await companyAccountService.createAccount(companyId, payload);
    return res.status(201).json({
        success: true,
        message: 'Company staff account provisioned successfully.',
        data: account
    });
});

// Update company staff account details
exports.updateAccount = catchAsync(async (req, res, next) => {
    const result = await companyAccountService.updateAccount(req.params.id, req.body);
    return res.status(200).json({
        success: true,
        message: result.message
    });
});

// Delete/deactivate company staff account
exports.deleteAccount = catchAsync(async (req, res, next) => {
    const result = await companyAccountService.deleteAccount(req.params.id);
    return res.status(200).json({
        success: true,
        message: result.message
    });
});

// Get detailed account metadata by ID
exports.getAccount = catchAsync(async (req, res, next) => {
    const account = await companyAccountService.getAccountById(req.params.id);
    if (!account) {
        return res.status(404).json({
            success: false,
            message: 'Company account record not found.'
        });
    }
    return res.status(200).json({
        success: true,
        data: account
    });
});

// Get all staff accounts for a company
exports.getCompanyAccounts = catchAsync(async (req, res, next) => {
    const companyId = req.query.company_id || req.params.companyId;
    if (!companyId) {
        return res.status(400).json({
            success: false,
            message: 'company_id is required.'
        });
    }
    const accounts = await companyAccountService.getCompanyAccounts(companyId);
    return res.status(200).json({
        success: true,
        data: accounts
    });
});
