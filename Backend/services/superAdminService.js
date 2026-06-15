const db = require('../config/db');
const bcrypt = require('bcrypt');

class SuperAdminService {
    async provisionSuperAdmin({ email, password, adminDetails }) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            const userRes = await client.query(
                `INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, 'SUPER_ADMIN') RETURNING id;`,
                [email, passwordHash]
            );
            const superId = userRes.rows[0].id;

            const profileInsert = `
                INSERT INTO super_admin (user_id, name, phone, address, state, city, pincode, gender, dob, is_created)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING id;
            `;
            const profileRes = await client.query(profileInsert, [
                superId, adminDetails.name, adminDetails.phone, adminDetails.address,
                adminDetails.state, adminDetails.city, adminDetails.pincode, adminDetails.gender, adminDetails.dob
            ]);

            await client.query('COMMIT');
            return { userId: superId, profileId: profileRes.rows[0].id };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getSuperAdminProfile(userId) {
        const profileQuery = `
            SELECT sa.id AS profile_id, sa.name, sa.phone, sa.address, sa.state, sa.city, sa.pincode
            FROM super_admin sa
            JOIN users u ON sa.user_id = u.id
            WHERE u.id = $1 AND u.user_type = 'SUPER_ADMIN';
        `;
        const profileRes = await db.query(profileQuery, [userId]);
        if (profileRes.rows.length === 0) {
            throw new Error('Super Admin profile not found for the given user ID.');
        }
        return profileRes.rows[0];
    }

    async updateSuperAdminProfile(userId, updateData) {
        const allowedFields = {
            name: 'name',
            phone: 'phone',
            profilePicture: 'profile_picture',
            profile_picture: 'profile_picture',
            address: 'address',
            state: 'state',
            city: 'city',
            pincode: 'pincode',
            gender: 'gender',
            dob: 'dob',
            isActive: 'is_active',
            is_active: 'is_active',
            isCreated: 'is_created',
            is_created: 'is_created'
        };

        const fields = [];
        const values = [];
        let index = 1;

        for (const key in updateData) {
            if (allowedFields[key]) {
                fields.push(`${allowedFields[key]} = $${index}`);
                values.push(updateData[key]);
                index++;
            }
        }

        if (fields.length === 0) {
            throw new Error('No valid fields provided for update.');
        }

        values.push(userId); // For the WHERE clause

        const updateQuery = `
            UPDATE super_admin
            SET ${fields.join(', ')}
            FROM users
            WHERE super_admin.user_id = users.id AND users.id = $${index} AND users.user_type = 'SUPER_ADMIN'
            RETURNING super_admin.id AS profile_id, super_admin.name, super_admin.phone, super_admin.address, super_admin.state, super_admin.city, super_admin.pincode;
        `;
        const updateRes = await db.query(updateQuery, values);
        if (updateRes.rows.length === 0) {
            throw new Error('Failed to update Super Admin profile. Profile not found or invalid user ID.');
        }
        return updateRes.rows[0];
    }

    async deleteSuperAdmin(userId) {
        const deleteQuery = `
            DELETE FROM users
            WHERE id = $1 AND user_type = 'SUPER_ADMIN'
            RETURNING id;
        `;
        const deleteRes = await db.query(deleteQuery, [userId]);
        if (deleteRes.rows.length === 0) {
            throw new Error('Failed to delete Super Admin. User not found or invalid user ID.');
        }
        return { deletedUserId: deleteRes.rows[0].id };
    }
}

module.exports = new SuperAdminService();
