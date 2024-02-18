import { zoomLevel } from "./zoomCanvas.js";
import { tableroWidth, tableroHeight, cuadriculaSize, canvasPadding, marginCuadricula } from "../script.js";
import { canvas, ctx, initializeCanvas, initializeBoard, drawBoard, redrawCanvas, tablero, drawSquare, resetCanvas } from "./canvas.js";

// Variables para controlar la selección de cuadros
let startX, startY, endX, endY;
let isMultiselecting = false;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Evento para el clic derecho para crear el menu (herramientas, datos, etc)
canvas.addEventListener('contextmenu', function(event) {
    // Prevenir el menú contextual predeterminado
    event.preventDefault();
    
    // Mostrar un menú con diferentes herramientas
    // Obtener las coordenadas del clic derecho
    const x = event.clientX;
    const y = event.clientY;
    
    // Mostrar el menú contextual en las coordenadas del clic derecho
    showContextMenu(x, y);

    // Aquí puedes implementar la lógica para mostrar el menú
    // Puedes usar event.clientX y event.clientY para obtener las coordenadas del clic derecho
    // Luego, muestras un menú contextual en esa posición
    // Por ejemplo:
    // showContextMenu(event.clientX, event.clientY);
});

let selectedTool = '';

// Función para mostrar el menú contextual en una posición específica
function showContextMenu(x, y) {
    // Verificar si ya hay un menú contextual mostrándose y eliminarlo
    const existingContextMenu = document.querySelector('.context-menu');
    if (existingContextMenu) {
        existingContextMenu.remove();
    }

    // Crear el menú contextual
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    
    // Agregar opciones al menú contextual
    const cerrar = document.createElement('div');
    cerrar.textContent = 'X';
    cerrar.addEventListener('click', function() {
        // Lógica para seleccionar la herramienta 1 (individual)
        
        // Ocultar el menú contextual después de seleccionar la herramienta
        contextMenu.remove();
    });
    contextMenu.appendChild(cerrar);
    
    
    // Agregar opciones al menú contextual
    const option1 = document.createElement('div');
    option1.textContent = 'Herramienta 1';
    option1.addEventListener('click', function() {
        // Lógica para seleccionar la herramienta 1 (individual)
        selectedTool = 'selection';
        
        // Ocultar el menú contextual después de seleccionar la herramienta
        contextMenu.remove();
    });
    contextMenu.appendChild(option1);
    
    const option2 = document.createElement('div');
    option2.textContent = 'Herramienta 2';
    option2.addEventListener('click', function() {
        // Lógica para seleccionar la herramienta 2 (multiselección)
        selectedTool = 'multiselection';
        
        // Ocultar el menú contextual después de seleccionar la herramienta
        contextMenu.remove();
    });
    contextMenu.appendChild(option2);
    
    const option3 = document.createElement('div');
    option3.textContent = 'Deseleccionar Herramienta';
    option3.addEventListener('click', function() {
        // Lógica para seleccionar la herramienta 2 (multiselección)
        selectedTool = '';
        
        // Ocultar el menú contextual después de seleccionar la herramienta
        contextMenu.remove();
    });
    contextMenu.appendChild(option3);

    const option4 = document.createElement('div');
    option4.textContent = 'Resetear Canvas';
    option4.addEventListener('click', function() {
    // Lógica para resetear el canvas y eliminar todas las selecciones
    resetCanvas();
    // Ocultar el menú contextual después de seleccionar la herramienta
    contextMenu.remove();
    });
    contextMenu.appendChild(option4);

    
    // Establecer la posición del menú contextual
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    
    // Agregar el menú contextual al cuerpo del documento
    document.body.appendChild(contextMenu);
}

// Evento para desactivar todas las herramientas al presionar la tecla "D" y resetar el Zoom
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyD') {
        // Desactivar todas las herramientas previamente seleccionadas

        selectedTool = '';

        // Aquí puedes agregar cualquier otra lógica necesaria para la nueva herramienta

        // Por ejemplo, podrías mostrar un mensaje o realizar alguna acción específica
        console.log("Herramientas desactivadas");

    } else if (event.code === 'Space') {
        resetZoom();
    }
});

// Funciones para la seleccion o multiseleccion de los drawSquar

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left - canvasPadding) / zoomLevel - offsetX;
    let y = (event.clientY - rect.top - canvasPadding) / zoomLevel - offsetY;

    let column = Math.floor(x / (cuadriculaSize + marginCuadricula));
    let row = Math.floor(y / (cuadriculaSize + marginCuadricula));

    column = Math.max(0, Math.min(column, tableroWidth - 1));
    row = Math.max(0, Math.min(row, tableroHeight - 1));

    if (x % (cuadriculaSize + marginCuadricula) < cuadriculaSize && y % (cuadriculaSize + marginCuadricula) < cuadriculaSize) {
        if (selectedTool === 'selection') {
            handleSelection(row, column);
            redrawCanvas(); // Redibujar el tablero después de la selección
        } else if (selectedTool === 'multiselection') {
            handleMultiselection(row, column, event);
            redrawCanvas(); // Redibujar el tablero después de la selección
        }
    }
};

// Funcion de Seleccion individual
function handleSelection(row, column) {
    if (tablero[row][column] === 1) {
        tablero[row][column] = 0; // Cambiar de 1 a 0 si ya estaba seleccionado
    } else {
        tablero[row][column] = 1; // Marcar como 1 si no estaba seleccionado
    }
}

// funcion de Multiseleccion
function handleMultiselection(row, column, event) {
    if (isMultiselecting) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - canvasPadding;
        const y = event.clientY - rect.top - canvasPadding;
                    
        const minX = Math.min(startX, x);
        const minY = Math.min(startY, y);
        const maxX = Math.max(startX, x);
        const maxY = Math.max(startY, y);
        const startColumn = Math.floor(minX / (cuadriculaSize + marginCuadricula));
        const startRow = Math.floor(minY / (cuadriculaSize + marginCuadricula));
        const endColumn = Math.ceil(maxX / (cuadriculaSize + marginCuadricula));
        const endRow = Math.ceil(maxY / (cuadriculaSize + marginCuadricula));
        
        const selectedCoordinates = [];
        
        for (let i = startRow; i < endRow; i++) {
            for (let j = startColumn; j < endColumn; j++) {
                if (tablero[i][j] === 1) {
                    tablero[i][j] = 0; // Cambiar de 1 a 0 si ya estaba seleccionado
                } else {
                    tablero[i][j] = 1; // Marcar como 1 si no estaba seleccionado
                }
                selectedCoordinates.push({ row: i, column: j });
            }
        }
        
        console.log("Cuadrados seleccionados:");
        selectedCoordinates.forEach(coord => {
            console.log(`Fila: ${coord.row + 1}, Columna: ${coord.column + 1}`);
        });
        
        isMultiselecting = false;
    }
}

// Grupo de funciones para crear el marco de la herramienta Multiseleccion
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left + 1;
    const y = event.clientY - rect.top + 1;
    
    if (selectedTool === 'multiselection') {
        if (event.button !== 0) return; // No hacer nada si no es el clic izquierdo
    } else {
        if (event.button === 2) return; // No hacer nada si es el clic derecho (zoom)
    }

    if (x >= canvasPadding && x <= canvas.width - canvasPadding && y >= canvasPadding && y <= canvas.height - canvasPadding) {
        isDragging = true;
        startX = Math.floor((event.clientX - rect.left - canvasPadding + offsetX) / (cuadriculaSize + marginCuadricula)) * (cuadriculaSize + marginCuadricula) + canvasPadding - offsetX;
        startY = Math.floor((event.clientY - rect.top - canvasPadding + offsetY) / (cuadriculaSize + marginCuadricula)) * (cuadriculaSize + marginCuadricula) + canvasPadding - offsetY;
        isMultiselecting = true;
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        endX = Math.floor((event.clientX - rect.left - canvasPadding + offsetX) / (cuadriculaSize + marginCuadricula)) * (cuadriculaSize + marginCuadricula) + canvasPadding - offsetX + cuadriculaSize;
        endY = Math.floor((event.clientY - rect.top - canvasPadding + offsetY) / (cuadriculaSize + marginCuadricula)) * (cuadriculaSize + marginCuadricula) + canvasPadding - offsetY + cuadriculaSize;

        endX = Math.min(canvas.width - canvasPadding - cuadriculaSize, endX);
        endY = Math.min(canvas.height - canvasPadding - cuadriculaSize, endY);

        redrawCanvas();
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
}

function handleMouseUp(event) {
    isDragging = false;
}

// Función para manejar el evento de las teclas del teclado para el desplazamiento del lienzo
function handleCanvasArrowKeys(event) {
    const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (arrowKeys.includes(event.code)) {
        const step = 10; // Tamaño del paso de movimiento

        switch (event.code) {
            case "ArrowUp":
                offsetY -= step / zoomLevel;
                break;
            case "ArrowDown":
                offsetY += step / zoomLevel;
                break;
            case "ArrowLeft":
                offsetX -= step / zoomLevel;
                break;
            case "ArrowRight":
                offsetX += step / zoomLevel;
                break;
        }

        redrawCanvas();
    }
}

// Escuchar eventos de teclado para el desplazamiento del lienzo con las flechas del teclado
document.addEventListener('keydown', handleCanvasArrowKeys);

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('click', handleClick);