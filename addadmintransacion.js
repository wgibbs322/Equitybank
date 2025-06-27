document.addEventListener('DOMContentLoaded', () => {
  const adminCodeInput = document.getElementById('admin-code');
  const adminPanel = document.getElementById('admin-panel');
  const transactionBody = document.getElementById('transaction-body');
  const balanceElement = document.getElementById('balance-amount');
  const API_BASE = 'https://equitybackend.onrender.com/api/admin';

  const formatCurrency = amount => amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Admin code unlock
  window.checkAdminCode = () => {
    const isAdmin = adminCodeInput.value === '3237';
    adminPanel.style.display = isAdmin ? 'block' : 'none';
    document.querySelectorAll('.admin-controls').forEach(el => {
      el.style.display = isAdmin ? 'table-cell' : 'none';
    });
  };

  // ✅ Load transactions only from backend
  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/addadmingetAllTransactions`);
      const data = await res.json();

      // ❌ Clear dynamic rows only (leave static rows untouched)
      transactionBody.querySelectorAll('tr.dynamic-row').forEach(tr => tr.remove());

      // ✅ Append backend data as new rows
      data.forEach(tx => {
        if (!tx._id || !tx.createdAt) return;

        const tr = document.createElement('tr');
        tr.classList.add('dynamic-row');
        tr.setAttribute('data-id', tx._id);
        tr.innerHTML = `
          <td>${formatDate(tx.createdAt)}</td>
          <td>${tx.description}</td>
          <td>${tx.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(tx.amount))}</td>
          <td>${tx.status === 'Applied' ? formatCurrency(tx.balanceAfter) : tx.status}</td>
          <td class="admin-controls" style="display: none;">
            <button onclick="deleteTransaction('${tx._id}', this)">Delete</button>
          </td>
        `;
        transactionBody.appendChild(tr);
      });

      checkAdminCode();
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  // ✅ Submit transaction — only reload list
  window.submitAdminTransaction = async (e) => {
    e.preventDefault();
    const desc = document.getElementById('admin-desc').value;
    const amt = parseFloat(document.getElementById('admin-amount').value);
    const balanceAfter = parseFloat(document.getElementById('admin-balance').value);

    try {
      const res = await fetch(`${API_BASE}/addadmintransaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, amount: amt, balanceAfter })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error adding transaction');

      document.getElementById('admin-transaction-form').reset();

      // ✅ No manual row insertion — reload all
      await loadTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Delete
  window.deleteTransaction = async (id, btn) => {
    try {
      const res = await fetch(`${API_BASE}/addadmindeleteTransaction/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      btn.closest('tr').remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Update balance
  window.updateMainBalance = async (e) => {
    e.preventDefault();
    const newAmount = parseFloat(document.getElementById('new-balance').value);

    try {
      const res = await fetch(`${API_BASE}/addadminupdateBalance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: newAmount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      balanceElement.textContent = formatCurrency(data.amount);
      document.getElementById('update-balance-form').reset();
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Load balance
  const loadBalance = async () => {
    try {
      const res = await fetch(`${API_BASE}/addadmingetBalance`);
      const data = await res.json();
      if (data.amount !== undefined) {
        balanceElement.textContent = formatCurrency(data.amount);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  // ✅ Initial run
  loadBalance();
  loadTransactions();
});