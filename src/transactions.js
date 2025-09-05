export const TransactionTypes = Object.freeze({
    BUY: "buy",
    SELL: "sell",
    DEPOSIT: "deposit",
    WITHDRAW: "withdraw",
});

export function calculateBalances(transactions) {
    let balance = 0;
    let injected = 0;
    transactions.forEach((transaction) => {
        switch (transaction.type) {
            case TransactionTypes.DEPOSIT:
                balance += transaction.amount;
                injected += transaction.amount;
                break;
            case TransactionTypes.WITHDRAW:
                balance -= transaction.amount;
                injected -= transaction.amount;
                break;
            default:
                break;
        }
    });
    return [balance, injected];
}

export function buildTradesList(transactions) {
    let trades = [];
    transactions.forEach((transaction) => {
        switch (transaction.type) {
            case TransactionTypes.BUY:
                const newTrade = {
                    type: TransactionTypes.BUY,
                    opening_transaction: transaction,
                    closed: false,
                };
                trades.push(newTrade);
                break;
            case TransactionTypes.SELL:
                let transactionMatched = false;
                for (let i = 0; i < trades.length; i++) {
                    let trade = trades[i];
                    if (
                        !trade.closed &&
                        trade.type === TransactionTypes.BUY &&
                        trade.opening_transaction?.stock ===
                            transaction.stock &&
                        transaction.date <= trade.opening_transaction?.date
                    ) {
                        trade.closing_transaction = transaction;
                        trade.closed = true;
                        transactionMatched = true;
                        break;
                    }
                }
                if (!transactionMatched) {
                    const newTrade = {
                        type: TransactionTypes.SELL,
                        closing_transaction: transaction,
                        closed: false,
                    };
                    trades.push(newTrade);
                }
                break;
            default:
                break;
        }
    });
    console.log("trades", trades);
    return trades;
}
