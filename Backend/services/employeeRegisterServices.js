const db = require('../config/db');
const bcrypt = require('bcrypt');

async function registerEmployee(employeeData) {
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
    } = employeeData;

    if (!email || !password || !firstName || !phone) {
        throw new Error('Required fields missing: email, password, firstName, and phone are required.');
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Check if user already exists in auth table
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
            VALUES ($1, $2, 'EMPLOYEE')
            RETURNING id;
        `;
        const userRes = await client.query(userInsert, [email, passwordHash]);
        const assignedUserId = userRes.rows[0].id;

        // 2. Create Employee Details Record
        const employeeInsert = `
            INSERT INTO employee_details (
                user_id, employee_code, first_name, last_name, email, phone, 
                profile_picture, gender, dob, marital_status, address, 
                city, state, country, pincode, emergency_contact_name, emergency_contact_number
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING id, user_id AS "userId", employee_code AS "employeeCode", 
                      first_name AS "firstName", last_name AS "lastName", email, phone,
                      profile_picture AS "profilePicture", gender, dob, marital_status AS "maritalStatus",
                      address, city, state, country, pincode, 
                      emergency_contact_name AS "emergencyContactName", 
                      emergency_contact_number AS "emergencyContactNumber",
                      is_active AS "isActive", created_at AS "createdAt";
        `;
        const employeeRes = await client.query(employeeInsert, [
            assignedUserId,
            employeeCode || null,
            firstName,
            lastName || null,
            email,
            phone,
            profilePicture || null,
            gender || null,
            dob ? new Date(dob) : null,
            maritalStatus || null,
            address || null,
            city || null,
            state || null,
            country || null,
            pincode || null,
            emergencyContactName || null,
            emergencyContactNumber || null
        ]);

        await client.query('COMMIT');
        return {
            userId: assignedUserId,
            employee: employeeRes.rows[0]
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    registerEmployee
};
