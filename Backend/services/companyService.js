const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class CompanyService {
    async registerNewCompanyProfile({ email, password, companyData }) {
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');

            // Check if user already exists
            const userCheck = 'SELECT id FROM users WHERE email = $1;';
            const userCheckRes = await client.query(userCheck, [email]);
            if (userCheckRes.rows.length > 0) {
                throw new Error('An account with this email address already exists.');
            }

            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 1. Create Login Account
            const userInsert = `
                INSERT INTO users (email, password_hash, user_type)
                VALUES ($1, $2, 'COMPANY_USER')
                RETURNING id;
            `;
            const userRes = await client.query(userInsert, [email, passwordHash]);
            const assignedUserId = userRes.rows[0].id;

            // 2. Company Corporate Profile Entity
            const companyInsert = `
                INSERT INTO company (
                    user_id, company_name, company_description, company_address, 
                    company_state, company_city, company_pincode, company_logo,
                    company_website, industry_type, company_size, company_email, company_phone, is_created
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
                RETURNING id;
            `;
            const companyRes = await client.query(companyInsert, [
                assignedUserId,
                companyData.companyName,
                companyData.companyDescription,
                companyData.companyAddress,
                companyData.companyState,
                companyData.companyCity,
                companyData.companyPincode,
                companyData.companyLogo || null,
                companyData.companyWebsite || null,
                companyData.industryType || null,
                companyData.companySize || null,
                companyData.companyEmail || null,
                companyData.companyPhone || null
            ]);
            const assignedCompanyId = companyRes.rows[0].id;

            await client.query('COMMIT');

            return {
                userId: assignedUserId,
                companyId: assignedCompanyId
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateCompanyProfile(companyId, updateData) {
        const allowedFields = {
            companyName: 'company_name',
            companyDescription: 'company_description',
            companyAddress: 'company_address',
            companyState: 'company_state',
            companyCity: 'company_city',
            companyPincode: 'company_pincode',
            companyLogo: 'company_logo',
            companyWebsite: 'company_website',
            industryType: 'industry_type',
            companySize: 'company_size',
            companyEmail: 'company_email',
            companyPhone: 'company_phone',
            isActive: 'is_active',
            isCreated: 'is_created'
        };

        const fields = [];
        const values = [];
        let index = 1;

        for (const key in updateData) {
            if (allowedFields[key] !== undefined) {
                fields.push(`${allowedFields[key]} = $${index}`);
                values.push(updateData[key]);
                index++;
            }
        }

        if (fields.length === 0) {
            throw new Error('No valid fields provided for update.');
        }

        values.push(companyId);

        const updateQuery = `
            UPDATE company
            SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING id, company_name AS "companyName", company_description AS "companyDescription", 
                      company_address AS "companyAddress", company_state AS "companyState", 
                      company_city AS "companyCity", company_pincode AS "companyPincode", 
                      company_logo AS "companyLogo", company_website AS "companyWebsite", 
                      industry_type AS "industryType", company_size AS "companySize", 
                      company_email AS "companyEmail", company_phone AS "companyPhone";
        `;

        const updateRes = await db.query(updateQuery, values);
        if (updateRes.rows.length === 0) {
            throw new Error('Company profile not found or no changes made.');
        }
        return updateRes.rows[0];
    }

    async getCompanyProfile(companyId) {
        const profileQuery = `
            SELECT id, company_name AS "companyName", company_description AS "companyDescription", 
                   company_address AS "companyAddress", company_state AS "companyState", 
                   company_city AS "companyCity", company_pincode AS "companyPincode", 
                   company_logo AS "companyLogo", company_website AS "companyWebsite", 
                   industry_type AS "industryType", company_size AS "companySize", 
                   company_email AS "companyEmail", company_phone AS "companyPhone"
            FROM company
            WHERE id = $1;
        `;
        const profileRes = await db.query(profileQuery, [companyId]);
        if (profileRes.rows.length === 0) {
            throw new Error('Company profile not found for the given ID.');
        }
        return profileRes.rows[0];
    }

    async deleteCompanyProfile(companyId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // Find the userId associated with the company
            const userQuery = 'SELECT user_id FROM company WHERE id = $1;';
            const userRes = await client.query(userQuery, [companyId]);
            if (userRes.rows.length === 0) {
                throw new Error('Company profile not found.');
            }
            const companyOwnerUserId = userRes.rows[0].user_id;

            // Find associated admin user IDs
            const adminUsersQuery = 'SELECT user_id FROM company_admin WHERE company_id = $1;';
            const adminUsersRes = await client.query(adminUsersQuery, [companyId]);
            const adminUserIds = adminUsersRes.rows.map(r => r.user_id);

            // Find associated account manage user IDs
            const manageUsersQuery = 'SELECT user_id FROM company_account_manage WHERE company_id = $1;';
            const manageUsersRes = await client.query(manageUsersQuery, [companyId]);
            const manageUserIds = manageUsersRes.rows.map(r => r.user_id);

            // Delete job postings first to satisfy foreign key constraints
            await client.query('DELETE FROM job_posting WHERE company_id = $1;', [companyId]);

            // Delete the company record (this cascades to company_admin, company_account_manage, department, etc.)
            await client.query('DELETE FROM company WHERE id = $1;', [companyId]);

            // Delete all associated user accounts
            const allUserIdsToDelete = [companyOwnerUserId, ...adminUserIds, ...manageUserIds].filter(Boolean);
            if (allUserIdsToDelete.length > 0) {
                await client.query('DELETE FROM users WHERE id = ANY($1::uuid[]);', [allUserIdsToDelete]);
            }

            await client.query('COMMIT');
            return { success: true, message: 'Company profile and all associated data deleted successfully.' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getAllCompanies() {
        const query = `
            SELECT c.id, c.user_id AS "userId", c.company_name AS "companyName", 
                   c.company_description AS "companyDescription", c.company_address AS "companyAddress", 
                   c.company_state AS "companyState", c.company_city AS "companyCity", 
                   c.company_pincode AS "companyPincode", c.company_logo AS "companyLogo", 
                   c.company_website AS "companyWebsite", c.industry_type AS "industryType",
                   c.company_size AS "companySize", c.company_email AS "companyEmail",
                   c.company_phone AS "companyPhone",
                   c.is_active AS "isActive", c.is_created AS "isCreated", c.created_at AS "createdAt",
                   c.company_name AS "adminName", c.company_email AS "adminEmail", c.company_phone AS "adminPhone"
            FROM company c
            ORDER BY c.created_at DESC;
        `;
        const res = await db.query(query);
        return res.rows;
    }

    async getCompanyById(companyId) {
        return this.getCompanyProfile(companyId);
    }

    async getCompanyDetails(companyId) {
        const query = `
            SELECT c.id, c.user_id AS "userId", c.company_name AS "companyName", 
                   c.company_description AS "companyDescription", c.company_address AS "companyAddress", 
                   c.company_state AS "companyState", c.company_city AS "companyCity", 
                   c.company_pincode AS "companyPincode", c.company_logo AS "companyLogo", 
                   c.company_website AS "companyWebsite", c.industry_type AS "industryType",
                   c.company_size AS "companySize", c.company_email AS "companyEmail",
                   c.company_phone AS "companyPhone",
                   c.is_active AS "isActive", c.is_created AS "isCreated", c.created_at AS "createdAt",
                   c.company_name AS "adminName", c.company_email AS "adminEmail", c.company_phone AS "adminPhone"
            FROM company c
            WHERE c.id = $1;
        `;
        const res = await db.query(query, [companyId]);
        if (res.rows.length === 0) {
            throw new Error('Company profile not found for the given ID.');
        }
        return res.rows[0];
    }

    async updateCompanyDetails(companyId, updateData) {
        return this.updateCompanyProfile(companyId, updateData);
    }

    async deleteCompanyDetails(companyId) {
        return this.deleteCompanyProfile(companyId);
    }

    async createCompanyAdmin(companyId, { email, password, adminData, createdBy }) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Check if user already exists
            const userCheck = 'SELECT id FROM users WHERE email = $1;';
            const userCheckRes = await client.query(userCheck, [email]);
            if (userCheckRes.rows.length > 0) {
                throw new Error('An account with this email address already exists.');
            }

            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 1. Create Login Account
            const userInsert = `
                INSERT INTO users (email, password_hash, user_type)
                VALUES ($1, $2, 'COMPANY_USER')
                RETURNING id;
            `;
            const userRes = await client.query(userInsert, [email, passwordHash]);
            const assignedUserId = userRes.rows[0].id;

            // 2. Create Company Admin Linkage
            const adminInsert = `
                INSERT INTO company_admin (
                    user_id, company_id, admin_name, admin_email, admin_phone,
                    admin_alternate_phone, admin_gender, admin_dob, created_by,
                    is_email_verified, is_created
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)
                RETURNING id;
            `;
            const adminRes = await client.query(adminInsert, [
                assignedUserId,
                companyId,
                adminData.adminName,
                email,
                adminData.adminPhone,
                adminData.adminAlternatePhone || null,
                adminData.adminGender || null,
                adminData.adminDob || null,
                createdBy || null
            ]);
            const assignedAdminId = adminRes.rows[0].id;

            // 3. Create Address Record mapping 1:1 with company_admin.id
            const addressInsert = `
                INSERT INTO address (id, admin_address, admin_city, admin_state, admin_country, admin_pincode)
                VALUES ($1, $2, $3, $4, $5, $6);
            `;
            await client.query(addressInsert, [
                assignedAdminId,
                adminData.adminAddress || 'N/A',
                adminData.adminCity || 'N/A',
                adminData.adminState || 'N/A',
                adminData.adminCountry || 'N/A',
                adminData.adminPincode || 'N/A'
            ]);

            // 4. Create Profile Record mapping 1:1 with company_admin.id
            const profileInsert = `
                INSERT INTO profile (id, admin_profile_picture, admin_designation, admin_department, admin_bio)
                VALUES ($1, $2, $3, $4, $5);
            `;
            await client.query(profileInsert, [
                assignedAdminId,
                adminData.adminProfilePicture || null,
                adminData.adminDesignation || null,
                adminData.adminDepartment || null,
                adminData.adminBio || null
            ]);

            // 5. Create Role Assignments (Omitted: dynamic roles dropped)

            await client.query('COMMIT');

            return {
                userId: assignedUserId,
                companyId: companyId,
                adminId: assignedAdminId
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getCompanyAdmins(companyId) {
        const query = `
            SELECT ca.id, ca.user_id AS "userId", ca.company_id AS "companyId", 
                   ca.admin_name AS "adminName", ca.admin_email AS "adminEmail", 
                   ca.admin_phone AS "adminPhone", ca.admin_alternate_phone AS "adminAlternatePhone", 
                   ca.admin_gender AS "adminGender", ca.admin_dob AS "adminDob", 
                   ca.last_login_at AS "lastLoginAt", ca.is_active AS "isActive",
                   a.admin_address AS "adminAddress", a.admin_city AS "adminCity", 
                   a.admin_state AS "adminState", a.admin_country AS "adminCountry", 
                   a.admin_pincode AS "adminPincode",
                   p.admin_profile_picture AS "adminProfilePicture", p.admin_designation AS "adminDesignation", 
                   p.admin_department AS "adminDepartment", p.admin_bio AS "adminBio",
                   'Company Admin' AS "assignedRoles",
                   NULL AS "assignedRoleIds"
            FROM company_admin ca
            LEFT JOIN address a ON a.id = ca.id
            LEFT JOIN profile p ON p.id = ca.id
            WHERE ca.company_id = $1 AND ca.is_deleted = false
            ORDER BY ca.created_at DESC;
        `;
        const res = await db.query(query, [companyId]);
        return res.rows;
    }

    async getAllCompanyAdmins() {
        const query = `
            SELECT ca.id, ca.user_id AS "userId", ca.company_id AS "companyId", 
                   ca.admin_name AS "adminName", ca.admin_email AS "adminEmail", 
                   ca.admin_phone AS "adminPhone", ca.admin_alternate_phone AS "adminAlternatePhone", 
                   ca.admin_gender AS "adminGender", ca.admin_dob AS "adminDob", 
                   ca.last_login_at AS "lastLoginAt", ca.is_active AS "isActive",
                   c.company_name AS "companyName",
                   a.admin_address AS "adminAddress", a.admin_city AS "adminCity", 
                   a.admin_state AS "adminState", a.admin_country AS "adminCountry", 
                   a.admin_pincode AS "adminPincode",
                   p.admin_profile_picture AS "adminProfilePicture", p.admin_designation AS "adminDesignation", 
                   p.admin_department AS "adminDepartment", p.admin_bio AS "adminBio"
            FROM company_admin ca
            LEFT JOIN company c ON c.id = ca.company_id
            LEFT JOIN address a ON a.id = ca.id
            LEFT JOIN profile p ON p.id = ca.id
            WHERE ca.is_deleted = false
            ORDER BY ca.created_at DESC;
        `;
        const res = await db.query(query);
        return res.rows;
    }

    async updateCompanyAdmin(adminId, updateData) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Find the user_id from company_admin
            const adminRes = await client.query('SELECT user_id FROM company_admin WHERE id = $1;', [adminId]);
            if (adminRes.rows.length === 0) {
                throw new Error('Company admin not found.');
            }
            const userId = adminRes.rows[0].user_id;

            // Update company_admin table fields
            const allowedAdminFields = {
                adminName: 'admin_name',
                adminPhone: 'admin_phone',
                adminAlternatePhone: 'admin_alternate_phone',
                adminGender: 'admin_gender',
                adminDob: 'admin_dob',
                isActive: 'is_active'
            };

            const adminFields = [];
            const adminValues = [];
            let adminIndex = 1;

            for (const key in updateData) {
                if (allowedAdminFields[key] !== undefined) {
                    adminFields.push(`${allowedAdminFields[key]} = $${adminIndex}`);
                    adminValues.push(updateData[key]);
                    adminIndex++;
                }
            }

            if (adminFields.length > 0) {
                adminValues.push(adminId);
                const adminUpdateQuery = `
                    UPDATE company_admin
                    SET ${adminFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $${adminIndex};
                `;
                await client.query(adminUpdateQuery, adminValues);
            }

            // If isActive is updated, also update the core user account is_active status
            if (updateData.isActive !== undefined) {
                await client.query('UPDATE users SET is_active = $1 WHERE id = $2;', [updateData.isActive, userId]);
            }

            // Update address table fields
            const allowedAddressFields = {
                adminAddress: 'admin_address',
                adminCity: 'admin_city',
                adminState: 'admin_state',
                adminCountry: 'admin_country',
                adminPincode: 'admin_pincode'
            };

            const addressFields = [];
            const addressValues = [];
            let addressIndex = 1;

            for (const key in updateData) {
                if (allowedAddressFields[key] !== undefined) {
                    addressFields.push(`${allowedAddressFields[key]} = $${addressIndex}`);
                    addressValues.push(updateData[key]);
                    addressIndex++;
                }
            }

            if (addressFields.length > 0) {
                addressValues.push(adminId);
                const addressUpdateQuery = `
                    UPDATE address
                    SET ${addressFields.join(', ')}
                    WHERE id = $${addressIndex};
                `;
                await client.query(addressUpdateQuery, addressValues);
            }

            // Update profile table fields
            const allowedProfileFields = {
                adminProfilePicture: 'admin_profile_picture',
                adminDesignation: 'admin_designation',
                adminDepartment: 'admin_department',
                adminBio: 'admin_bio'
            };

            const profileFields = [];
            const profileValues = [];
            let profileIndex = 1;

            for (const key in updateData) {
                if (allowedProfileFields[key] !== undefined) {
                    profileFields.push(`${allowedProfileFields[key]} = $${profileIndex}`);
                    profileValues.push(updateData[key]);
                    profileIndex++;
                }
            }

            if (profileFields.length > 0) {
                profileValues.push(adminId);
                const profileUpdateQuery = `
                    UPDATE profile
                    SET ${profileFields.join(', ')}
                    WHERE id = $${profileIndex};
                `;
            }

            // Update role assignments (Omitted: dynamic roles dropped)

            await client.query('COMMIT');
            return { success: true, message: 'Company admin updated successfully.' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteCompanyAdmin(adminId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Get the user_id to deactivate/delete
            const adminRes = await client.query('SELECT user_id FROM company_admin WHERE id = $1;', [adminId]);
            if (adminRes.rows.length === 0) {
                throw new Error('Company admin not found.');
            }
            const userId = adminRes.rows[0].user_id;

            // Set is_deleted = true in company_admin
            await client.query('UPDATE company_admin SET is_deleted = true, is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1;', [adminId]);

            // Deactivate login user account
            await client.query('UPDATE users SET is_active = false WHERE id = $1;', [userId]);

            await client.query('COMMIT');
            return { success: true, message: 'Company admin deleted successfully.' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new CompanyService();
