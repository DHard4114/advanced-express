const db = require("../database/pg.database.js");

exports.createTransaction = async ({ user_id, item_id, quantity }) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const itemQuery = await client.query("SELECT price FROM items WHERE id = $1", [item_id]);
        if (itemQuery.rowCount === 0) throw new Error("Item not found");

        const itemPrice = itemQuery.rows[0].price;
        const total = itemPrice * quantity;

        const userQuery = await client.query("SELECT balance FROM users WHERE id = $1", [user_id]);
        if (userQuery.rowCount === 0) throw new Error("User not found");
        const userBalance = userQuery.rows[0].balance;

        if (userBalance < total) throw new Error("Insufficient balance");

        await client.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [total, user_id]);

        const result = await client.query(`
            INSERT INTO transactions (user_id, item_id, quantity, total)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [user_id, item_id, quantity, total]
        );

        await client.query('COMMIT');
        return result.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


exports.payTransaction = async (id) => {
    const result = await db.query(
    `UPDATE transactions SET status = 'paid' WHERE id = $1 RETURNING *`,
    [id]
    );
    if (result.rowCount === 0) throw new Error("Transaction not found");
    return result.rows[0];
};

exports.deleteTransaction = async (id) => {
    const result = await db.query(
    `DELETE FROM transactions WHERE id = $1 RETURNING *`,
    [id]
    );
    if (result.rowCount === 0) throw new Error("Transaction not found");
    return result.rows[0];
};

exports.getAllTransactions = async () => {
    try {
        const query = `
            SELECT
                t.*,  -- Mengambil semua kolom dari tabel transactions
                row_to_json(u) as "user",  -- Mengambil data user dalam format JSON
                row_to_json(i) as "item"   -- Mengambil data item dalam format JSON
            FROM transactions t
            JOIN users u ON t.user_id = u.id  -- Bergabung dengan tabel users berdasarkan user_id
            JOIN items i ON t.item_id = i.id  -- Bergabung dengan tabel items berdasarkan item_id
            ORDER BY t.created_at DESC;  -- Mengurutkan berdasarkan waktu pembuatan transaksi
        `;
        
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        throw new Error(`Error fetching transactions: ${error.message}`);
    }
};



