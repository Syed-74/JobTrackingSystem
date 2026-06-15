const superAdminService = require('../services/superAdminService');
const catchAsync = require('../utils/catchAsync');

exports.createRootAdmin = catchAsync(async (req, res, next) => {
    const { email, password, adminDetails } = req.body;

    if (!email || !password || !adminDetails) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email, password, and adminDetails keys.'
        });
    }

    const requiredDetails = ['name', 'phone', 'address', 'state', 'city', 'pincode', 'gender', 'dob'];
    for (const detail of requiredDetails) {
        if (adminDetails[detail] === undefined) {
            return res.status(400).json({
                success: false,
                message: `Please provide adminDetails.${detail} key.`
            });
        }
    }

    const result = await superAdminService.provisionSuperAdmin({ email, password, adminDetails });

    return res.status(201).json({
        success: true,
        message: 'Root system application supervisor deployed successfully.',
        data: result
    });
});


