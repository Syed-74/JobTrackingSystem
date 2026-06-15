const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password keys.' });
    }

    const sessionPayload = await authService.authenticateUser(email, password);

    return res.status(200).json({
        success: true,
        message: 'Login session verified successfully.',
        data: sessionPayload
    });
});

exports.getMe = catchAsync(async (req, res, next) => {
    const userPayload = await authService.getUserProfile(req.user.id, req.user.user_type);
    
    return res.status(200).json({
        success: true,
        message: 'Active session user profile retrieved successfully.',
        data: { user: userPayload }
    });
});
