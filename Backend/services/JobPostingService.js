const db = require('../config/db');

const DEFAULT_JOB_STATUS = 'OPEN';

function mapRowToCamelCase(row) {
    if (!row) return null;
    return {
        jobId: row.job_id,
        companyId: row.company_id,
        departmentId: row.department_id,
        jobTitle: row.job_title,
        jobDescription: row.job_description,
        jobRequirements: row.job_requirements,
        jobResponsibilities: row.job_responsibilities,
        jobType: row.job_type,
        workMode: row.work_mode,
        location: row.location,
        salaryMin: row.salary_min,
        salaryMax: row.salary_max,
        salaryCurrency: row.salary_currency,
        experienceMin: row.experience_min,
        experienceMax: row.experience_max,
        education: row.education,
        skills: row.skills,
        openings: row.openings,
        employmentLevel: row.employment_level,
        assignedRecruiter: row.assigned_recruiter,
        applicationDeadline: row.application_deadline,
        expectedJoiningDate: row.expected_joining_date,
        status: row.status,
        isFeatured: row.is_featured,
        totalApplications: row.total_applications,
        viewsCount: row.views_count,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

async function createJobPosting(jobData) {
    const companyId = jobData.companyId || null;
    const departmentId = jobData.departmentId || null;
    const jobTitle = jobData.jobTitle || null;
    const jobDescription = jobData.jobDescription || null;
    const jobRequirements = jobData.jobRequirements || null;
    const jobResponsibilities = jobData.jobResponsibilities || null;
    const jobType = jobData.jobType || null;
    const workMode = jobData.workMode || null;
    const location = jobData.location || null;
    const salaryMin = jobData.salaryMin !== undefined ? jobData.salaryMin : null;
    const salaryMax = jobData.salaryMax !== undefined ? jobData.salaryMax : null;
    const salaryCurrency = jobData.salaryCurrency || 'INR';
    const experienceMin = jobData.experienceMin !== undefined ? jobData.experienceMin : null;
    const experienceMax = jobData.experienceMax !== undefined ? jobData.experienceMax : null;
    const education = jobData.education || null;
    const skills = jobData.skills || null;
    const openings = jobData.openings !== undefined ? jobData.openings : 1;
    const employmentLevel = jobData.employmentLevel || null;
    const assignedRecruiter = jobData.assignedRecruiter || null;
    const applicationDeadline = jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : null;
    const expectedJoiningDate = jobData.expectedJoiningDate ? new Date(jobData.expectedJoiningDate) : null;
    const status = jobData.status || DEFAULT_JOB_STATUS;
    const isFeatured = jobData.isFeatured !== undefined ? jobData.isFeatured : false;
    const totalApplications = jobData.totalApplications !== undefined ? jobData.totalApplications : 0;
    const viewsCount = jobData.viewsCount !== undefined ? jobData.viewsCount : 0;
    const createdBy = jobData.createdBy || null;
    const updatedBy = jobData.updatedBy || null;

    const result = await db.query(
        `INSERT INTO job_posting (
            company_id, department_id, job_title, job_description, job_requirements, job_responsibilities, 
            job_type, work_mode, location, salary_min, salary_max, salary_currency, experience_min, experience_max, 
            education, skills, openings, employment_level, assigned_recruiter, application_deadline, expected_joining_date, 
            status, is_featured, total_applications, views_count, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) RETURNING *`,
        [
            companyId, departmentId, jobTitle, jobDescription, jobRequirements, jobResponsibilities,
            jobType, workMode, location, salaryMin, salaryMax, salaryCurrency, experienceMin, experienceMax,
            education, skills, openings, employmentLevel, assignedRecruiter, applicationDeadline, expectedJoiningDate,
            status, isFeatured, totalApplications, viewsCount, createdBy, updatedBy
        ]
    );
    return mapRowToCamelCase(result.rows[0]);
}

async function updateJobPosting(jobId, updateData) {
    const allowedFields = {
        companyId: 'company_id',
        departmentId: 'department_id',
        jobTitle: 'job_title',
        jobDescription: 'job_description',
        jobRequirements: 'job_requirements',
        jobResponsibilities: 'job_responsibilities',
        jobType: 'job_type',
        workMode: 'work_mode',
        location: 'location',
        salaryMin: 'salary_min',
        salaryMax: 'salary_max',
        salaryCurrency: 'salary_currency',
        experienceMin: 'experience_min',
        experienceMax: 'experience_max',
        education: 'education',
        skills: 'skills',
        openings: 'openings',
        employmentLevel: 'employment_level',
        assignedRecruiter: 'assigned_recruiter',
        applicationDeadline: 'application_deadline',
        expectedJoiningDate: 'expected_joining_date',
        status: 'status',
        isFeatured: 'is_featured',
        totalApplications: 'total_applications',
        viewsCount: 'views_count',
        createdBy: 'created_by',
        updatedBy: 'updated_by'
    };

    const updateFields = [];
    const updateValues = [];
    let index = 1;

    for (const key in updateData) {
        if (allowedFields[key] !== undefined) {
            updateFields.push(`${allowedFields[key]} = $${index}`);
            let val = updateData[key];
            if (val === '' || (typeof val === 'string' && val.trim() === '')) {
                val = null;
            }
            if ((key === 'applicationDeadline' || key === 'expectedJoiningDate') && val) {
                updateValues.push(new Date(val));
            } else {
                updateValues.push(val);
            }
            index++;
        }
    }

    if (updateFields.length === 0) {
        return await getJobPostingById(jobId);
    }

    updateValues.push(jobId);
    const query = `
        UPDATE job_posting 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE job_id = $${index} 
        RETURNING *
    `;
    const result = await db.query(query, updateValues);
    return mapRowToCamelCase(result.rows[0]);
}

async function deleteJobPosting(jobId) {
    const result = await db.query(
        `DELETE FROM job_posting WHERE job_id = $1 RETURNING *`,
        [jobId]
    );
    return mapRowToCamelCase(result.rows[0]);
}

async function getJobPostingById(jobId) {
    const result = await db.query(
        `SELECT * FROM job_posting WHERE job_id = $1`,
        [jobId]
    );
    return mapRowToCamelCase(result.rows[0]);
}

async function getAllJobPostings() {
    const result = await db.query(
        `SELECT * FROM job_posting ORDER BY created_at DESC`
    );
    return result.rows.map(mapRowToCamelCase);
}

async function toggleFeaturedJob(jobId) {
    const job = await getJobPostingById(jobId);
    if (!job) {
        throw new Error('Job posting not found');
    }
    const result = await db.query(
        `UPDATE job_posting SET is_featured = $1 WHERE job_id = $2 RETURNING *`,
        [!job.isFeatured, jobId]
    );
    return mapRowToCamelCase(result.rows[0]);
}

async function countJobPostings() {
    const result = await db.query(`
        SELECT 
            COUNT(*)::INT as "total",
            COUNT(CASE WHEN status = 'OPEN' THEN 1 END)::INT as "open",
            COUNT(CASE WHEN status = 'CLOSED' THEN 1 END)::INT as "closed",
            COUNT(CASE WHEN status = 'DRAFT' THEN 1 END)::INT as "draft",
            COUNT(CASE WHEN status = 'ON_HOLD' THEN 1 END)::INT as "onHold",
            COUNT(CASE WHEN is_featured = true THEN 1 END)::INT as "featured"
        FROM job_posting
    `);
    return result.rows[0];
}

module.exports = {
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    getJobPostingById,
    getAllJobPostings,
    toggleFeaturedJob,
    countJobPostings
};