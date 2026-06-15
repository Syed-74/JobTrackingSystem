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

        // Generate stateless JSON Web Token payload
        const token = jwt.sign(
            { id: user.id, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // Update the login audit record if they are a company user/staff member
        if (user.user_type === 'COMPANY_USER') {
            await db.query(
                'UPDATE company_admin SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1;',
                [user.id]
            );
        }

        return { token, user: { id: user.id, email: user.email, user_type: user.user_type } };
    }

    async getUserProfile(userId, userType) {
        if (userType === 'SUPER_ADMIN') {
            const profileQuery = `
                SELECT u.id, u.email, u.user_type, sa.name, sa.phone, sa.address, sa.state, sa.city, sa.pincode
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
                    ca.id AS admin_id, 
                    COALESCE(ca.admin_name, c.company_name) AS admin_name, 
                    COALESCE(ca.admin_phone, c.company_phone) AS admin_phone, 
                    c.id AS company_id, 
                    c.company_name
                FROM users u
                LEFT JOIN company_admin ca ON ca.user_id = u.id
                LEFT JOIN company c ON (ca.company_id = c.id OR (ca.id IS NULL AND c.user_id = u.id))
                WHERE u.id = $1;
            `;
            const res = await db.query(profileQuery, [userId]);
            if (res.rows.length === 0) throw new Error('User session not found.');
            return res.rows[0];
        } else {
            // Default user fallback
            const profileQuery = 'SELECT id, email, user_type FROM users WHERE id = $1;';
            const res = await db.query(profileQuery, [userId]);
            if (res.rows.length === 0) throw new Error('User session not found.');
            return res.rows[0];
        }
    }
}

module.exports = new AuthService();
