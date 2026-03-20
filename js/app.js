// Script para el manejador del Dashboard (Ingresos y Gastos)
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Si estamos en auth y no hemos entrado, redirigimos a index
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = session.user;
    const userEmailSpan = document.getElementById('user-email');
    if (userEmailSpan) {
        userEmailSpan.textContent = currentUser.email;
    }

    // Cerrar sesión
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    });

    // Cargar datos inicales
    loadData();

    // Eventos de los formularios
    const formIncome = document.getElementById('form-income');
    if (formIncome) {
        formIncome.addEventListener('submit', async (e) => {
            e.preventDefault();
            const desc = document.getElementById('inc-desc').value;
            const amount = parseFloat(document.getElementById('inc-amount').value);
            await createTransaction('incomes', desc, amount);
            formIncome.reset();
        });
    }

    const formExpense = document.getElementById('form-expense');
    if (formExpense) {
        formExpense.addEventListener('submit', async (e) => {
            e.preventDefault();
            const desc = document.getElementById('exp-desc').value;
            const amount = parseFloat(document.getElementById('exp-amount').value);
            await createTransaction('expenses', desc, amount);
            formExpense.reset();
        });
    }
});

async function loadData() {
    // Cargar incomes
    const { data: incomes, error: errInc } = await supabaseClient
        .from('incomes')
        .select('*')
        .order('created_at', { ascending: false });

    // Cargar expenses
    const { data: expenses, error: errExp } = await supabaseClient
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

    if (errInc || errExp) {
        console.error("Error al cargar datos", errInc || errExp);
        return;
    }

    renderLists(incomes, expenses);
    updateSummary(incomes, expenses);
}

function renderLists(incomes, expenses) {
    const listIncomes = document.getElementById('list-incomes');
    const listExpenses = document.getElementById('list-expenses');

    listIncomes.innerHTML = '';
    listExpenses.innerHTML = '';

    incomes.forEach(inc => {
        listIncomes.appendChild(createListItem(inc, 'inc', 'incomes'));
    });

    expenses.forEach(exp => {
        listExpenses.appendChild(createListItem(exp, 'exp', 'expenses'));
    });
}

function createListItem(item, type, table) {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    
    // Formatear fecha a DD/MM/YYYY
    const date = new Date(item.created_at).toLocaleDateString('es-ES');
    const sign = type === 'inc' ? '+' : '-';
    
    li.innerHTML = `
        <div class="item-info">
            <span class="item-desc">${escapeHTML(item.description)}</span>
            <span class="item-date">${date}</span>
        </div>
        <div style="display: flex; align-items: center;">
            <span class="item-amount ${type}">${sign}$${parseFloat(item.amount).toFixed(2)}</span>
            <div class="item-actions">
                <button onclick="deleteTransaction('${table}', '${item.id}')" title="Eliminar">✕</button>
            </div>
        </div>
    `;
    return li;
}

function updateSummary(incomes, expenses) {
    const sumInc = incomes.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const sumExp = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const balance = sumInc - sumExp;

    document.getElementById('total-income').textContent = `$${sumInc.toFixed(2)}`;
    document.getElementById('total-expense').textContent = `$${sumExp.toFixed(2)}`;
    
    const balanceEl = document.getElementById('total-balance');
    balanceEl.textContent = `$${balance.toFixed(2)}`;
    
    if (balance < 0) {
        balanceEl.className = 'text-danger';
    } else {
        balanceEl.className = 'text-success';
    }
}

async function createTransaction(table, description, amount) {
    try {
        const payload = {
            user_id: currentUser.id,
            description,
            amount,
            date: new Date().toISOString().split('T')[0]
        };

        const { data, error } = await supabaseClient
            .from(table)
            .insert([payload]);

        if (error) throw error;
        
        // Recargar datos
        loadData();
    } catch (error) {
        alert('Error al crear: ' + error.message);
    }
}

window.deleteTransaction = async function(table, id) {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
        const { error } = await supabaseClient.from(table).delete().eq('id', id);
        if (error) throw error;
        loadData();
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
}

// Utilidad simple para prevenir XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}
