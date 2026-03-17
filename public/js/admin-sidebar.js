// Admin sidebar toggle for mobile
function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btn = document.getElementById('admin-hamburger');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  backdrop && backdrop.classList.toggle('open');
  btn && btn.classList.toggle('open');
}

// Close sidebar when backdrop clicked
document.addEventListener('DOMContentLoaded', () => {
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', toggleAdminSidebar);
});
