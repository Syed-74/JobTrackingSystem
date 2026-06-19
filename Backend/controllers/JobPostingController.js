const JobPostingService = require('../services/JobPostingService');
const catchAsync = require('../utils/catchAsync');

exports.createJobPosting = catchAsync(async (req, res, next) => {
    const jobPosting = await JobPostingService.createJobPosting(req.body);
    return res.status(201).json({
        success: true,
        data: jobPosting
    });
});

exports.updateJobPosting = catchAsync(async (req, res, next) => {
    const jobPosting = await JobPostingService.updateJobPosting(req.params.id, req.body);
    return res.status(200).json({
        success: true,
        data: jobPosting
    });
});

exports.deleteJobPosting = catchAsync(async (req, res, next) => {
    const jobPosting = await JobPostingService.deleteJobPosting(req.params.id);
    return res.status(200).json({
        success: true,
        data: jobPosting
    });
});

exports.getJobPosting = catchAsync(async (req, res, next) => {
    const jobPosting = await JobPostingService.getJobPostingById(req.params.id);
    return res.status(200).json({
        success: true,
        data: jobPosting
    });
});

exports.getAllJobPostings = catchAsync(async (req, res, next) => {
    const jobPostings = await JobPostingService.getAllJobPostings();
    return res.status(200).json({
        success: true,
        data: jobPostings
    });
});

exports.toggleFeaturedJob = catchAsync(async (req, res, next) => {
    const result = await JobPostingService.toggleFeaturedJob(req.params.id);

    if (!result) {
        return res.status(404).json({
            success: false,
            message: 'Job posting not found'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Job featured status toggled successfully',
        data: result
    });
});

exports.countJobPostings = catchAsync(async (req, res, next) => {
    const counts = await JobPostingService.countJobPostings();

    return res.status(200).json({
        success: true,
        data: counts
    });
});
