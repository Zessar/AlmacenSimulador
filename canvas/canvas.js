import { Pasillo, Ubicacion, crearPasillosYUbicaciones } from '../warehouseLayout.js';
import { tableroWidth, tableroHeight, cuadriculaSize, canvasPadding, marginCuadricula } from '../script.js';

// Constantes de acceso al canvas y su contexto
const canvas = document.getElementById('almacen-canvas');
const ctx = canvas.getContext('2d');

// Declaración del tablero
const tablero = [];

// Variables para controlar la selección de cuadros
let isDragging = false;
let startX, startY, endX, endY;
let isMultiselecting = false;

// Variables para el zoom y la posición del lienzo
let zoomLevel = 1;
let offsetX = 0;
let offsetY = 0;
let isDraggingCanvas = false;
let lastMouseX, lastMouseY;
let hasZoomed = false;

// Variables tabla de herramientas
// Para seleccionar las herramientas
let selectedTool = '';
const selectedColor = 'red'; // Color para resaltar cuando se selecciona un cuadrado

// -----------------------------------------------------------------------------------
// Class para los cuadrados, donde se expondra extilos e informacion (se pasara al archivo `warehouseLayout.js` cuando se terminen las pruevas)
class Square {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        // this.borderWidth = 0;
        // this.borderColor = ''; // Color del borde
        // this.shadowColor = 'rgba(0, 0, 0, 0.9)'; // Color de la sombra
        // this.isHovered = false; // Variable para controlar el estado de hover
        this.borderRadius = 3; // Radio de borde
    }

    // Radio del cuadrado
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.borderRadius, this.y);
        ctx.lineTo(this.x + this.size - this.borderRadius, this.y);
        ctx.quadraticCurveTo(this.x + this.size, this.y, this.x + this.size, this.y + this.borderRadius);
        ctx.lineTo(this.x + this.size, this.y + this.size - this.borderRadius);
        ctx.quadraticCurveTo(this.x + this.size, this.y + this.size, this.x + this.size - this.borderRadius, this.y + this.size);
        ctx.lineTo(this.x + this.borderRadius, this.y + this.size);
        ctx.quadraticCurveTo(this.x, this.y + this.size, this.x, this.y + this.size - this.borderRadius);
        ctx.lineTo(this.x, this.y + this.borderRadius);
        ctx.quadraticCurveTo(this.x, this.y, this.x + this.borderRadius, this.y);
        ctx.closePath();

        ctx.fill();

        // // Dibujar borde
        // ctx.strokeStyle = this.borderColor;
        // ctx.lineWidth = this.borderWidth;
        // ctx.stroke();
        
        // Aplicar sombra si está en estado hover
        if (this.isHovered) {
            // ctx.shadowColor = this.shadowColor;
            // ctx.shadowBlur = 10;
            // ctx.shadowOffsetX = 5;
            // ctx.shadowOffsetY = 5;
        }
    }

    // // Método para activar el estado hover
    // setHovered(isHovered) {
    //     this.isHovered = isHovered;
    // }
}

// -----------------------------------------------------------------------------------
// Creacion del tablero
export function initializeBoard() {
    for (let i = 0; i < tableroHeight; i++) {
        tablero[i] = [];
        for (let j = 0; j < tableroWidth; j++) {
            tablero[i][j] = 0; // Inicialmente, todos los cuadrados están vacíos
        }
    }
}

initializeBoard();

// Inicializar el canvas
export function initializeCanvas() {
    canvas.width = tableroWidth * (cuadriculaSize + marginCuadricula) + canvasPadding * 2;
    canvas.height = tableroHeight * (cuadriculaSize + marginCuadricula) + canvasPadding * 2;
    drawBoard();
}

// Dibujar el lienzo, dibujar los cuadrados segun su utilizacion
function drawBoard() {
    // // Dibujar borde del lienzo, pruebas para el padding
    // ctx.strokeStyle = 'red'; // Color del borde
    // ctx.lineWidth = 2; // Grosor del borde
    // ctx.strokeRect(0, 0, canvas.width, canvas.height); // Dibujar borde
    // // Dibujar borde del lienzo
    // ctx.strokeStyle = 'red'; // Color del borde
    // ctx.lineWidth = 2; // Grosor del borde
    // ctx.strokeRect(canvasPadding, canvasPadding, canvas.width - 2 * canvasPadding, canvas.height - 2 * canvasPadding); // Dibujar borde

    // Mostrar dimensiones del lienzo, verificar los tamaños segun el zoom
    console.log('Dimensiones del lienzo:');
    console.log('Antes del zoom: Ancho:', canvasPadding, 'Altura:', canvasPadding);
    console.log('Después del zoom: Ancho:', canvasPadding * zoomLevel, 'Altura:', canvasPadding * zoomLevel);

    // Dibujar el tablero
    for (let i = 0; i < tableroHeight; i++) {
        for (let j = 0; j < tableroWidth; j++) {
            const x = canvasPadding + j * (cuadriculaSize + marginCuadricula);
            const y = canvasPadding + i * (cuadriculaSize + marginCuadricula);
            let color;

            // Dependiendo del valor en el tablero, asignar un color diferente
            switch (tablero[i][j]) {
                case 1:
                    color = selectedColor; // Estilo para la selección
                    break;
                case 2:
                    color = 'gray'; // Estilo para los pasillos
                    break;
                case 3:
                    color = 'blue'; // Estilo para las ubicaciones
                    break;
                default:
                    color = '#eee'; // Estilo predeterminado
                    break;
            }

            const square = new Square(x, y, cuadriculaSize, color);
            square.draw()
        }
    }
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(offsetX, offsetY); // Ajustar por los desplazamientos
    drawBoard();
    ctx.restore();
    
    // Restablecer offsetX y offsetY cuando se aplica el zoom normal
    if (Math.abs(zoomLevel - 1) < 0.01) {
        offsetX = 0;
        offsetY = 0;
    }
}

// Resetear el canvas, para funciones zoom (se puede resetear con la tecla ESPACIO) "da problemas" inabilitada por el momento
function resetCanvas() {
    // Restablecer todas las celdas del tablero a 0 (sin selección)
    for (let i = 0; i < tableroHeight; i++) {
        for (let j = 0; j < tableroWidth; j++) {
            tablero[i][j] = 0;
        }
    }
    // Restablecer el estado del zoom
    hasZoomed = false;
    // Volver a dibujar el canvas para reflejar los cambios
    drawBoard();
}

// -----------------------------------------------------------------------------------
// Evento para detectar cuando el ratón entra al canvas
canvas.addEventListener('mouseenter', function(event) {
    // Marcar que el ratón está dentro del canvas
    const isMouseInsideCanvas = true;
    console.log(isMouseInsideCanvas);
});

// Evento para detectar cuando el ratón sale del canvas
canvas.addEventListener('mouseleave', function(event) {
    // Marcar que el ratón está fuera del canvas
    const isMouseInsideCanvas = false;
    console.log(isMouseInsideCanvas);
});


// Evento para el clic derecho
canvas.addEventListener('contextmenu', function(event) {
    // Prevenir el menú contextual predeterminado
    event.preventDefault();
    
    // Obtener las coordenadas del clic derecho
    const x = event.clientX;
    const y = event.clientY;

    // Mostrar un menú con diferentes herramientas
    showContextMenu(x, y);
    
});

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
    option3.textContent = 'Resetear Canvas';
    option3.addEventListener('click', function() {
    // Lógica para resetear el canvas y eliminar todas las selecciones (da problemas el resetCanvas, y paso cuando los cuadrados los converti en class y le meti estilos), esta es la solucion que he podido realizar
    initializeBoard();
    initializeCanvas();
    // Ocultar el menú contextual después de seleccionar la herramienta
    contextMenu.remove();
    });
    contextMenu.appendChild(option3);

    
    // Establecer la posición del menú contextual
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    
    // Agregar el menú contextual al cuerpo del documento
    document.body.appendChild(contextMenu);
}

// Manejador de eventos de clic en todo el documento para cerrar el menú contextual
document.addEventListener('click', function(event) {
    const contextMenu = document.querySelector('.context-menu');
    if (contextMenu && !contextMenu.contains(event.target)) {
        contextMenu.remove();
    }
});

// -----------------------------------------------------------------------------------
// Deseleccionar herraminetas con la tecla "D", asi se puede vovler a utilizar el arrastre con el raton si se desea, o resetear el zoom con la tecla "ESPACIO", se sumaran mas herramientas en un futuro
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyD') {
        // Desactivar todas las herramientas previamente seleccionadas
        selectedTool = '';
        isMultiselecting = false;

        // Verificar si las herramientas estan desactivadas
        console.log("Herramientas desactivadas");

    } else if (event.code === 'Space') {
        resetZoom();
    }
});

// -----------------------------------------------------------------------------------
// Evento para el clic izquierdo (para arrastrar el canvas)
canvas.addEventListener('mousedown', function(event) {
    if (event.button !== 0 || !hasZoomed || isMultiselecting) return; // No hacer nada, si no es el clic izquierdo o no se ha realizado un zoom

    // Guardar la posición inicial del ratón
    isDraggingCanvas = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

});

// Evento para mover el ratón mientras se mantiene presionado el clic izquierdo
canvas.addEventListener('mousemove', function(event) {
    if (isDraggingCanvas && hasZoomed && !isMultiselecting) { // Solo arrastra si se ha realizado un zoom reciente
        // Calcular la diferencia de posición del ratón
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
          
        // Actualizar la posición del canvas
        offsetX += deltaX;
        offsetY += deltaY;
        
        // Redibujar el canvas con la nueva posición
        redrawCanvas();
        
        // Actualizar las coordenadas del último ratón
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

// Evento para soltar el clic izquierdo
canvas.addEventListener('mouseup', function(event) {
    // Verificar si se estaba arrastrando el canvas
    if (isDraggingCanvas) {
        // Detener el arrastre
        isDraggingCanvas = false;
    }
});

// Variable para confirmar si se ha activado el zoom
let zoomActivated = false;

// Evento para activar el zoom cuando se realiza un scroll
canvas.addEventListener('wheel', function(event) {
    if (!zoomActivated) {
        hasZoomed = true;
        zoomActivated = true; // Activar el zoom
    }
    handleZoom(event); // Llamar a la función de manejo del zoom
});

// -----------------------------------------------------------------------------------

// Esta funcion era la principal, y en zoom con la herramienta multiseleccion, seleccionaba los cuadros que se marcaban, pero en unas coordenadas que no eran las reales, al cambiarla por los calculos de la mas abajo, se empiezan a multiplizar segun el grado de zoom, y hay esta el problema, seguro que estas funciones, los calculos no estan bien
// function handleClick(event) {
//     const rect = canvas.getBoundingClientRect();
//     let x = (event.clientX - rect.left - canvasPadding) / zoomLevel - offsetX;
//     let y = (event.clientY - rect.top - canvasPadding) / zoomLevel - offsetY;

//     let column = Math.floor(x / (cuadriculaSize + marginCuadricula));
//     let row = Math.floor(y / (cuadriculaSize + marginCuadricula));

//     column = Math.max(0, Math.min(column, tableroWidth - 1));
//     row = Math.max(0, Math.min(row, tableroHeight - 1));

//     if (x % (cuadriculaSize + marginCuadricula) < cuadriculaSize && y % (cuadriculaSize + marginCuadricula) < cuadriculaSize) {
//         if (selectedTool === 'selection') {
//             handleSelection(row, column);
//             redrawCanvas(); // Redibujar el tablero después de la selección
//         } else if (selectedTool === 'multiselection') {
//             handleMultiselection(row, column, event);
//             redrawCanvas(); // Redibujar el tablero después de la selección
//         }
//     }
// };

// Coordenadas al seleccionar, verificar si esta dentro del lienzo, verificar si esta dentro del cuadrado
function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel - offsetX;
    const y = (event.clientY - rect.top) / zoomLevel - offsetY;

    // Ajustar las coordenadas en función del padding del canvas
    const adjustedX = x - canvasPadding;
    const adjustedY = y - canvasPadding;

    // Verificar si las coordenadas están dentro del tablero
    if (adjustedX >= 0 && adjustedY >= 0 && adjustedX <= tableroWidth * (cuadriculaSize + marginCuadricula) && adjustedY <= tableroHeight * (cuadriculaSize + marginCuadricula)) {
        // Calcular la fila y columna del tablero
        const column = Math.floor(adjustedX / (cuadriculaSize + marginCuadricula));
        const row = Math.floor(adjustedY / (cuadriculaSize + marginCuadricula));

        // Manejar la selección según la herramienta seleccionada
        if (selectedTool === 'selection') {
            handleSelection(row, column);
            redrawCanvas(); // Redibujar el tablero después de la selección
        } else if (selectedTool === 'multiselection') {
            handleMultiselection(row, column, event);
            redrawCanvas(); // Redibujar el tablero después de la selección
        }
    }
}


// --------------------------------------------------------------------------------
// Herramienta de seleccion individual
function handleSelection(row, column) {
    if (tablero[row][column] === 1) {
        tablero[row][column] = 0; // Cambiar de 1 a 0 si ya estaba seleccionado
        console.log(`Deseleccionada - Fila: ${row + 1}, Columna: ${column + 1}`);
    } else {
        tablero[row][column] = 1; // Marcar como 1 si no estaba seleccionado
        console.log(`Seleccionada - Fila: ${row + 1}, Columna: ${column + 1}`);
    }
}

// Herramienta de multiseleccion (con porblemas en los calculos)
function handleMultiselection(row, column, event) {
    if (isMultiselecting) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left + offsetX) / zoomLevel;
        const y = (event.clientY - rect.top + offsetY) / zoomLevel;
                    
        const minX = Math.min(startX, x - canvasPadding);
        const minY = Math.min(startY, y - canvasPadding);
        const maxX = Math.max(startX, x - canvasPadding);
        const maxY = Math.max(startY, y - canvasPadding);
        const startColumn = Math.floor(minX / (cuadriculaSize + marginCuadricula));
        const startRow = Math.floor(minY / (cuadriculaSize + marginCuadricula));
        const endColumn = Math.ceil(maxX / (cuadriculaSize + marginCuadricula));
        const endRow = Math.ceil(maxY / (cuadriculaSize + marginCuadricula));

        const selectedCoordinates = [];
        
        for (let i = startRow; i < endRow; i++) {
            for (let j = startColumn; j < endColumn; j++) {
                // Modificar el tablero y registrar las coordenadas seleccionadas
                if (tablero[i][j] === 1) {
                    tablero[i][j] = 0; // Cambiar de 1 a 0 si ya estaba seleccionado
                } else {
                    tablero[i][j] = 1; // Marcar como 1 si no estaba seleccionado
                }
                selectedCoordinates.push({ row: i, column: j });
            }
        }
        
        // Mostrar en consola los cuadrados seleccionados
        console.log("Cuadrados seleccionados:");
        selectedCoordinates.forEach(coord => {
            console.log(`Fila: ${coord.row + 1}, Columna: ${coord.column + 1}`);
        });

        isMultiselecting = false;
    }
}

function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left + offsetX) / zoomLevel;
    const y = (event.clientY - rect.top + offsetY) / zoomLevel;

    const adjustedX = x + canvasPadding;
    const adjustedY = y + canvasPadding;

    if (selectedTool === 'multiselection') {
        if (event.button !== 0) return; // No hacer nada si no es el clic izquierdo
    } else {
        if (event.button === 0) return; // No hacer nada si es el clic derecho (zoom)
    }

    if (adjustedX >= 0 && adjustedY >= 0 && adjustedX <= (tableroWidth / zoomLevel) * (cuadriculaSize + marginCuadricula) && adjustedY <= (tableroHeight / zoomLevel) * (cuadriculaSize + marginCuadricula)) {
        isDragging = true;
        startX = Math.max(canvasPadding, x);
        startY = Math.max(canvasPadding, y);
        redrawCanvas()
        isMultiselecting = true;
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left + offsetX) / zoomLevel;
        const y = (event.clientY - rect.top + offsetY) / zoomLevel;
        
        
        startX = Math.min((canvas.width - canvasPadding) / zoomLevel, Math.max(canvasPadding / zoomLevel, startX));
        startY = Math.min((canvas.height - canvasPadding) / zoomLevel, Math.max(canvasPadding / zoomLevel, startY));
        endX = Math.min((canvas.width - canvasPadding) / zoomLevel, Math.max(canvasPadding / zoomLevel, x));
        endY = Math.min((canvas.height - canvasPadding) / zoomLevel, Math.max(canvasPadding / zoomLevel, y));
        
        redrawCanvas();
        
        // Dibujar el rectángulo de selección
        ctx.strokeStyle = 'blue';
        const cornerRadius = 20; // Radio de las esquinas redondeadas
        ctx.lineJoin = 'round'; // Utilizar esquinas redondeadas
        ctx.lineWidth = 5; // Grosor de la línea

        // Dibujar el rectángulo de selección teniendo en cuenta el zoom y el desplazamiento del lienzo
        ctx.strokeRect(startX * zoomLevel - offsetX, startY * zoomLevel - offsetY, (endX - startX) * zoomLevel, (endY - startY) * zoomLevel);
    }
}

function handleMouseUp(event) {
    isDragging = false;
}



// -----------------------------------------------------------------------------------
// Grupo de funciones para manejar el ZOOM
function handleZoom(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const rect = canvas.getBoundingClientRect();

    if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
        const delta = event.deltaY;
        if (delta > 0) {
            zoomOut();
        } else {
            zoomIn();
        }

        redrawCanvas()
    }
}

function zoomIn() {
    if (zoomLevel < 3) {
        zoomLevel += 0.1;
        offsetX *= 1.1;
        offsetY *= 1.1;
        redrawCanvas();
        hasZoomed = true;
    }
}

function zoomOut() {
    if (zoomLevel > 0.2) {
        zoomLevel -= 0.1;
        offsetX *= 0.9;
        offsetY *= 0.9;
        redrawCanvas();
        hasZoomed = true;
    }
}

function resetZoom() {
    zoomLevel = 1;
    offsetX = 0;
    offsetY = 0;
    redrawCanvas();
}

// -----------------------------------------------------------------------------------
// Función para manejar el evento de las teclas del teclado para el desplazamiento del lienzo (seguramente se quedara, por funcionalidad)
function handleCanvasArrowKeys(event) {
    const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (arrowKeys.includes(event.code)) {
        const step = 10; // Tamaño del paso de movimiento

        switch (event.code) {
            case "ArrowUp":
                offsetY += step / zoomLevel;
                break;
            case "ArrowDown":
                offsetY -= step / zoomLevel;
                break;
            case "ArrowLeft":
                offsetX += step / zoomLevel;
                break;
            case "ArrowRight":
                offsetX -= step / zoomLevel;
                break;
        }

        redrawCanvas();
    }
}

// -----------------------------------------------------------------------------------
// Intento de insetar los pasillos y ubicaciones para realizar el mapa de enrutado de usuarios, para luego meter algoritmos de la ruta mas corta (de momento parametro pausado)
export function dibujarPasillos(pasillos) {
    pasillos.forEach((pasillo, index) => {
        const pasilloX = canvasPadding + (index * (cuadriculaSize + marginCuadricula));
        const pasilloY = canvasPadding;

        const totalUbicaciones = pasillo.getUbicaciones().length;
        const pasilloWidth = totalUbicaciones * (cuadriculaSize + marginCuadricula) - marginCuadricula;

        ctx.fillStyle = 'gray';
        ctx.fillRect(pasilloX, pasilloY, pasilloWidth, cuadriculaSize);
    });
    drawBoard(); // Dibujar el tablero actualizado después de agregar los pasillos

}

// Función para dibujar ubicaciones en el tablero
export function dibujarUbicaciones(ubicaciones) {
    ubicaciones.forEach(ubicacion => {
        const ubicacionX = canvasPadding + ubicacion * (cuadriculaSize + marginCuadricula);
        const ubicacionY = canvasPadding + (ubicacion) * (cuadriculaSize + marginCuadricula);

        ctx.fillStyle = 'blue';
        ctx.fillRect(ubicacionX, ubicacionY, cuadriculaSize, cuadriculaSize);
    });
    drawBoard(); // Dibujar el tablero actualizado después de agregar las ubicaciones

}

// Función para actualizar el lienzo después de realizar cambios
export function actualizarLienzo(pasillos, ubicaciones) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el lienzo antes de redibujar

    dibujarPasillos(pasillos); // Dibujar los pasillos en el lienzo
    dibujarUbicaciones(ubicaciones); // Dibujar las ubicaciones en el lienzo
}

// -----------------------------------------------------------------------------------

// Escuchar eventos de teclado para el desplazamiento del lienzo con las flechas del teclado
document.addEventListener('keydown', handleCanvasArrowKeys);

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('click', handleClick);
canvas.addEventListener('wheel', handleZoom, { passive: true }); //Con problemas de Violacion (o eso pone en la consola)

// Inicializar para que no se muestre el area del canvas, hasta que no se cree el lienzo
initializeCanvas();