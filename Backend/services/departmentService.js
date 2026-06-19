const db = require('../config/db');

async function createDepartment(data) {
    const { company_id, department_name, department_code, headcount_quota, assigned_manager_id, description, status, created_by, updated_by } = data;
    const client = await db.connect();
    try {
        const result = await client.query(
            `INSERT INTO department 
            (company_id, department_name, department_code, headcount_quota, assigned_manager_id, description, status, created_by, updated_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id, company_id AS "companyId", department_name AS "name", department_code AS "code", headcount_quota AS "headcount", assigned_manager_id AS "assignedManagerId", description, status, created_at AS "createdAt"`,
            [company_id, department_name, department_code, headcount_quota || 0, assigned_manager_id || null, description || null, status || 'ACTIVE', created_by, updated_by || null]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
}
    
async function updateDepartment(id, data) {
    const { company_id, department_name, department_code, headcount_quota, assigned_manager_id, description, status, created_by, updated_by } = data;
    const client = await db.connect();
    try {
        const result = await client.query(
            `UPDATE department 
            SET company_id = $2, department_name = $3, department_code = $4, headcount_quota = $5, assigned_manager_id = $6, description = $7, status = $8, created_by = $9, updated_by = $10, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING id, company_id AS "companyId", department_name AS "name", department_code AS "code", headcount_quota AS "headcount", assigned_manager_id AS "assignedManagerId", description, status, created_at AS "createdAt"`,
            [id, company_id, department_name, department_code, headcount_quota || 0, assigned_manager_id || null, description || null, status || 'ACTIVE', created_by, updated_by]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function deleteDepartment(id) {
    const client = await db.connect();
    try {
        const result = await client.query(
            `DELETE FROM department 
            WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function getDepartmentById(id) {
    const client = await db.connect();
    try {
        const result = await client.query(
            `SELECT d.id, d.company_id AS "companyId", d.department_name AS "name", d.department_code AS "code", d.headcount_quota AS "headcount", d.assigned_manager_id AS "assignedManagerId", ca.admin_name AS "manager", d.description, d.status, d.created_at AS "createdAt"
            FROM department d
            LEFT JOIN company_admin ca ON d.assigned_manager_id = ca.user_id
            WHERE d.id = $1`,
            [id]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function getAllDepartments(companyId) {
    const client = await db.connect();
    try {
        let query = `
            SELECT d.id, d.company_id AS "companyId", d.department_name AS "name", d.department_code AS "code", d.headcount_quota AS "headcount", d.assigned_manager_id AS "assignedManagerId", ca.admin_name AS "manager", d.description, d.status, d.created_at AS "createdAt"
            FROM department d
            LEFT JOIN company_admin ca ON d.assigned_manager_id = ca.user_id
        `;
        const params = [];
        if (companyId) {
            query += ' WHERE d.company_id = $1';
            params.push(companyId);
        }
        query += ' ORDER BY d.created_at DESC';
        const result = await client.query(query, params);
        return result.rows;
    } finally {
        client.release();
    }
}

module.exports = {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    getAllDepartments
};