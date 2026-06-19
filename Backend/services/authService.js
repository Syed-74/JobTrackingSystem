const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    async authenticateUser(email, password) {
        // Look up the core auth account
        const userQuery = 'SELECT * FROM users WHERE email = $1 AND is_active = true;';
        const userResult = await db.query(userQuery, [email]);
        
        if (userResult.rows.length === 0) {
            throw new Error('Invalid email or password credentials.');
        }

        const user = userResult.rows[0];

        // Verify hash match
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password credentials.');
        }

        // Update the login audit record if they are a company user/staff member
        if (user.user_type === 'COMPANY_USER') {
            await db.query(
                'UPDATE company_admin SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1;',
                [user.id]
            );
            await db.query(
                'UPDATE company_account_manage SET last_login = CURRENT_TIMESTAMP, is_first_login = false WHERE user_id = $1;',
                [user.id]
            );
        }

        // Fetch the user's detailed profile
        const profile = await this.getUserProfile(user.id, user.user_type);

        // Generate stateless JSON Web Token payload with role and company_id
        const token = jwt.sign(
            { 
                id: user.id, 
                user_type: user.user_type, 
                role: profile.role, 
                company_id: profile.company_id || null 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return { token, user: profile };
    }

    async getUserProfile(userId, userType) {
        if (userType === 'SUPER_ADMIN') {
            const profileQuery = `
                SELECT sa.id, u.id AS user_id, u.email, u.user_type, sa.name, sa.phone, sa.address, sa.state, sa.city, sa.pincode,
                       'SUPER_ADMIN' AS role
                FROM users u
                LEFT JOIN super_admin sa ON sa.user_id = u.id
                WHERE u.id = $1;
            `;
            const res = await db.query(profileQuery, [userId]);
            if (res.rows.length === 0) throw new Error('User session not found.');
            return res.rows[0];
        } else if (userType === 'COMPANY_USER') {
            const profileQuery = `
                SELECT 
                    u.id, 
                    u.email, 
                    u.user_type, 
                    COALESCE(ca.id, cam.id) AS admin_id, 
                    COALESCE(ca.admin_name, cam.full_name, c.company_name) AS admin_name, 
                    COALESCE(ca.admin_phone, cam.contact_phone, c.company_phone) AS admin_phone, 
                    COALESCE(ca.company_id, cam.company_id, c.id) AS company_id, 
                    c.company_name,
                    COALESCE(cam.role, 'COMPANY_ADMIN') AS role
                FROM users u
                LEFT JOIN company_admin ca ON ca.user_id = u.id
                LEFT JOIN company_account_manage cam ON cam.user_id = u.id
                LEFT JOIN company c ON (
                    c.id = ca.company_id OR 
                    c.id = cam.company_id OR 
                    (ca.id IS NULL AND cam.id IS NULL AND c.user_id = u.id)
                )
                WHERE u.id = $1;
            `;
            const res = await db.query(profileQuery, [userId]);
            if (res.rows.length === 0) throw new Error('User session not found.');
            return res.rows[0];
        } else {
            // Fetch the user's detailed employee profile
            const profileQuery = `
                SELECT u.id, u.email, u.user_type, 'EMPLOYEE' AS role,
                       ed.id AS employee_id, ed.first_name AS "firstName", ed.last_name AS "lastName",
                       ed.phone, ed.profile_picture AS "profilePicture", ed.gender, ed.dob, 
                       ed.marital_status AS "maritalStatus", ed.address, ed.city, ed.state, 
                       ed.country, ed.pincode, ed.emergency_contact_name AS "emergencyContactName", 
                       ed.emergency_contact_number AS "emergencyContactNumber", ed.skills,
                       ed.education, ed.experience, ed.social_links AS "socialLinks", ed.resume_url AS "resumeUrl"
                FROM users u
                LEFT JOIN employee_details ed ON ed.user_id = u.id
                WHERE u.id = $1;
            `;
            const res = await db.query(profileQuery, [userId]);
            if (res.rows.length === 0) throw new Error('User session not found.');
            return res.rows[0];
        }
    }
}

module.exports = new AuthService();
