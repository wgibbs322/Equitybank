// === public/addadmintransaction.js ===
document.addEventListener('DOMContentLoaded', () => {
  const adminCodeInput = document.getElementById('admin-code');
  const adminPanel = document.getElementById('admin-panel');
  const transactionBody = document.getElementById('transaction-body');
  const balanceElement = document.getElementById('balance-amount');
  const API_BASE = 'https://equitybackend.onrender.com/api/admin';

  // Helper for currency formatting
  const formatCurrency = amount => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Check for admin code
  window.checkAdminCode = () => {
    if (adminCodeInput.value === '3237') {
      adminPanel.style.display = 'block';
      document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'table-cell');
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

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(data.createdAt).toLocaleDateString()}</td>
        <td>${data.description}</td>
        <td>${amt > 0 ? '+' : ''}${formatCurrency(amt)}</td>
        <td>${data.status}</td>
        <td class="admin-controls"><button onclick="deleteTransaction('${data._id}', this)">Delete</button></td>
      `;
      transactionBody.prepend(tr);
      document.getElementById('admin-transaction-form').reset();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete transaction
  window.deleteTransaction = async (id, btn) => {
    try {
      const res = await fetch(`${API_BASE}/addadmindeleteTransaction/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      btn.closest('tr').remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // Update available balance
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
      if (data.amount) balanceElement.textContent = formatCurrency(data.amount);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  loadBalance();
});
bb