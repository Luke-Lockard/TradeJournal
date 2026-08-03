import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./App.css";
import {
    TransactionTypes,
    calculateBalances,
    buildTradesList,
} from "./transactions";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import {
    ButtonGroup,
    Col,
    Form,
    FormGroup,
    Row,
    Stack,
    Table,
    ToggleButton,
} from "react-bootstrap";

const initialTransactions = [
    {
        type: TransactionTypes.DEPOSIT,
        stock: null,
        shares: null,
        price: null,
        amount: 10000,
        date: new Date(),
    },
    {
        type: TransactionTypes.BUY,
        stock: "TSLA",
        shares: 10,
        price: 274,
        amount: 2740,
        date: new Date(),
    },
    {
        type: TransactionTypes.SELL,
        stock: "TSLA",
        shares: 10,
        price: 300,
        amount: 3000,
        date: new Date(),
    },
];

function App() {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [trades, setTrades] = useState([]);
    const [balance, setBalance] = useState(0);
    const [invested, setInvested] = useState(0);
    const [injected, setInjected] = useState(0);
    const [profit, setProfit] = useState(0);

    function handleCreateTransaction(type, stock, shares, price, amount, date) {
        const newTransaction = {
            type,
            stock,
            shares,
            price,
            amount,
            date,
        };
        setTransactions((cur) => [...cur, newTransaction]);
    }

    useEffect(() => {
        const [balance, injected] = calculateBalances(transactions);
        setBalance(balance);
        setInjected(injected);
        setTrades(buildTradesList(transactions));
        console.log("transactions", transactions);
    }, [transactions]);

    return (
        <Container>
            <h1>Trading Journal</h1>
            <Balances
                balance={balance}
                injected={injected}
                invested={invested}
                profit={profit}
            />
            <br />
            <Row>
                <Col>
                    <TradeForm onCreateTransaction={handleCreateTransaction} />
                </Col>
                <Col>
                    <DepositAndWithdrawalForm
                        onCreateTransaction={handleCreateTransaction}
                    />
                </Col>
            </Row>
            <br />
            <TransactionTable transactions={transactions} />
            <br />
            <TradesTable trades={trades} />
        </Container>
    );
}

Balances.propTypes = {
    balance: PropTypes.number.isRequired,
    invested: PropTypes.number.isRequired,
    injected: PropTypes.number.isRequired,
    profit: PropTypes.number.isRequired,
};

function Balances({ balance, invested, injected, profit }) {
    return (
        <Stack direction="horizontal" gap={3}>
            <Form.Group>
                <Form.Label>Account Balance</Form.Label>
                <Form.Control type="text" disabled value={balance} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Invested</Form.Label>
                <Form.Control type="text" disabled value={invested} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Injected</Form.Label>
                <Form.Control type="text" disabled value={injected} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Profit</Form.Label>
                <Form.Control type="text" disabled value={profit} />
            </Form.Group>
        </Stack>
    );
}

TradeForm.propTypes = {
    onCreateTransaction: PropTypes.func.isRequired,
};

function TradeForm({ onCreateTransaction }) {
    const [transactionType, setTransactionType] = useState(
        TransactionTypes.BUY
    );
    const [stock, setStock] = useState("");
    const [shares, setShares] = useState("");
    const [price, setPrice] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const total = Number(shares) * Number(price);

    function handleSubmit(e) {
        e.preventDefault();
        if (!transactionType || !stock || !shares || !price || !date) return;

        onCreateTransaction(
            transactionType,
            stock,
            shares,
            price,
            total,
            new Date(date)
        );
    }

    function handleChangeStock(value) {
        if (value !== "" && !isNaN(Number(value))) return;
        setStock(value.toUpperCase());
    }

    function handleChangeShares(value) {
        if (value !== "" && isNaN(Number(value))) return;
        setShares(value);
    }

    function handleChangePrice(value) {
        if (value !== "" && isNaN(Number(value))) return;
        setPrice(value);
    }

    return (
        <Form className="form" onSubmit={(e) => handleSubmit(e)}>
            <h2>Enter a Trade</h2>
            <ButtonGroup>
                <ToggleButton
                    type="radio"
                    id="radio-buy"
                    variant={
                        transactionType === TransactionTypes.BUY
                            ? "success"
                            : "light"
                    }
                    checked={transactionType === TransactionTypes.BUY}
                    onChange={() => setTransactionType(TransactionTypes.BUY)}
                >
                    Buy
                </ToggleButton>
                <ToggleButton
                    type="radio"
                    id="radio-sell"
                    variant={
                        transactionType === TransactionTypes.SELL
                            ? "danger"
                            : "light"
                    }
                    checked={transactionType === TransactionTypes.SELL}
                    onChange={() => setTransactionType(TransactionTypes.SELL)}
                >
                    Sell
                </ToggleButton>
            </ButtonGroup>
            <FormGroup>
                <Form.Label>Stock</Form.Label>
                <Form.Control
                    type="text"
                    value={stock}
                    onChange={(e) => handleChangeStock(e.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Shares</Form.Label>
                <Form.Control
                    type="text"
                    value={shares}
                    onChange={(e) => handleChangeShares(e.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Price</Form.Label>
                <Form.Control
                    type="text"
                    value={price}
                    onChange={(e) => handleChangePrice(e.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Total</Form.Label>
                <Form.Control type="text" disabled value={total} />
            </FormGroup>
            <FormGroup>
                <Form.Label>Date</Form.Label>
                <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </FormGroup>
            <br />
            <Button type="submit">Submit</Button>
        </Form>
    );
}

DepositAndWithdrawalForm.propTypes = {
    onCreateTransaction: PropTypes.func.isRequired,
};

function DepositAndWithdrawalForm({ onCreateTransaction }) {
    const [transactionType, setTransactionType] = useState(
        TransactionTypes.DEPOSIT
    );
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    function handleSubmit(e) {
        e.preventDefault();
        if (!amount || !date) return;
        onCreateTransaction(
            transactionType,
            null,
            null,
            null,
            amount,
            new Date(date)
        );
    }

    function handleChangeAmount(value) {
        if (value !== "" && isNaN(value)) return;
        setAmount(value);
    }

    return (
        <Form className="form" onSubmit={(e) => handleSubmit(e)}>
            <h2>Deposit or Withdraw</h2>
            <ButtonGroup>
                <ToggleButton
                    type="radio"
                    id="radio-deposit"
                    variant={
                        transactionType === TransactionTypes.DEPOSIT
                            ? "success"
                            : "light"
                    }
                    value={TransactionTypes.DEPOSIT}
                    checked={transactionType === TransactionTypes.DEPOSIT}
                    onChange={() =>
                        setTransactionType(TransactionTypes.DEPOSIT)
                    }
                >
                    Deposit
                </ToggleButton>
                <ToggleButton
                    type="radio"
                    id="radio-withdraw"
                    variant={
                        transactionType === TransactionTypes.WITHDRAW
                            ? "warning"
                            : "light"
                    }
                    value={TransactionTypes.WITHDRAW}
                    checked={transactionType === TransactionTypes.WITHDRAW}
                    onChange={() =>
                        setTransactionType(TransactionTypes.WITHDRAW)
                    }
                >
                    Withdraw
                </ToggleButton>
            </ButtonGroup>
            <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                    type="text"
                    value={amount}
                    onChange={(e) => handleChangeAmount(e.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </Form.Group>
            <br />
            <Button>Submit</Button>
        </Form>
    );
}

TransactionTable.propTypes = {
    transactions: PropTypes.array.isRequired,
};

function TransactionTable({ transactions }) {
    return (
        <div>
            <h2>Transactions</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Transaction Type</th>
                        <th>Stock</th>
                        <th>Shares</th>
                        <th>Price</th>
                        <th>Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions &&
                        transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{transaction.type.toUpperCase()}</td>
                                <td>{transaction.stock}</td>
                                <td>{transaction.shares}</td>
                                <td>{transaction.price}</td>
                                <td>{transaction.amount}</td>
                                <td>
                                    {
                                        transaction.date
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </div>
    );
}

TradesTable.propTypes = {
    trades: PropTypes.array.isRequired,
};

function TradesTable({ trades }) {
    return (
        <div>
            <h2>Trades</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th></th>
                        <th colSpan={5}>Opening Transaction</th>
                        <th colSpan={4}>Closing Transaction</th>
                        <th></th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Stock</th>
                        <th>Shares</th>
                        <th>Price</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Shares</th>
                        <th>Price</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Profit/Loss</th>
                    </tr>
                </thead>
                <tbody>
                    {trades &&
                        trades.map((trade, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{trade.opening_transaction?.stock}</td>
                                <td>{trade.opening_transaction?.shares}</td>
                                <td>{trade.opening_transaction?.price}</td>
                                <td>{trade.opening_transaction?.amount}</td>
                                <td>
                                    {
                                        trade.opening_transaction?.date
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                </td>
                                <td>{trade.closing_transaction?.shares}</td>
                                <td>{trade.closing_transaction?.price}</td>
                                <td>{trade.closing_transaction?.amount}</td>
                                <td>
                                    {
                                        trade.closing_transaction?.date
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                </td>
                                <td>
                                    {trade.closing_transaction?.amount &&
                                        trade.opening_transaction?.amount &&
                                        trade.closing_transaction?.amount -
                                            trade.opening_transaction?.amount}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </div>
    );
}

export default App;
