const db = require('../config/db');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');

// 1. Get Employee Profile
exports.getProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const profileQuery = `
        SELECT u.id AS "userId", u.email, u.user_type AS "userType",
               ed.id AS "employeeId", ed.first_name AS "firstName", ed.last_name AS "lastName",
               ed.phone, ed.profile_picture AS "profilePicture", ed.gender, ed.dob, 
               ed.marital_status AS "maritalStatus", ed.address, ed.city, ed.state, 
               ed.country, ed.pincode, ed.emergency_contact_name AS "emergencyContactName", 
               ed.emergency_contact_number AS "emergencyContactNumber", ed.skills,
               ed.education, ed.experience, ed.social_links AS "socialLinks", ed.resume_url AS "resumeUrl"
        FROM users u
        LEFT JOIN employee_details ed ON ed.user_id = u.id
        WHERE u.id = $1;
    `;
    const result = await db.query(profileQuery, [userId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    return res.status(200).json({
        success: true,
        data: result.rows[0]
    });
});

// 2. Update Employee Profile
exports.updateProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const {
        firstName,
        lastName,
        phone,
        gender,
        dob,
        maritalStatus,
        address,
        city,
        state,
        country,
        pincode,
        emergencyContactName,
        emergencyContactNumber,
        skills,
        education,
        experience,
        socialLinks
    } = req.body;

    // Verify employee_details record exists
    const checkQuery = 'SELECT id FROM employee_details WHERE user_id = $1;';
    const checkRes = await db.query(checkQuery, [userId]);

    if (checkRes.rows.length === 0) {
        // Create one if it doesn't exist
        const insertQuery = `
            INSERT INTO employee_details (
                user_id, first_name, last_name, email, phone, gender, dob, marital_status,
                address, city, state, country, pincode, emergency_contact_name, emergency_contact_number,
                skills, education, experience, social_links
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *;
        `;
        const emailResult = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
        const email = emailResult.rows[0]?.email || '';
        
        await db.query(insertQuery, [
            userId, firstName || 'Candidate', lastName || '', email, phone || '', gender || null, 
            dob ? new Date(dob) : null, maritalStatus || null, address || null, city || null, state || null, 
            country || null, pincode || null, emergencyContactName || null, emergencyContactNumber || null,
            skills || null, JSON.stringify(education || []), JSON.stringify(experience || []), JSON.stringify(socialLinks || {})
        ]);
    } else {
        // Update existing profile details
        const updateQuery = `
            UPDATE employee_details
            SET first_name = COALESCE($1, first_name),
                last_name = $2,
                phone = COALESCE($3, phone),
                gender = $4,
                dob = $5,
                marital_status = $6,
                address = $7,
                city = $8,
                state = $9,
                country = $10,
                pincode = $11,
                emergency_contact_name = $12,
                emergency_contact_number = $13,
                skills = $14,
                education = $15,
                experience = $16,
                social_links = $17,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $18
            RETURNING *;
        `;
        await db.query(updateQuery, [
            firstName,
            lastName || null,
            phone,
            gender || null,
            dob ? new Date(dob) : null,
            maritalStatus || null,
            address || null,
            city || null,
            state || null,
            country || null,
            pincode || null,
            emergencyContactName || null,
            emergencyContactNumber || null,
            skills || null,
            JSON.stringify(education || []),
            JSON.stringify(experience || []),
            JSON.stringify(socialLinks || {}),
            userId
        ]);
    }

    return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.'
    });
});

// 3. Upload Resume Document
exports.uploadResume = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }

    const resumePath = `/uploads/${req.file.filename}`;
    
    // Update employee_details
    await db.query(
        'UPDATE employee_details SET resume_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2;',
        [resumePath, userId]
    );

    return res.status(200).json({
        success: true,
        message: 'Resume uploaded successfully.',
        data: { resumeUrl: resumePath }
    });
});

// 4. Upload Avatar Image
exports.uploadAvatar = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    
    // Update employee_details
    await db.query(
        'UPDATE employee_details SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2;',
        [avatarPath, userId]
    );

    return res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully.',
        data: { profilePicture: avatarPath }
    });
});

// 5. Search Jobs with Advanced Filters
exports.searchJobs = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { 
        keyword, 
        location, 
        experienceLevels, 
        jobTypes, 
        workModes, 
        salaryMin, 
        salaryMax, 
        departmentId, 
        industry, 
        postedDate, 
        sortBy 
    } = req.query;

    // Fetch user skills for best match calculation
    const profileRes = await db.query('SELECT skills FROM employee_details WHERE user_id = $1;', [userId]);
    const userSkillsStr = profileRes.rows[0]?.skills || '';
    const userSkills = userSkillsStr.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');

    const queryParams = [];
    let paramIndex = 1;

    queryParams.push(userId, userId);
    let userIdParamIndex1 = 1;
    let userIdParamIndex2 = 2;
    paramIndex = 3;

    // Construct best match score select SQL
    let matchScoreSql = '0';
    if (userSkills.length > 0) {
        const scoreParts = userSkills.map(skill => {
            queryParams.push(`%${skill}%`);
            return `(CASE WHEN jp.skills ILIKE $${paramIndex++} THEN 1 ELSE 0 END)`;
        });
        matchScoreSql = scoreParts.join(' + ');
    }

    let sql = `
        SELECT jp.job_id AS "id", jp.job_title AS "title", jp.job_description AS "description",
               jp.job_requirements AS "requirements", jp.job_type AS "type", jp.work_mode AS "workMode",
               jp.location, jp.salary_min AS "salaryMin", jp.salary_max AS "salaryMax",
               jp.salary_currency AS "salaryCurrency", jp.experience_min AS "experienceMin",
               jp.experience_max AS "experienceMax", jp.skills, jp.created_at AS "createdAt",
               jp.employment_level AS "employmentLevel", jp.total_applications AS "totalApplications",
               c.company_name AS "companyName", c.company_logo AS "companyLogo", c.company_description AS "companyDescription",
               d.department_name AS "departmentName", c.industry_type AS "industryType",
               (sj.id IS NOT NULL) AS "isSaved",
               (ja.id IS NOT NULL) AS "isApplied",
               ja.status AS "applicationStatus",
               (${matchScoreSql}) AS "matchScore"
        FROM job_posting jp
        LEFT JOIN company c ON jp.company_id = c.id
        LEFT JOIN department d ON jp.department_id = d.id
        LEFT JOIN saved_jobs sj ON sj.job_id = jp.job_id AND sj.user_id = $1
        LEFT JOIN job_applications ja ON ja.job_id = jp.job_id AND ja.user_id = $2
        WHERE jp.status = 'OPEN'
    `;

    // Filters
    if (keyword) {
        sql += ` AND (jp.job_title ILIKE $${paramIndex} OR jp.skills ILIKE $${paramIndex} OR jp.job_description ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`;
        queryParams.push(`%${keyword}%`);
        paramIndex++;
    }

    if (location) {
        sql += ` AND (jp.location ILIKE $${paramIndex} OR c.company_city ILIKE $${paramIndex} OR c.company_state ILIKE $${paramIndex})`;
        queryParams.push(`%${location}%`);
        paramIndex++;
    }

    if (experienceLevels) {
        const levels = experienceLevels.split(',').map(s => s.trim()).filter(s => s !== '');
        if (levels.length > 0) {
            const placeholders = levels.map(level => {
                queryParams.push(level);
                return `$${paramIndex++}`;
            });
            sql += ` AND jp.employment_level IN (${placeholders.join(', ')})`;
        }
    }

    if (jobTypes) {
        const types = jobTypes.split(',').map(s => s.trim()).filter(s => s !== '');
        if (types.length > 0) {
            const placeholders = types.map(type => {
                queryParams.push(type);
                return `$${paramIndex++}`;
            });
            sql += ` AND jp.job_type IN (${placeholders.join(', ')})`;
        }
    }

    if (workModes) {
        const modes = workModes.split(',').map(s => s.trim()).filter(s => s !== '');
        if (modes.length > 0) {
            const placeholders = modes.map(mode => {
                queryParams.push(mode);
                return `$${paramIndex++}`;
            });
            sql += ` AND jp.work_mode IN (${placeholders.join(', ')})`;
        }
    }

    if (salaryMin) {
        sql += ` AND COALESCE(jp.salary_max, jp.salary_min, 0) >= $${paramIndex}`;
        queryParams.push(parseFloat(salaryMin));
        paramIndex++;
    }

    if (salaryMax) {
        sql += ` AND COALESCE(jp.salary_min, jp.salary_max, 0) <= $${paramIndex}`;
        queryParams.push(parseFloat(salaryMax));
        paramIndex++;
    }

    if (departmentId) {
        sql += ` AND jp.department_id = $${paramIndex}`;
        queryParams.push(departmentId);
        paramIndex++;
    }

    if (industry) {
        sql += ` AND c.industry_type ILIKE $${paramIndex}`;
        queryParams.push(`%${industry}%`);
        paramIndex++;
    }

    if (postedDate) {
        if (postedDate === '24h') {
            sql += ` AND jp.created_at >= NOW() - INTERVAL '1 day'`;
        } else if (postedDate === '7d') {
            sql += ` AND jp.created_at >= NOW() - INTERVAL '7 days'`;
        } else if (postedDate === '30d') {
            sql += ` AND jp.created_at >= NOW() - INTERVAL '30 days'`;
        }
    }

    // Sorting
    if (sortBy === 'mostRecent') {
        sql += ` ORDER BY jp.created_at DESC`;
    } else if (sortBy === 'highestSalary') {
        sql += ` ORDER BY COALESCE(jp.salary_max, jp.salary_min, 0) DESC`;
    } else if (sortBy === 'bestMatch') {
        sql += ` ORDER BY "matchScore" DESC, jp.created_at DESC`;
    } else {
        // mostRelevant (default)
        sql += ` ORDER BY jp.created_at DESC`;
    }

    const result = await db.query(sql, queryParams);

    return res.status(200).json({
        success: true,
        data: result.rows
    });
});

// Get Single Job Details by ID
exports.getJobDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    // Fetch user skills for match score calculation
    const profileRes = await db.query('SELECT skills FROM employee_details WHERE user_id = $1;', [userId]);
    const userSkillsStr = profileRes.rows[0]?.skills || '';
    const userSkills = userSkillsStr.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');

    let matchScoreSql = '0';
    const queryParams = [userId, userId, jobId];
    let paramIndex = 4;

    if (userSkills.length > 0) {
        const scoreParts = userSkills.map(skill => {
            queryParams.push(`%${skill}%`);
            return `(CASE WHEN jp.skills ILIKE $${paramIndex++} THEN 1 ELSE 0 END)`;
        });
        matchScoreSql = scoreParts.join(' + ');
    }

    const sql = `
        SELECT jp.job_id AS "id", jp.job_title AS "title", jp.job_description AS "description",
               jp.job_requirements AS "requirements", jp.job_type AS "type", jp.work_mode AS "workMode",
               jp.location, jp.salary_min AS "salaryMin", jp.salary_max AS "salaryMax",
               jp.salary_currency AS "salaryCurrency", jp.experience_min AS "experienceMin",
               jp.experience_max AS "experienceMax", jp.skills, jp.created_at AS "createdAt",
               jp.employment_level AS "employmentLevel", jp.total_applications AS "totalApplications",
               c.company_name AS "companyName", c.company_logo AS "companyLogo", c.company_description AS "companyDescription",
               d.department_name AS "departmentName", c.industry_type AS "industryType",
               (sj.id IS NOT NULL) AS "isSaved",
               (ja.id IS NOT NULL) AS "isApplied",
               ja.status AS "applicationStatus",
               (${matchScoreSql}) AS "matchScore"
        FROM job_posting jp
        LEFT JOIN company c ON jp.company_id = c.id
        LEFT JOIN department d ON jp.department_id = d.id
        LEFT JOIN saved_jobs sj ON sj.job_id = jp.job_id AND sj.user_id = $1
        LEFT JOIN job_applications ja ON ja.job_id = jp.job_id AND ja.user_id = $2
        WHERE jp.job_id = $3
    `;

    const result = await db.query(sql, queryParams);

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Job not found.'
        });
    }

    return res.status(200).json({
        success: true,
        data: result.rows[0]
    });
});

// 6. Apply to Job
exports.applyForJob = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    // Verify if already applied
    const appCheck = 'SELECT id FROM job_applications WHERE user_id = $1 AND job_id = $2;';
    const checkRes = await db.query(appCheck, [userId, jobId]);
    if (checkRes.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
    }

    // Get fallback information from employee profile
    const profileRes = await db.query(
        'SELECT first_name, last_name, email, phone, resume_url, city, social_links FROM employee_details WHERE user_id = $1;',
        [userId]
    );
    const employee = profileRes.rows[0] || {};
    const fallbackName = employee.first_name ? `${employee.first_name} ${employee.last_name || ''}`.trim() : 'Candidate';
    const fallbackEmail = employee.email || req.user.email;
    const fallbackPhone = employee.phone || '';
    const fallbackResume = employee.resume_url || '';
    const socialLinks = employee.social_links || {};

    const {
        fullName,
        email,
        phoneNumber,
        resumeUrl,
        coverLetter,
        portfolioUrl,
        linkedinUrl,
        githubUrl,
        totalExperience,
        currentCompany,
        currentDesignation,
        currentCtc,
        expectedCtc,
        noticePeriod,
        currentLocation,
        preferredLocation,
        willingToRelocate,
        willingToWorkRemote,
        source
    } = req.body;

    const finalResumeUrl = resumeUrl || fallbackResume;
    if (!finalResumeUrl) {
        return res.status(400).json({
            success: false,
            message: 'Please upload your resume in the Resume tab before applying.'
        });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Insert Application record
        const insertApp = `
            INSERT INTO job_applications (
                user_id, job_id, full_name, email, phone_number, resume_url, cover_letter, 
                portfolio_url, linkedin_url, github_url, total_experience, current_company, 
                current_designation, current_ctc, expected_ctc, notice_period, 
                current_location, preferred_location, willing_to_relocate, willing_to_work_remote, 
                source, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'Applied')
            RETURNING id;
        `;
        
        const insertRes = await client.query(insertApp, [
            userId,
            jobId,
            fullName || fallbackName,
            email || fallbackEmail,
            phoneNumber || fallbackPhone,
            finalResumeUrl,
            coverLetter || null,
            portfolioUrl || socialLinks.portfolio || null,
            linkedinUrl || socialLinks.linkedin || null,
            githubUrl || socialLinks.github || null,
            totalExperience ? parseFloat(totalExperience) : null,
            currentCompany || null,
            currentDesignation || null,
            currentCtc ? parseFloat(currentCtc) : null,
            expectedCtc ? parseFloat(expectedCtc) : null,
            noticePeriod || null,
            currentLocation || employee.city || null,
            preferredLocation || null,
            willingToRelocate !== undefined ? willingToRelocate : false,
            willingToWorkRemote !== undefined ? willingToWorkRemote : true,
            source || 'LinkedIn'
        ]);

        const applicationId = insertRes.rows[0].id;

        // Increment application count
        await client.query(
            'UPDATE job_posting SET total_applications = total_applications + 1 WHERE job_id = $1;',
            [jobId]
        );

        // Send a notification
        const jobDetails = await client.query('SELECT job_title FROM job_posting WHERE job_id = $1;', [jobId]);
        const title = jobDetails.rows[0]?.job_title || 'Job';
        
        await client.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES ($1, 'Application Sent Successfully', 'Your application for the role of "${title}" has been submitted successfully (ID: ${applicationId}).', 'STATUS_UPDATE');`,
            [userId]
        );

        await client.query('COMMIT');
        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            data: { applicationId }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

// 7. Toggle Bookmark Job
exports.toggleSaveJob = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    const checkBookmark = 'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2;';
    const checkRes = await db.query(checkBookmark, [userId, jobId]);

    if (checkRes.rows.length > 0) {
        // Unsave
        await db.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2;', [userId, jobId]);
        return res.status(200).json({
            success: true,
            isSaved: false,
            message: 'Job removed from saved list.'
        });
    } else {
        // Save
        await db.query('INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2);', [userId, jobId]);
        return res.status(201).json({
            success: true,
            isSaved: true,
            message: 'Job bookmarked successfully.'
        });
    }
});

// 8. Get Saved Jobs
exports.getSavedJobs = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const sql = `
        SELECT jp.job_id AS "id", jp.job_title AS "title", jp.job_type AS "type", jp.location,
               jp.salary_min AS "salaryMin", jp.salary_max AS "salaryMax", jp.salary_currency AS "salaryCurrency",
               c.company_name AS "companyName", c.company_logo AS "companyLogo",
               jp.experience_min AS "experienceMin", jp.experience_max AS "experienceMax", jp.skills,
               jp.created_at AS "createdAt",
               (ja.id IS NOT NULL) AS "isApplied",
               ja.status AS "applicationStatus"
        FROM saved_jobs sj
        JOIN job_posting jp ON sj.job_id = jp.job_id
        LEFT JOIN company c ON jp.company_id = c.id
        LEFT JOIN job_applications ja ON ja.job_id = jp.job_id AND ja.user_id = $1
        WHERE sj.user_id = $1
        ORDER BY sj.created_at DESC;
    `;
    const result = await db.query(sql, [userId]);

    return res.status(200).json({
        success: true,
        data: result.rows
    });
});

// 9. Get Applied Jobs
exports.getAppliedJobs = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const sql = `
        SELECT ja.id AS "applicationId", ja.status, ja.applied_at AS "appliedAt", ja.resume_url AS "resumeUrl",
               jp.job_id AS "id", jp.job_title AS "title", jp.job_type AS "type", jp.location,
               c.company_name AS "companyName", c.company_logo AS "companyLogo"
        FROM job_applications ja
        JOIN job_posting jp ON ja.job_id = jp.job_id
        LEFT JOIN company c ON jp.company_id = c.id
        WHERE ja.user_id = $1
        ORDER BY ja.applied_at DESC;
    `;
    const result = await db.query(sql, [userId]);

    return res.status(200).json({
        success: true,
        data: result.rows
    });
});

// 10. Get Notifications
exports.getNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const sql = 'SELECT id, title, message, type, is_read AS "isRead", created_at AS "createdAt" FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;';
    const result = await db.query(sql, [userId]);

    return res.status(200).json({
        success: true,
        data: result.rows
    });
});

// 11. Mark Notification as Read
exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2;', [id, userId]);

    return res.status(200).json({
        success: true,
        message: 'Notification marked as read.'
    });
});

// 12. Mark All Notifications as Read
exports.markAllNotificationsAsRead = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1;', [userId]);

    return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
    });
});

// 13. Update Account Settings (Security & Password)
exports.updateSettings = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide both current and new passwords.' });
    }

    // Verify current password
    const userQuery = 'SELECT password_hash FROM users WHERE id = $1;';
    const userResult = await db.query(userQuery, [userId]);
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    // Hash and update password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;', [newPasswordHash, userId]);

    return res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
    });
});

// 14. Delete Account
exports.deleteAccount = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Delete core login account (foreign key cascade deletes details, applications, bookmarks, notifications)
    await db.query('DELETE FROM users WHERE id = $1;', [userId]);

    return res.status(200).json({
        success: true,
        message: 'Account deleted successfully.'
    });
});
