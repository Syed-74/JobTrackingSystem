const companyService = require('../services/companyService');
const catchAsync = require('../utils/catchAsync');

exports.registerCompanyWorkspace = catchAsync(async (req, res, next) => {
    const { email, password, companyData } = req.body;

    if (!email || !password || !companyData) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email, password, and companyData keys.'
        });
    }

    const requiredCompanyData = [
        'companyName', 'companyDescription', 'companyAddress', 
        'companyState', 'companyCity', 'companyPincode', 
        'companyWebsite', 'industryType', 'companySize', 
        'companyEmail', 'companyPhone'
    ];
    
    for (const field of requiredCompanyData) {
        if (companyData[field] === undefined) {
            return res.status(400).json({
                success: false,
                message: `Please provide companyData.${field} key.`
            });
        }
    }

    const registrationResult = await companyService.registerNewCompanyProfile({
        email,
        password,
        companyData
    });

    return res.status(201).json({
        success: true,
        message: 'Corporate accounts and administration maps configured successfully.',
        data: registrationResult
    });
});

exports.uploadLogo = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded or invalid file format.'
        });
    }

    // Save and return the relative logo path
    const logoUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
        success: true,
        message: 'Logo uploaded successfully.',
        logoUrl
    });
});

exports.getCompanyDetails = catchAsync(async (req, res, next) => {
    const company = await companyService.getCompanyDetails(req.params.id);
    return res.status(200).json({
        success: true,
        data: company
    });
});

exports.updateCompanyDetails = catchAsync(async (req, res, next) => {
    const updatedCompany = await companyService.updateCompanyDetails(req.params.id, req.body);
    return res.status(200).json({
        success: true,
        data: updatedCompany
    });
});

exports.deleteCompanyDetails = catchAsync(async (req, res, next) => {
    const deletedCompany = await companyService.deleteCompanyDetails(req.params.id);
    return res.status(200).json({
        success: true,
        data: deletedCompany
    });
});

exports.getAllCompanies = catchAsync(async (req, res, next) => {
    const companies = await companyService.getAllCompanies();
    return res.status(200).json({
        success: true,
        data: companies
    });
});

exports.getCompanyById = catchAsync(async (req, res, next) => {
    const company = await companyService.getCompanyById(req.params.id);
    return res.status(200).json({
        success: true,
        data: company
    });
});

exports.createCompanyAdmin = catchAsync(async (req, res, next) => {
    const { email, password, adminData } = req.body;
    const { companyId } = req.params;

    if (!email || !password || !adminData) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email, password, and adminData keys.'
        });
    }

    const requiredAdminData = ['adminName', 'adminPhone'];
    for (const field of requiredAdminData) {
        if (!adminData[field]) {
            return res.status(400).json({
                success: false,
                message: `Please provide adminData.${field} key.`
            });
        }
    }

    const createdBy = req.user?.id;

    const result = await companyService.createCompanyAdmin(companyId, {
        email,
        password,
        adminData,
        createdBy
    });

    return res.status(201).json({
        success: true,
        message: 'Company administrator credential block provisioned successfully.',
        data: result
    });
});

exports.getCompanyAdmins = catchAsync(async (req, res, next) => {
    const { companyId } = req.params;
    const admins = await companyService.getCompanyAdmins(companyId);
    return res.status(200).json({
        success: true,
        data: admins
    });
});

exports.getAllCompanyAdmins = catchAsync(async (req, res, next) => {
    const admins = await companyService.getAllCompanyAdmins();
    return res.status(200).json({
        success: true,
        data: admins
    });
});

exports.updateCompanyAdmin = catchAsync(async (req, res, next) => {
    const result = await companyService.updateCompanyAdmin(req.params.id, req.body);
    return res.status(200).json({
        success: true,
        message: result.message
    });
});

exports.deleteCompanyAdmin = catchAsync(async (req, res, next) => {
    const result = await companyService.deleteCompanyAdmin(req.params.id);
    return res.status(200).json({
        success: true,
        message: result.message
    });
});