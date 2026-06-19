const { createJobPosting, updateJobPosting, deleteJobPosting, getJobPosting, getAllJobPostings, toggleFeaturedJob, countJobPostings } = require('../controllers/JobPostingController');
const express = require('express');
const router = express.Router();

router.get('/count', countJobPostings);
router.get('/', getAllJobPostings);
router.get('/:id', getJobPosting);
router.post('/', createJobPosting);
router.put('/:id/featured', toggleFeaturedJob);
router.put('/:id', updateJobPosting);
router.delete('/:id', deleteJobPosting);

module.exports = router;