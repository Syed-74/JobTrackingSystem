const db = require('../config/db');
const bcrypt = require('bcrypt');

async function createAccount(companyId, data) {
    const { 
        email, 
        password, 
        fullName, 
        contactPhone, 
        alternatePhone, 
        gender, 
        dateOfBirth, 
        departmentId, 
        designation, 
        bio, 
        address, 
        role, 
        createdBy 
    } = data;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Check if user already exists
        const userCheck = 'SELECT id FROM users WHERE email = $1;';
        const userCheckRes = await client.query(userCheck, [email]);
        if (userCheckRes.rows.length > 0) {
            throw new Error('An account with this email address already exists.');
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 1. Create Core Login Account
        const userInsert = `
            INSERT INTO users (email, password_hash, user_type)
            VALUES ($1, $2, 'COMPANY_USER')
            RETURNING id;
        `;
        const userRes = await client.query(userInsert, [email, passwordHash]);
        const assignedUserId = userRes.rows[0].id;

        // 2. Create Company Account Manage Record
        const accountInsert = `
            INSERT INTO company_account_manage (
                user_id, company_id, full_name, contact_phone, alternate_phone, 
                gender, date_of_birth, department_id, designation, bio, 
                address, role, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, user_id AS "userId", company_id AS "companyId", full_name AS "fullName", role;
        `;
        const accountRes = await client.query(accountInsert, [
            assignedUserId,
            companyId,
            fullName,
            contactPhone,
            alternatePhone || null,
            gender || null,
            dateOfBirth ? new Date(dateOfBirth) : null,
            departmentId || null,
            designation || null,
            bio || null,
            address || null,
            role,
            createdBy
        ]);

        await client.query('COMMIT');
        return accountRes.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function updateAccount(accountId, data) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Verify account exists
        const checkQuery = 'SELECT user_id FROM company_account_manage WHERE id = $1;';
        const checkRes = await client.query(checkQuery, [accountId]);
        if (checkRes.rows.length === 0) {
            throw new Error('Company account not found.');
        }
        const userId = checkRes.rows[0].user_id;

        const allowedFields = {
            fullName: 'full_name',
            contactPhone: 'contact_phone',
            alternatePhone: 'alternate_phone',
            gender: 'gender',
            dateOfBirth: 'date_of_birth',
            departmentId: 'department_id',
            designation: 'designation',
            bio: 'bio',
            address: 'address',
            role: 'role',
            status: 'status'
        };

        const updateFields = [];
        const updateValues = [];
        let index = 1;

        for (const key in data) {
            if (allowedFields[key] !== undefined) {
                updateFields.push(`${allowedFields[key]} = $${index}`);
                let val = data[key];
                if (val === '' || (typeof val === 'string' && val.trim() === '')) {
                    val = null;
                }
                if (key === 'dateOfBirth' && val) {
                    updateValues.push(new Date(val));
                } else {
                    updateValues.push(val);
                }
                index++;
            }
        }

        if (updateFields.length > 0) {
            updateValues.push(accountId);
            const updateQuery = `
                UPDATE company_account_manage
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${index};
            `;
            await client.query(updateQuery, updateValues);
        }

        // If status is updated, also synchronize users table is_active
        if (data.status !== undefined) {
            const isActive = data.status === 'ACTIVE';
            await client.query('UPDATE users SET is_active = $1 WHERE id = $2;', [isActive, userId]);
        }

        // If password is provided, hash and update users table password
        if (data.password && data.password.trim() !== '') {
            if (data.password.length < 6) {
                throw new Error('Password must be at least 6 characters.');
            }
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const passwordHash = await bcrypt.hash(data.password, saltRounds);
            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2;', [passwordHash, userId]);
        }

        await client.query('COMMIT');
        return { success: true, message: 'Account updated successfully.' };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function deleteAccount(accountId) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Fetch userId to delete core login
        const accountRes = await client.query('SELECT user_id FROM company_account_manage WHERE id = $1;', [accountId]);
        if (accountRes.rows.length === 0) {
            throw new Error('Company account record not found.');
        }
        const userId = accountRes.rows[0].user_id;

        // Deleting from users automatically cascades and deletes the profile record
        await client.query('DELETE FROM users WHERE id = $1;', [userId]);

        await client.query('COMMIT');
        return { success: true, message: 'Company account deleted successfully.' };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function getAccountById(accountId) {
    const client = await db.connect();
    try {
        const query = `
            SELECT 
                cam.id, cam.user_id AS "userId", cam.company_id AS "companyId", cam.full_name AS "fullName", 
                u.email, cam.contact_phone AS "contactPhone", cam.alternate_phone AS "alternatePhone", 
                cam.gender, cam.date_of_birth AS "dateOfBirth", cam.department_id AS "departmentId", 
                cam.designation, cam.bio, cam.address, cam.role, cam.status, 
                cam.is_first_login AS "isFirstLogin", cam.last_login AS "lastLogin", 
                cam.created_at AS "createdAt", d.department_name AS "departmentName"
            FROM company_account_manage cam
            JOIN users u ON u.id = cam.user_id
            LEFT JOIN department d ON d.id = cam.department_id
            WHERE cam.id = $1;
        `;
        const res = await client.query(query, [accountId]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

async function getCompanyAccounts(companyId) {
    const client = await db.connect();
    try {
        const query = `
            SELECT 
                cam.id, cam.user_id AS "userId", cam.company_id AS "companyId", cam.full_name AS "fullName", 
                u.email, cam.contact_phone AS "contactPhone", cam.alternate_phone AS "alternatePhone", 
                cam.gender, cam.date_of_birth AS "dateOfBirth", cam.department_id AS "departmentId", 
                cam.designation, cam.bio, cam.address, cam.role, cam.status, 
                cam.is_first_login AS "isFirstLogin", cam.last_login AS "lastLogin", 
                cam.created_at AS "createdAt", d.department_name AS "departmentName"
            FROM company_account_manage cam
            JOIN users u ON u.id = cam.user_id
            LEFT JOIN department d ON d.id = cam.department_id
            WHERE cam.company_id = $1
            ORDER BY cam.created_at DESC;
        `;
        const res = await client.query(query, [companyId]);
        return res.rows;
    } finally {
        client.release();
    }
}

module.exports = {
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    getCompanyAccounts
};
