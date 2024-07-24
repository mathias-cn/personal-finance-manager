function renderTransactions(transactionData) {
    const transaction = createElement('div', 'transaction')
    transaction.id = `transaction-${transactionData.id}`
    const left = createElement('div', 'left')
    const right = createElement('div', 'right')
    
    const transactionId = createElement('span', 'transaction-id')
    transactionId.textContent = checkIdLength(transactionData.id)
    const transactionName = createElement('span', 'transaction-title')
    transactionName.textContent = transactionData.name
    const transactionValue = createElement('span', 'transaction-value')
    if (transactionData.action == 0) {
        transactionValue.textContent = `-$${transactionData.value.toFixed(2)}`
        transactionValue.classList.add('negative')
    } else {
        transactionValue.textContent = `+$${transactionData.value.toFixed(2)}`
        transactionValue.classList.add('positive')
    }

    left.append(transactionId, transactionName)
    right.append(transactionValue)
    transaction.append(left, right)
    document.querySelector('.transactions-list').prepend(transaction)

    function checkIdLength(id) {
        if (id < 10) {
            return `#0${id}. `
        } else {
            return `#${id}. `
        }
    }
}

function totalBalance(transactions) {
    let positiveBalance = transactions.filter(transaction => transaction.action == 1)
    let negativeBalance = transactions.filter(transaction => transaction.action == 0)
    
    let positiveBalanceVal = positiveBalance.reduce((acc, curr) => acc + curr.value, 0)
    let negativeBalanceVal = negativeBalance.reduce((acc, curr) => acc - curr.value, 0)

    return negativeBalanceVal + positiveBalanceVal
}

async function updateBalance() {
    const transactions = await fetch(`${window.location.href}transactions`).then(res => res.json())
    
    document.querySelector('.balance-value').textContent = totalBalance(transactions).toFixed(2)
}

async function fetchTransactions() {
    const transactions = await fetch(`${window.location.href}transactions`).then(res => res.json())
    transactions.forEach(renderTransactions)
    
    document.querySelector('.balance-value').textContent = totalBalance(transactions).toFixed(2)
}
document.addEventListener('DOMContentLoaded', () => { fetchTransactions() })

let formToggleBtns = Array.from(document.querySelectorAll('.form-navbar-btn'))
formToggleBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        if(!btn.classList.contains('active')) {
            document.querySelector('.active').classList.remove('active')
            btn.classList.add('active')
            
            handleForm(index)
        }
    })
})

function handleForm(index) {
    let form = document.querySelector('.transaction-form.active')
    if (index == 0) {
        document.querySelector('.transaction-form.active').innerHTML = ''
        const addName = createInputs('text', 'transactionName', 'Transaction Name')
        const addValue = createInputs('number', 'transactionValue', 'Transaction Value')
        addValue.step = '.01'
        const addbtn = createElement('button', 'form-btn')
        addbtn.textContent = 'Add Transaction'
        form.append(addName, addValue, addbtn)
    } else if (index == 1) {
        document.querySelector('.transaction-form.active').innerHTML = ''
        const editId = createInputs('text', 'editId', 'Transaction Id')
        const editName = createInputs('text', 'editName', 'Edit Name')
        const editValue = createInputs('number', 'editValue', 'Edit Value')
        editValue.step = '.01'
        const editbtn = createElement('button', 'form-btn')
        editbtn.textContent = 'Edit Transaction'
        form.append(editId, editName, editValue, editbtn)
    } else {
        document.querySelector('.transaction-form.active').innerHTML = ''
        const deleteId = createInputs('text', 'deleteId', 'Transaction Id')
        const deletebtn = createElement('button', 'form-btn')
        deletebtn.textContent = 'Delete Transaction'
        form.append(deleteId, deletebtn)
    }
}

function createElement(tagName, className) {
    const element = document.createElement(tagName)
    element.classList.add(className)
    return element
}
function createInputs(type, id, placeholder) {
    let input = createElement('input', 'input')
    input.type = type
    input.id = id
    input.name = input.id
    input.placeholder = placeholder
    return input
}

let form = document.querySelector('.transaction-form.active')
form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    let activeIndex
    formToggleBtns.forEach((btn, index) => {
        if (btn.classList.contains('active')) {
            activeIndex = index
        }
    })
    if (activeIndex == 0) {
        const newTransactionData = {
            name: document.querySelector('#transactionName').value,
            value: document.querySelector('#transactionValue').value
        }
        if (Array.from(newTransactionData.value)[0] == '-') {
            let newVal = newTransactionData.value.slice(1)
            newTransactionData.value = Number(newVal)
            newTransactionData.action = 0
        } else {
            newTransactionData.value = Number(newTransactionData.value)
            newTransactionData.action = 1
        }
        const response = await fetch(`${window.location.href}transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTransactionData)
        })

        const newTransaction = await response.json()
        form.reset()
        renderTransactions(newTransaction)
        updateBalance()
    } else if (activeIndex == 2) {
        const deleteTransaction = Number(document.querySelector('#deleteId').value)
        const response = await fetch(`/transactions/${deleteTransaction}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        document.querySelector('.transactions-list').innerHTML = ''
        form.reset()
        fetchTransactions()
    } else {
        const editId = Number(document.querySelector('#editId').value)
        const editTransaction = {
            name: document.querySelector('#editName').value,
            value: document.querySelector('#editValue').value
        }
        if (Array.from(editTransaction.value)[0] == '-') {
            let newVal = editTransaction.value.slice(1)
            editTransaction.value = Number(newVal)
            editTransaction.action = 0
        } else {
            editTransaction.value = Number(editTransaction.value)
            editTransaction.action = 1
        }
        const response = await fetch(`/transactions/${editId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editTransaction)
        })
        // const editedTransaction = await response.json()
        document.querySelector('.transactions-list').innerHTML = ''
        form.reset()
        fetchTransactions().then(() => {
            updateBalance()
        })
    }
})
