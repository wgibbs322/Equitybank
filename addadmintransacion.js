let isAdmin = false;

function unlockAdminPanel() {
  const code = document.getElementById('admin-code').value;
  if (code === '3237') {
    isAdmin = true;
    document.getElementById('admin-panel').style.display = 'block';

    // Show admin table columns and delete buttons if they exist already
    document.querySelectorAll('.admin-action').forEach(el => el.style.display = 'table-cell');
    document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'inline-block');

    Swal.fire("Unlocked", "Admin panel activated!", "success");
  } else {
    Swal.fire("Access Denied", "Incorrect admin code", "error");
  }
}

async function submitAdminTransaction(e) {
  e.preventDefault();
  const description = document.getElementById('admin-desc').value;
  const amount = parseFloat(document.getElementById('admin-amount').value);
  const balanceUpdate = parseFloat(document.getElementById('admin-balance').value);

  try {
    const response = await fetch('https://equitybackend.onrender.com/api/transactions/addadminaddtransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, amount, balanceUpdate })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire("Added", "Transaction added and will update after 3 hours.", "info");
      document.getElementById('admin-transaction-form').reset();
      fetchAndRenderTransactions();
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

async function updateMainBalance(e) {
  e.preventDefault();
  const newAmount = parseFloat(document.getElementById('new-balance').value);

  try {
    const res = await fetch('https://equitybackend.onrender.com/api/addadminavailablebalance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newAmount })
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById('balance-amount').textContent = `$${newAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      Swal.fire("Success", "Balance updated", "success");
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

async function fetchAndRenderTransactions() {
  const res = await fetch('https://equitybackend.onrender.com/api/transactions/addadmingettransaction');
  const transactions = await res.json();

  const tbody = document.querySelector('.transaction-history tbody');
  tbody.innerHTML = '';

  transactions.forEach(tx => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
      <td>${tx.description}</td>
      <td>${tx.amount < 0 ? `-$${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `+$${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</td>
      <td>${typeof tx.status === 'number' ? `$${tx.status.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : tx.status}</td>
      <td class="admin-action" style="display: ${isAdmin ? 'table-cell' : 'none'};">
        <button class="delete-btn" style="display: ${isAdmin ? 'inline-block' : 'none'}; background:red; color:white; border:none; padding:5px 10px; border-radius:4px;" onclick="deleteTransaction('${tx._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function deleteTransaction(id) {
  if (!confirm('Delete this transaction?')) return;

  try {
    const res = await fetch(`https://equitybackend.onrender.com/api/transactions/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      Swal.fire("Deleted", "Transaction removed", "success");
      fetchAndRenderTransactions();
    } else {
      throw new Error("Failed to delete");
    }
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('https://equitybackend.onrender.com/api/transactions/addadminbalance');
  const data = await res.json();

  document.getElementById('balance-amount').textContent = `$${data.available.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  fetchAndRenderTransactions();
});
