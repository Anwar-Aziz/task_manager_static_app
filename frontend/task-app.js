let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const filtered = tasks.filter(t => 
    currentFilter === 'all' ? true :
    currentFilter === 'active' ? !t.completed :
    t.completed
  );

  taskList.innerHTML = '';
  if (filtered.length === 0) {
    taskList.innerHTML = '<div class="empty">No tasks to show.</div>';
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
      </div>
      <div class="btns">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  totalTasksEl.textContent = `${total} task${total!==1?'s':''}`;
  completedTasksEl.textContent = `${completed} completed`;
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return alert('Please enter a task!');
  tasks.unshift({ id: Date.now().toString(), text, completed: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.completed = !t.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  if (!confirm(`Delete task: "${t.text}"?`)) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id, li) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  const span = li.querySelector('.task-text');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = t.text;
  li.querySelector('.task-left').replaceChild(input, span);
  const btns = li.querySelector('.btns');
  btns.innerHTML = '<button class="save-btn">Save</button><button class="cancel-btn">Cancel</button>';

  btns.querySelector('.save-btn').onclick = () => {
    const val = input.value.trim();
    if (!val) return alert('Task cannot be empty');
    t.text = val;
    saveTasks();
    renderTasks();
  };
  btns.querySelector('.cancel-btn').onclick = renderTasks;
}

// ---------- Events ----------
addBtn.onclick = addTask;
taskInput.addEventListener('keydown', e => { if (e.key==='Enter') addTask(); });

filterBtns.forEach(btn => {
  btn.onclick = () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle('active', b===btn));
    renderTasks();
  };
});

taskList.addEventListener('click', e => {
  const li = e.target.closest('li.task-item');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.matches('input[type="checkbox"]')) toggleTask(id);
  else if (e.target.matches('.delete-btn')) deleteTask(id);
  else if (e.target.matches('.edit-btn')) editTask(id, li);
});

// Initial render
renderTasks();

