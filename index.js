// TASK: import helper functions from utils

import {getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask} from '/utils/taskFunctions.js'

// TASK: import initialData

import * as initialData from '/initialData.js'

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/
// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

initializeData()

// TASK: Get elements from the DOM
const elements = {
//Main Layout Elements:

header: document.getElementById("header"),
headerBoardName: document.getElementById("header-board-name"),
addNewTaskBtn: document.getElementById("add-new-task-btn"),
editBoardBtn: document.getElementById("edit-board-btn"),
dropDownBtn: document.getElementById("dropdownBtn"),
deleteBoardBtn: document.getElementById("deleteBoardBtn"),



//Sidebar
sideBar: document.querySelector(".side-bar"),
sideLogoDiv: document.getElementById("side-logo-div"),
sideBarDiv: document.getElementById('side-bar-div'),
headlineSidepanel: document.getElementById("headline-sidepanel"),
hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
showSideBarBtn: document.getElementById("show-side-bard-btn"),
themeSwitch: document.getElementById("switch"),
boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),

//Task Columns
columnDivs: document.querySelector(".column-div"),
tasksContainer: document.querySelector(".tasks-container"),

//New Task Modal
modalWindow: document.getElementById("new-task-modal-window"),
titleInput: document.getElementById("title-input"),

//Edit Task Modal
editTaskModal: document.querySelector('.edit-task-modal-window'),
editTaskForm: document.getElementById("edit-task-form"),
editTaskFormInput: document.getElementById("edit-task-desc-input"),
editTaskTitleInput: document.getElementById('edit-task-title-input'),
editTaskDescInput: document.getElementById('edit-task-desc-input'),
editSelectStatus: document.getElementById('edit-select-status'),
saveTaskChanges: document.getElementById("save-task-changes-btn"),
cancelEditBtn: document.getElementById("cancel-edit-btn"),
deleteTask: document.getElementById("delete-task-btn"),

//Filter Div
filterDiv: document.getElementById("filterDiv"),


}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () =>  { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').foreach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  //show the button
  elements.showSideBarBtn.style.display = 'block';

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

//Side bar nav links styling:
elements.boardsNavLinksDiv.style.marginTop = "2.5rem";
elements.boardsNavLinksDiv.style.marginBottom = "17rem";

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task_id = JSON.parse(localStorage.getItem('id'));
    const titleInput = elements.titleInput.value;
    const descriptionInput = elements.descInput.value;
    const selectStatus = elements.selectStatus.value;

    const task = {
      "id": task_id,
      "title": titleInput,
      "description": descriptionInput,
      "status": selectStatus,
      "board": activeBoard
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
    location.reload();
}


function toggleSidebar(show) {
  if(show) {
    elements.showSideBarBtn.style.display = 'none';
    elements.sideBar.style.display = 'block';
  } else {
    elements.addNewTaskBtn.showSideBarBtn.style.display = 'block';
    elements.sideBar.style.display = 'none';
  }
}

// Get the current mode from local storage or set to default (light)
const currentMode = localStorage.getItem('mode') || 'light';
let isLightMode = currentMode === 'light';

// Set the initial SVG source based on the current mode
let sideLogoDivSrc = isLightMode ? './assets/logo-dark.svg' : './assets/logo-light.svg';
elements.sideLogoDiv.src = sideLogoDivSrc;

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme');
  document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', !isLightTheme ? 'enabled' : 'disabled');

  isLightMode = !isLightMode; // Toggle the mode
  sideLogoDivSrc = isLightMode ? './assets/logo-dark.svg' : './assets/logo-light.svg';
  elements.sideLogoDiv.src = sideLogoDivSrc;
  localStorage.setItem('mode', isLightMode ? 'light' : 'dark'); // Store the selected mode in localStorage
  localStorage.setItem('sideLogoDiv', sideLogoDivSrc); // Store the selected SVG source in localStorage
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
    refreshTasksUI();
  });


  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  })

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
  refreshTasksUI();
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = elements.editTaskTitleInput.value;
  const descriptionInput = elements.editTaskDescInput.value ;
  const selectStatus = elements.editSelectStatus.value;

  // Create an object with the updated task details
  const updatedTask ={
    // id: task_id,
    title: titleInput,
    description: descriptionInput,
    status: selectStatus,
    board: activeBoard,
  };

  // Update task using a hlper functoin
 patchTask(taskID, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  location.reload();
  toggleModal(false, elements.editTaskModal);

  refreshTasksUI();
}

const displayStoredTasks = () => {
  // Retrieving the tasks from localStorage
  const storedTasks = localStorage.getItem('tasks');

  if (storedTasks) {
    // Parsing the JSON string to an array of tasks
    const tasks = JSON.parse(storedTasks);

    // Loging the tasks to the console
    console.log(tasks);
  } else {
    console.log('No tasks stored in localStorage.');
  }
}

// Calling the function to display the stored tasks
displayStoredTasks();

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  if (localStorage.getItem('sideLogoDiv') === './assets/logo-light.svg') {
    elements.sideLogoDiv.src = './assets/logo-light.svg';
  }
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}