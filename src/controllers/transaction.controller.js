const TransactionRepository = require('../repositories/transaction.repository');
const baseResponse = require('../utils/baseResponse');

exports.createTransaction = async (req, res) => {
    try {
        const { user_id, item_id, quantity } = req.body;
        const transaction = await TransactionRepository.createTransaction({ user_id, item_id, quantity });

        return baseResponse(res, true, 201, "Transaction created", transaction);

    } catch (err) {
        return baseResponse(res, false, 400, err.message, null);
    }
};

exports.payTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await TransactionRepository.payTransaction(id);

        return baseResponse(res, true, 200, "Payment successful", transaction);
    } catch (err) {
        return baseResponse(res, false, 404, err.message, null);
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await TransactionRepository.deleteTransaction(id);

        return baseResponse(res, true, 200, "Transaction deleted", transaction);
    } catch (err) {
        return baseResponse(res, false, 404, err.message, null);
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await TransactionRepository.getAllTransactions();
        return baseResponse(res, true, 200, "Transactions Found", transactions);
    } catch (err) {
        return baseResponse(res, false, 404, `Something went wrong: ${err.message}`, null);
    }
};