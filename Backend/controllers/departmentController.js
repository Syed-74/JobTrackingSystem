const departmentService = require('../services/departmentService');
const catchAsync = require('../utils/catchAsync');

// Create Department
exports.createDepartment = catchAsync(async (req, res, next) => {
    const data = {
        ...req.body,
        created_by: req.user.id
    };
    const department = await departmentService.createDepartment(data);
    return res.status(201).json({
        success: true,
        message: 'Department created successfully.',
        data: department
    });
});

// Update Department
exports.updateDepartment = catchAsync(async (req, res, next) => {
    const data = {
        ...req.body,
        updated_by: req.user.id
    };
    const department = await departmentService.updateDepartment(req.params.id, data);
    return res.status(200).json({
        success: true,
        message: 'Department updated successfully.',
        data: department
    });
});

// Delete Department
exports.deleteDepartment = catchAsync(async (req, res, next) => {
    const department = await departmentService.deleteDepartment(req.params.id);
    return res.status(200).json({
        success: true,
        message: 'Department deleted successfully.',
        data: department
    });
});

// Get Department by ID
exports.getDepartment = catchAsync(async (req, res, next) => {
    const department = await departmentService.getDepartmentById(req.params.id);
    return res.status(200).json({
        success: true,
        data: department
    });
});

// Get All Departments
exports.getAllDepartments = catchAsync(async (req, res, next) => {
    const { company_id } = req.query;
    const departments = await departmentService.getAllDepartments(company_id);
    return res.status(200).json({
        success: true,
        data: departments
    });
});
