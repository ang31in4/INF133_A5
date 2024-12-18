// Code for time feature
document.addEventListener("DOMContentLoaded", function() {
    function updateClock() {
        const clockElement = document.getElementById('clock');
        const now = new Date();

        // Get current hours, minutes, and seconds
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Determine AM or PM
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert 24-hour format to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 becomes 12

        // Format time to always display two digits for minutes and seconds
        const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;

        // Update the clock element
        clockElement.textContent = formattedTime;
    }

    // Update the clock every second
    setInterval(updateClock, 1000);

    // Call updateClock once immediately to avoid delay on page load
    updateClock();
});

function displayCurrentDate() {
    const currentDate = new Date();

    // Array of month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get the current month and day
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentDay = currentDate.getDate();

    // Update the content of the calendar elements
    document.getElementById("calendar-month").textContent = currentMonth;
    document.getElementById("calendar-day").textContent = currentDay;
}

// Call the function to display the date when the page loads
document.addEventListener("DOMContentLoaded", displayCurrentDate);

// Code for immediate location retrieval when starting website
document.addEventListener("DOMContentLoaded", function () {
    // Location Retrieval
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            // Reverse geocoding using OpenStreetMap's Nominatim API
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                .then(response => response.json())
                .then(data => {
                    // Retrieve the city and state/province from the address components
                    var city = data.address.city || data.address.town || data.address.village || "City not found";
                    var state = data.address.state || data.address.province || "State/Province not found";

                    // Combine city and state for display
                    document.getElementById("location-text").textContent = `${city}, ${state}`;
                })
                .catch(error => {
                    console.error('Error fetching location data:', error);
                    document.getElementById("location-text").textContent = "Failed to fetch location";
                });
        }, function (error) {
            console.error('Geolocation error:', error);
            document.getElementById("location-text").textContent = "Location access denied";
        });
    } else {
        document.getElementById("location-text").textContent = "Geolocation not supported";
    }

    // Weather Retrieval
    const apiKey = "562df18821f94a6995e55836242611";
    const weatherDiv = document.getElementById("weather");

    async function fetchWeather(lat, lon) {
        try {
            const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch weather data.");
            }
            const data = await response.json();

            // Extract weather information
            const temperature = `${data.current.temp_f}°F`;
            const condition = data.current.condition.text;

            // Update the #weather div
            weatherDiv.innerHTML = `${temperature}: ${condition}`;
        } catch (error) {
            weatherDiv.textContent = `Error: ${error.message}`;
        }
    }

    // Fetch weather once geolocation is available
    navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(lat, lon);
    });
});

document.addEventListener('DOMContentLoaded', loadTasks);

// Loads tasks from local storage and adds them 
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToDOM(task.text, task.priority, task.completed, task.type, task.date));
}

document.getElementById('addTaskBtn').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    const taskType = document.getElementById('taskTypeSelect').value;
    const date = dateInput.value;

    if (taskText !== '') {
        addTaskToDOM(taskText, priority, false, taskType, date);
        saveTask(taskText, priority, taskType, date);
        taskInput.value = '';
        dateInput.value = '';
    }
});

document.getElementById('clearAllBtn').addEventListener('click', function() {
    localStorage.removeItem('tasks');
    document.getElementById('taskList').innerHTML = '';
    document.getElementById('importantDateList').innerHTML = '';
});

// Adds a new task with priority high, medium, or low
function addTaskToDOM(taskText, priority, completed = false, type = 'To-Do', date = '') {
    const list = type === 'To-Do' ? document.getElementById('taskList') : document.getElementById('importantDateList');
    const listItem = document.createElement('li');
    listItem.className = `list-group-item ${completed ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completed;
    checkbox.addEventListener('change', function() {
        listItem.classList.toggle('completed');
        toggleTaskCompletion(taskText, type);
    });

    const taskSpan = document.createElement('span');
    taskSpan.className = 'task-text';
    taskSpan.textContent = taskText;

    const badge = document.createElement('span');
    badge.className = `badge bg-${getBadgeClass(priority)}`;
    badge.textContent = priority;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'badge bg-info text-dark';
    dateSpan.textContent = date;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', function() {
        listItem.remove();
        deleteTask(taskText, type);
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(taskSpan);
    if (type === 'Important Date') {
        listItem.appendChild(dateSpan);
    }
    listItem.appendChild(badge);
    listItem.appendChild(deleteButton);
    list.appendChild(listItem);
}

// Returns Bootstrap badges with approriate color
function getBadgeClass(priority) {
    switch (priority) {
        case 'High':
            return 'danger';
        case 'Medium':
            return 'warning';
        case 'Low':
            return 'success';
        default:
            return 'secondary';
    }
}

// Saves a new task to local storage 
function saveTask(taskText, priority, type, date) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text: taskText, priority: priority, completed: false, type: type, date: date });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Toggles the completion status and updates local storage.
function toggleTaskCompletion(taskText, type) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.text === taskText && t.type === type);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// Deletes a task from local storage.
function deleteTask(taskText, type) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.text !== taskText || task.type !== type);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


// Toggles the date input visibility based on task type selection
document.getElementById('taskTypeSelect').addEventListener('change', function() {
    const dateInputGroup = document.getElementById('dateInputGroup');
    const taskInput = document.getElementById('taskInput');
    if (this.value === 'Important Date') {
        dateInputGroup.style.display = 'block';
        taskInput.placeholder = 'Add a new important date';
    } else {
        dateInputGroup.style.display = 'none';
        taskInput.placeholder = 'Add a new task';
    }
});


const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar(month, year) {
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    document.getElementById('monthYear').innerText = `${monthNames[month]} ${year}`;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const weekRow = document.createElement('div');
        weekRow.className = 'row';

        for (let j = 0; j < 7; j++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'col day';

            if (i === 0 && j < firstDay) {
                dayCell.innerHTML = '';
            } else if (date > daysInMonth) {
                break;
            } else {
                dayCell.innerHTML = date;
                date++;
            }

            weekRow.appendChild(dayCell);
        }

        calendarDays.appendChild(weekRow);
    }
}

document.getElementById('prevMonth').addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

renderCalendar(currentMonth, currentYear);