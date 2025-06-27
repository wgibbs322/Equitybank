document.addEventListener('DOMContentLoaded', () => {
  const adminCodeInput = document.getElementById('admin-code');
  const adminPanel = document.getElementById('admin-panel');
  const transactionBody = document.getElementById('transaction-body');
  const balanceElement = document.getElementById('balance-amount');
  const API_BASE = 'https://equitybackend.onrender.com/api/admin';

  // Format currency
  const formatCurrency = amount => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Format date only (MM/DD/YYYY)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Check admin code
  window.checkAdminCode = () => {
    if (adminCodeInput.value === '3237') {
      adminPanel.style.display = 'block';
      document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'table-cell');
    } else {
      adminPanel.style.display = 'none';
      document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'none');
    }
  };

  // Load transactions from backend
  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/addadmingetAllTransactions`);
      const data = await res.json();

      // Clear dynamic rows (keep static headers)
      transactionBody.querySelectorAll('tr:not(.static-row)').forEach(tr => tr.remove());

      data.forEach(tx => {
        if (!tx._id) return;

        const tr = document.createElement('tr');
        tr.classList.add('dynamic-row');
        tr.setAttribute('data-id', tx._id);
        tr.innerHTML = `
          <td>${tx.createdAt ? formatDate(tx.createdAt) : 'N/A'}</td>
          <td>${tx.description}</td>
          <td>${tx.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(tx.amount))}</td>
          <td>${tx.status === 'Applied' && tx.balanceAfter ? formatCurrency(tx.balanceAfter) : tx.status}</td>
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

  // Submit new transaction
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

      // Reload from backend to avoid duplication
      await loadTransactions();

      document.getElementById('admin-transaction-form').reset();
      checkAdminCode();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete a transaction
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

  // Update main balance
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

  // Load current balance
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

  // Initial load
  loadBalance();
  loadTransactions();
});
