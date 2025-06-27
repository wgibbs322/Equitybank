// === public/addadmintransaction.js ===
document.addEventListener('DOMContentLoaded', () => {
  const adminCodeInput = document.getElementById('admin-code');
  const adminPanel = document.getElementById('admin-panel');
  const transactionBody = document.getElementById('transaction-body');
  const balanceElement = document.getElementById('balance-amount');
  const API_BASE = 'https://equitybackend.onrender.com/api/admin';

  // Helper: format currency
  const formatCurrency = amount => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Helper: format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
  };

  // Admin Code Check
  window.checkAdminCode = () => {
    if (adminCodeInput.value === '3237') {
      adminPanel.style.display = 'block';
      document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'table-cell');
    } else {
      adminPanel.style.display = 'none';
      document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'none');
    }
  };

  // Load Transactions
  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/addadmingetAllTransactions`);
      const data = await res.json();

      transactionBody.innerHTML = '';

      data.forEach(tx => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatDate(tx.createdAt)}</td>
          <td>${tx.description}</td>
          <td>${tx.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(tx.amount))}</td>
          <td>${tx.status === 'Applied' && tx.balanceAfter ? formatCurrency(tx.balanceAfter) : tx.status}</td>
          <td class="admin-controls" style="display: none;">
            <button onclick="deleteTransaction('${tx._id}', this)">Delete</button>
          </td>
        `;
        transactionBody.appendChild(tr);
      });

      // Show delete buttons if admin code is correct
      checkAdminCode();
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  // Add Transaction
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
      tr.innerHTML = `
        <td>${formatDate(data.createdAt)}</td>
        <td>${data.description}</td>
        <td>${amt >= 0 ? '+' : '-'}${formatCurrency(Math.abs(amt))}</td>
        <td>${data.status}</td>
        <td class="admin-controls" style="display: table-cell;">
          <button onclick="deleteTransaction('${data._id}', this)">Delete</button>
        </td>
      `;
      transactionBody.prepend(tr);
      document.getElementById('admin-transaction-form').reset();
      checkAdminCode(); // Re-check for visibility
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Transaction
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

  // Update Balance
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

  // Load Current Balance
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

  // Initial Load
  loadBalance();
  loadTransactions();
});
