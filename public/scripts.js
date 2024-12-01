// Obtén el formulario y el mensaje de respuesta
const taskForm = document.getElementById('taskForm');
const messageDiv = document.getElementById('message');

// Maneja el envío del formulario
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    // Objeto de la tarea que se va a enviar
    const taskData = {
        title: title,
        description: description
    };

    try {
        // Llamada a la API para crear la tarea
        const response = await fetch('http://localhost/tasks-crud/api.php?path=tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();

        if (response.ok) {
            // Si la tarea se crea correctamente
            messageDiv.textContent = `Tarea "${data.title}" creada exitosamente.`;
            messageDiv.style.color = 'green';
        } else {
            // Si ocurre un error en la API
            messageDiv.textContent = `Error: ${data.error}`;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        // Si hay problemas de conexión o de la API
        messageDiv.textContent = 'Hubo un error al crear la tarea. Intenta nuevamente.';
        messageDiv.style.color = 'red';
    }
    // Función para cargar las tareas desde la API y mostrarlas en la tabla
async function loadTasks() {
    const tasksTableBody = document.getElementById('tasksTable').getElementsByTagName('tbody')[0];

    try {
        const response = await fetch('http://localhost/tasks-crud/api.php?path=tasks');
        const data = await response.json();

        if (response.ok) {
            // Limpiar cualquier tarea previa
            tasksTableBody.innerHTML = '';

            // Agregar cada tarea a la tabla
            data.forEach(task => {
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

// Cargar las tareas cuando la página se haya cargado
document.addEventListener('DOMContentLoaded', loadTasks);
});
