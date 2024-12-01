// Detecta en qué página estamos basado en el título de la página
document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;

    if (pageTitle === 'Crear Tarea') {
        // Lógica para index.html
        handleTaskForm();
    } else if (pageTitle === 'Lista de Tareas') {
        // Lógica para tasks.html
        loadTasks();
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
                    </td>
                `;
            });
        } else {
            alert('Error al cargar las tareas: ' + data.error);
        }
    } catch (error) {
        console.error('Error al cargar las tareas:', error);
        alert('Hubo un error al cargar las tareas.');
    }
}
