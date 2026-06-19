const employeeRegisterServices = require('../services/employeeRegisterServices');
const catchAsync = require('../utils/catchAsync');

exports.registerEmployee = catchAsync(async (req, res, next) => {
    const {
        email,
        password,
        employeeCode,
        firstName,
        lastName,
        phone,
        profilePicture,
        gender,
        dob,
        maritalStatus,
        address,
        city,
        state,
        country,
        pincode,
        emergencyContactName,
        emergencyContactNumber
    } = req.body;

    if (!email || !password || !firstName || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required keys: email, password, firstName, and phone.'
        });
    }

    const result = await employeeRegisterServices.registerEmployee({
        email,
        password,
        employeeCode,
        firstName,
        lastName,
        phone,
        profilePicture,
        gender,
        dob,
        maritalStatus,
        address,
        city,
        state,
        country,
        pincode,
        emergencyContactName,
        emergencyContactNumber
    });

    return res.status(201).json({
        success: true,
        message: 'Employee registered and profile configured successfully.',
        data: result
    });
});