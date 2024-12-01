// Detecta en qué página estamos basado en el título de la página
document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;

    if (pageTitle === 'Crear Tarea') {
        handleTaskForm();
    } else if (pageTitle === 'Lista de Tareas') {
        loadTasks();
    } else if (pageTitle === 'Editar Tarea') {
        initializeEditPage();
    }
});

// Manejo del formulario de creación (index.html)
function handleTaskForm() {
    const taskForm = document.getElementById('taskForm');
    const messageDiv = document.getElementById('message');

    if (!taskForm) {
        console.error('Formulario no encontrado en esta página.');
        return;
    }

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        const taskData = { title, description };

        try {
            const response = await fetch('http://localhost/tasks-crud/api.php?path=tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = `Tarea "${data.title}" creada exitosamente.`;
                messageDiv.style.color = 'green';
                taskForm.reset(); // Limpiar el formulario
            } else {
                messageDiv.textContent = `Error: ${data.error}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            messageDiv.textContent = 'Hubo un error al crear la tarea.';
            messageDiv.style.color = 'red';
        }
    });
}

// Carga y muestra las tareas (tasks.html)
async function loadTasks() {
    const tasksTableBody = document.getElementById('tasksTable')?.getElementsByTagName('tbody')[0];

    if (!tasksTableBody) {
        console.error('Tabla de tareas no encontrada en esta página.');
        return;
    }

    try {
        const response = await fetch('http://localhost/tasks-crud/api.php?path=tasks');
        const data = await response.json();

        if (response.ok) {
            tasksTableBody.innerHTML = '';

            data.forEach((task) => {
                const row = tasksTableBody.insertRow();
                row.innerHTML = `
                    <td>${task.id}</td>
                    <td>${task.title}</td>
                    <td>${task.description}</td>
                    <td>${task.status}</td>
                    <td>
                        <a href="edit.html?id=${task.id}">Editar</a>
                        <button class="delete-btn" data-id="${task.id}">Eliminar</button>
                    </td>
                `;
            });

            // Agregar event listener para los botones de eliminar
            const deleteButtons = document.querySelectorAll('.delete-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const taskId = e.target.getAttribute('data-id');
                    deleteTask(taskId);
                });
            });
        } else {
            alert('Error al cargar las tareas: ' + data.error);
        }
    } catch (error) {
        console.error('Error al cargar las tareas:', error);
        alert('Hubo un error al cargar las tareas.');
    }
}

// Eliminar tarea
async function deleteTask(taskId) {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar esta tarea?');

    if (!confirmDelete) return;

    try {
        const response = await fetch('http://localhost/tasks-crud/api.php?path=tasks', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Tarea eliminada exitosamente.');
            loadTasks(); // Recargar las tareas después de eliminar una
        } else {
            alert('Error al eliminar la tarea: ' + data.error);
        }
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        alert('Hubo un problema al eliminar la tarea.');
    }
}

// Manejo de la página de edición (edit.html)
function initializeEditPage() {
    const taskId = new URLSearchParams(window.location.search).get('id');

    if (!taskId) {
        alert('No se especificó una tarea válida para editar.');
        window.location.href = 'tasks.html';
        return;
    }

    const editForm = document.getElementById('editTaskForm');
    if (!editForm) {
        console.error('Formulario de edición no encontrado.');
        return;
    }

    loadTaskData(taskId);

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const status = document.getElementById('status').value;

        const updatedTask = { id: taskId, title, description, status };

        try {
            const response = await fetch('http://localhost/tasks-crud/api.php?path=tasks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Tarea actualizada exitosamente.');
                window.location.href = 'tasks.html';
            } else {
                alert('Error al actualizar la tarea: ' + data.error);
            }
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            alert('Hubo un problema al actualizar la tarea.');
        }
    });
}

// Cargar datos de la tarea seleccionada
async function loadTaskData(taskId) {
    try {
        const response = await fetch(`http://localhost/tasks-crud/api.php?path=tasks&id=${taskId}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('title').value = data.title;
            document.getElementById('description').value = data.description;
            document.getElementById('status').value = data.status;
        } else {
            alert('Error al cargar la tarea: ' + data.error);
            window.location.href = 'tasks.html';
        }
    } catch (error) {
        console.error('Error al cargar la tarea:', error);
        alert('Hubo un problema al cargar la tarea.');
        window.location.href = 'tasks.html';
    }
}
