$(function(){

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let currentFilter = 'all';
let searchQuery = '';
let sortField = null;
let sortDir = 'asc';
let currentPage = 1;
const pageSize = 10;

const table = document.getElementById('taskTable');

/* SAVE */
function save(){
localStorage.setItem('tasks', JSON.stringify(tasks));
}

/* =========================
   3-STATE DUE LOGIC
========================= */
function getRowStatus(dateStr){

if(!dateStr) return 'success';

const today = new Date();
today.setHours(0,0,0,0);

const due = new Date(dateStr);
due.setHours(0,0,0,0);

const diff = (due - today) / (1000 * 60 * 60 * 24);

if(diff < 0) return 'danger';
if(diff <= 3) return 'warning';
return 'success';
}

/* STATUS TEXT */
function getStatus(t){
  return t.done ? 'Completed' : 'Active';
}

/* FILTER + SEARCH + SORT */
function getData(){

return tasks.filter(t=>{

if(currentFilter==='active' && t.done) return false;
if(currentFilter==='completed' && !t.done) return false;
if(currentFilter==='overdue' && getRowStatus(t.date)!=='danger') return false;

if(searchQuery && !(t.text||'').toLowerCase().includes(searchQuery)) return false;

return true;

}).sort((a,b)=>{

if(!sortField) return 0;

let A='',B='';

switch(sortField){
case 'text': A=a.text.toLowerCase(); B=b.text.toLowerCase(); break;
case 'priority':
  A = (a.priority || 'None').toLowerCase();
  B = (b.priority || 'None').toLowerCase();
  break;
case 'date': A=a.date; B=b.date; break;
case 'status':
  return sortDir === 'asc'
    ? (a.done === b.done ? 0 : a.done ? 1 : -1)
    : (a.done === b.done ? 0 : a.done ? -1 : 1);
default: A=String(a.done); B=String(b.done);
}

return sortDir==='asc' ? A.localeCompare(B) : B.localeCompare(A);

});

}

/* COUNTS (FIXED) */
function updateCounts(){

$('#c-all').text(tasks.length);
$('#c-active').text(tasks.filter(t=>!t.done).length);
$('#c-completed').text(tasks.filter(t=>t.done).length);
$('#c-overdue').text(tasks.filter(t=>getRowStatus(t.date)==='danger').length);

}

/* RENDER */
function render(){

const allData = getData();

const totalPages = Math.ceil(allData.length / pageSize) || 1;

if (currentPage > totalPages) currentPage = totalPages;

updatePaginationState(totalPages);
updatePagination(allData.length ? totalPages : 1);

const start = (currentPage - 1) * pageSize;
const data = allData.slice(start, start + pageSize);

table.innerHTML = '';

if(!data.length){
table.innerHTML = '<tr><td colspan="6" class="text-center">No tasks</td></tr>';
updateCounts();
updatePagination(totalPages);
updateSortIcons();
return;
}

data.forEach(t=>{

const tr = document.createElement('tr');

const rowClass = getRowStatus(t.date);
tr.classList.add(`row-${rowClass}`);

if(t.done) tr.classList.add('done');


tr.innerHTML = `
<td data-label="Done">
    <input type="checkbox" ${t.done?'checked':''}>
</td>

<td data-label="Task" class="task-name">
    ${t.text}
</td>

<td data-label="Priority">
    <span class="badge ${
        t.priority === 'High' ? 'badge-danger' :
        t.priority === 'Medium' ? 'badge-warning' :
        t.priority === 'Low' ? 'badge-success' :
        'badge-secondary'
    }">
        ${t.priority || 'None'}
    </span>
</td>

<td data-label="Due Date">
    ${t.date || '-'}
</td>

<td data-label="Status">
    <span class="badge ${t.done ? 'badge-success' : 'badge-secondary'}">
        ${t.done ? 'Completed' : 'Active'}
    </span>
</td>

<td data-label="Actions" class="task-actions">
    <i class="fas fa-edit text-primary mr-3"></i>
    <i class="fas fa-trash text-danger"></i>
</td>
`;


/* DONE */
tr.querySelector('input').onchange = () => {
t.done = !t.done;
save();
render();
};

/* DELETE */
tr.querySelector('.fa-trash').onclick = () => {
  $('#deleteModal').modal('show');

  $('#confirmDeleteBtn').off().on('click', () => {
    tasks = tasks.filter(x => x.id !== t.id);
    save();
    render();
    $('#deleteModal').modal('hide');
  });
};

/* EDIT */
tr.querySelector('.fa-edit').onclick = () => {

  $('#taskText').val(t.text);
  $('#taskDate').val(t.date);

  const select = $('#taskPriority');

  // reset options (important!)
  select.html(`
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  `);

  // add "None" option ONLY in edit mode
  select.append(`<option value="None">None</option>`);

  // set current value
  select.val(t.priority || 'None');

  $('#taskModal').modal('show');

  $('#saveBtn').off().on('click', () => {
    t.text = $('#taskText').val();
    t.priority = $('#taskPriority').val() || 'None';
    t.date = $('#taskDate').val();

    save();
    render();
    $('#taskModal').modal('hide');
  });
};

table.appendChild(tr);

});

updateCounts();
}

/* SEARCH */
function debounce(fn,ms){
let t;
return function(){
clearTimeout(t);
t=setTimeout(()=>fn.apply(this,arguments),ms);
};
}

function updateSortIcons() {
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('active-sort');

        // default icon
        th.querySelector('.sort-icon').innerHTML =
            '<i class="fas fa-sort"></i>';
    });

    if (!sortField) return;

    const activeTh = document.querySelector(`[data-sort="${sortField}"]`);
    if (!activeTh) return;

    activeTh.classList.add('active-sort');

    activeTh.querySelector('.sort-icon').innerHTML =
        sortDir === 'asc'
        ? '<i class="fas fa-arrow-up"></i>'
        : '<i class="fas fa-arrow-down"></i>';
}

$('#searchInput').on('input', debounce(function(){
searchQuery = $(this).val().toLowerCase();
currentPage = 1;
render();
},300));

/* FILTER */
$('[data-filter]').click(function(){
$('[data-filter]').removeClass('active-filter');
$(this).addClass('active-filter');
currentFilter = $(this).data('filter');
currentPage = 1;
render();
});

/* SORT */
document.querySelectorAll('.sortable').forEach(th => {
    th.onclick = () => {
        const f = th.dataset.sort;

        if (sortField === f) {
            sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = f;
            sortDir = 'asc';
        }

        currentPage = 1;
		updateSortIcons();
		render();
    };
});


/* MOBILE SORT */

let mobileSortDir = 'asc';

$('#mobileSort').on('change', function(){

    sortField = $(this).val();

    if (!sortField) {
        return;
    }

    sortDir = 'asc';
    mobileSortDir = 'asc';

    $('#mobileSortDir').html(
        '<i class="fas fa-arrow-up"></i>'
    );

    currentPage = 1;
    updateSortIcons();
    render();

});

$('#mobileSortDir').on('click', function(){

    if (!sortField) return;

    mobileSortDir = mobileSortDir === 'asc' ? 'desc' : 'asc';

    sortDir = mobileSortDir;

    $(this).html(
        sortDir === 'asc'
        ? '<i class="fas fa-arrow-up"></i>'
        : '<i class="fas fa-arrow-down"></i>'
    );

    currentPage = 1;
    updateSortIcons();
    render();

});


/* DARK MODE */
$('#darkToggle').click(()=>{
$('body').toggleClass('dark');
localStorage.setItem('theme',$('body').hasClass('dark')?'dark':'light');
});

if(localStorage.getItem('theme')==='dark'){
$('body').addClass('dark');
}

/* ADD */
$('#addBtn').click(() => {

  $('#taskText').val('');

  // ✅ RESET dropdown for ADD mode
  $('#taskPriority').html(`
    <option value="" disabled selected>Select Priority</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  `);

  $('#taskDate').val(new Date().toISOString().split('T')[0]);

  $('#taskModal').modal('show');

  $('#saveBtn').off().on('click', () => {

    const text = $('#taskText').val().trim();
    const priority = $('#taskPriority').val() || 'None';
    const date = $('#taskDate').val();

    if (!text) {
      alert("Task is required");
      return;
    }

    tasks.push({
      id: Date.now(),
      text,
      priority,
      date,
      done: false
    });

    save();
    render();
    $('#taskModal').modal('hide');
  });

});

$('#prevPage').click(() => {
  if (currentPage > 1) {
    currentPage--;
    render();
  }
});

$('#nextPage').click(() => {
  const totalPages = Math.ceil(getData().length / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    render();
  }
});

$('#firstPage').click(() => {
  currentPage = 1;
  render();
});

$('#lastPage').click(() => {
  currentPage = Math.ceil(getData().length / pageSize) || 1;
  render();
});

function updatePagination(totalPages){
  const container = $('#pageNumbers');
  container.empty();

  for(let i=1;i<=totalPages;i++){
    const btn = $(`<button class="btn btn-sm btn-outline-secondary">${i}</button>`);

    if(i === currentPage) btn.addClass('active');

    btn.click(() => {
      currentPage = i;
      render();
    });

    container.append(btn);
  }
}

function updatePaginationState(totalPages) {
  // First / Prev
  $('#firstPage, #prevPage').prop('disabled', currentPage === 1);

  // Next / Last
  $('#nextPage, #lastPage').prop('disabled', currentPage === totalPages || totalPages === 0);
}

render();

});

const titleEl = $('#listTitle');

// load saved title
const savedTitle = localStorage.getItem('listTitle');
if (savedTitle) {
  titleEl.text(savedTitle);
}

function saveTitle(value) {
  localStorage.setItem('listTitle', value);
}

// click → turn into input
titleEl.on('click', function () {
  const current = $(this).text().trim();

  const input = $(`<input type="text" class="form-control form-control-sm" />`);
  input.val(current);

  $(this).replaceWith(input);
  input.focus().select();

  input.addClass('editing-title');

  function finishEdit() {
    let value = input.val().trim();
    if (!value) value = 'To Do List';

    const newTitle = $(`<h3 class="card-title mb-0" id="listTitle" style="cursor:pointer;">${value}</h3>`);

    input.replaceWith(newTitle);

    saveTitle(value);

    // re-bind click after replacement
    bindTitleEdit();
  }

  input.on('blur', finishEdit);

  input.on('keydown', function (e) {
    if (e.key === 'Enter') {
      finishEdit();
    }
    if (e.key === 'Escape') {
      const reset = $(`<h3 class="card-title mb-0" id="listTitle" style="cursor:pointer;">${current}</h3>`);
      input.replaceWith(reset);
      bindTitleEdit();
    }
  });
});

function bindTitleEdit() {
  $('#listTitle').on('click', function () {
    const current = $(this).text().trim();

    const input = $(`<input type="text" class="form-control form-control-sm" />`);
    input.val(current);

    $(this).replaceWith(input);
    input.focus().select();

    input.addClass('editing-title');

    function finishEdit() {
      let value = input.val().trim();
      if (!value) value = 'To Do List';

      const newTitle = $(`<h3 class="card-title mb-0" id="listTitle" style="cursor:pointer;">${value}</h3>`);

      input.replaceWith(newTitle);
      saveTitle(value);

      bindTitleEdit();
    }

    input.on('blur', finishEdit);

    input.on('keydown', function (e) {
      if (e.key === 'Enter') finishEdit();
      if (e.key === 'Escape') {
        const reset = $(`<h3 class="card-title mb-0" id="listTitle" style="cursor:pointer;">${current}</h3>`);
        input.replaceWith(reset);
        bindTitleEdit();
      }
    });
  });
}

// initial bind
bindTitleEdit();
//updateSortIcons();