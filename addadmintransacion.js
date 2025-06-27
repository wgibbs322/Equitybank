document.addEventListener('DOMContentLoaded', () => {
  const adminCodeInput = document.getElementById('admin-code');
  const adminPanel = document.getElementById('admin-panel');
  const transactionBody = document.getElementById('transaction-body');
  const balanceElement = document.getElementById('balance-amount');
  const API_BASE = 'https://equitybackend.onrender.com/api/admin';

  let isAdmin = false; // Track admin access

  // Format currency to USD
  const formatCurrency = amount => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Format date safely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('en-US');
  };

  // Render a single transaction row
  const renderTransactionRow = (tx) => {
    const formattedDate = formatDate(tx.createdAt || tx.date);
    return `
      <tr>
        <td>${formattedDate}</td>
        <td>${tx.description}</td>
        <td>${tx.amount >= 0 ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}</td>
        <td>${tx.status || 'Pending'}</td>
        <td class="admin-controls" style="${isAdmin ? '' : 'display:none'}">
          <button onclick="deleteTransaction('${tx._id}', this)">Delete</button>
        </td>
      </tr>
    `;
  };

  // Show admin panel
  window.checkAdminCode = () => {
    if (adminCodeInput.value === '3237') {
      isAdmin = true;
      adminPanel.style.display = 'block';
      document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'table-cell');
    }
  };

  // Submit a new admin transaction
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

      const tr = document.createElement('tr');
      tr.innerHTML = renderTransactionRow(data);
      transactionBody.prepend(tr);
      document.getElementById('admin-transaction-form').reset();
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

  // Update the available balance
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

  // Load all existing transactions
  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/addadmingetTransactions`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid transaction list');
      transactionBody.innerHTML = ''; // Clear existing
      data.reverse().forEach(tx => {
        const tr = document.createElement('tr');
        tr.innerHTML = renderTransactionRow(tx);
        transactionBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error loading transactions:', err.message);
    }
  };

  // Load current balance
  const loadBalance = async () => {
    try {
      const res = await fetch(`${API_BASE}/addadmingetBalance`);
      const data = await res.json();
      if (data.amount) balanceElement.textContent = formatCurrency(data.amount);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  // Initial data load
  loadBalance();
  loadTransactions();
});