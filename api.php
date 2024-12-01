<?php
// Ruta del archivo JSON que actúa como base de datos
define('DB_FILE', 'tasks.json');

// Funcion para Cargar las tareas desde el archivo JSON
function loadTasks() {
    if (!file_exists(DB_FILE)) {
        file_put_contents(DB_FILE, json_encode([])); // sirve para crear el archivo si no existe
    }
    return json_decode(file_get_contents(DB_FILE), true);
}

// Guardar las tareas en el archivo JSON
function saveTasks($tasks) {
    file_put_contents(DB_FILE, json_encode($tasks, JSON_PRETTY_PRINT));
}

// Funcion para obtener datos del cuerpo de la solicitud
function getRequestData() {
    return json_decode(file_get_contents('php://input'), true);
}

// Funcion para responder con JSON
function respond($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Manejo de rutas y métodos
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

// Ruta principal de la API
if ($path === 'tasks') {
    $tasks = loadTasks();

    switch ($requestMethod) {
        case 'GET': // Obtener todas las tareas
            respond($tasks);
            break;

        case 'POST': // Crear una nueva tarea
            $data = getRequestData();
            if (isset($data['title'], $data['description'])) {
                $newTask = [
                    'id' => uniqid(),
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'status' => 'pending',
                ];
                $tasks[] = $newTask;
                saveTasks($tasks);
                respond($newTask, 201);
            } else {
                respond(['error' => 'Datos ingresados incorrectos'], 400);
            }
            break;

            case 'PUT': // Actualizar una tarea
                $data = getRequestData();
                if (isset($data['id'], $data['title'], $data['description'], $data['status'])) {
                    foreach ($tasks as &$task) {
                        if ($task['id'] === $data['id']) {
                            $task['title'] = $data['title'];
                            $task['description'] = $data['description'];
                            $task['status'] = $data['status'];
                            saveTasks($tasks);
                            respond($task);
                        }
                    }
                    respond(['error' => 'Tarea no encontrada!'], 404);
                } else {
                    respond(['error' => 'datos ingresados incorrectos'], 400);
                }
                break;
    
            case 'DELETE': // Eliminar una tarea
                $data = getRequestData();
                if (isset($data['id'])) {
                    $found = false;
                    $tasks = array_filter($tasks, function ($task) use ($data, &$found) {
                        if ($task['id'] === $data['id']) {
                            $found = true;
                            return false;
                        }
                        return true;
                    });
                    if ($found) {
                        saveTasks($tasks);
                        respond(['message' => 'Tarea eliminada']);
                    } else {
                        respond(['error' => 'Tarea no encontrada'], 404);
                    }
                } else {
                    respond(['error' => 'Datos introducidos incorrectos!'], 400);
                }
                break;
    

        default:
            respond(['error' => 'Metodo no permitido'], 405);
    }
} else {
    respond(['error' => 'Endpoint invalido'], 404);
}
