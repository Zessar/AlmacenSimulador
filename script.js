import { initializeBoard, initializeCanvas  } from './canvas/canvas.js';
import { Pasillo, Ubicacion, crearPasillosYUbicaciones } from './warehouseLayout.js';

// Exportar variables, donde se recojen los valores de los input
let tableroWidth, tableroHeight, cuadriculaSize, canvasPadding, marginCuadricula;

// Conseguir los valores de los input, y manejar los botones para crear el area de trabajo y posterior estructura de almacen
document.addEventListener('DOMContentLoaded', () => {

    // Acceder al boton de generar el area de trabajo
    const buttonEstructura = document.getElementById('buttonArea');

    // Manejador de eventos (en este caso solo iniciar el lienzo)
    buttonEstructura.addEventListener('click', () => {
        // Obtener los valores de los input y asignarlos a las variables globales
        tableroWidth = parseInt(document.getElementById('tableroWidth').value);
        tableroHeight = parseInt(document.getElementById('tableroHeight').value);
        cuadriculaSize = parseInt(document.getElementById('cuadriculaSize').value);
        canvasPadding = parseInt(document.getElementById('canvasPadding').value);
        marginCuadricula = parseInt(document.getElementById('marginCuadricula').value);
        
        // Usar los valores como sea necesario (por ejemplo, redibujar el canvas)
        
        initializeBoard();
        initializeCanvas();

    });

    // Acceder al boton de generar almacen
    const generarAlmacenButton = document.getElementById('generarAlmacenButton');

    // Manejador de eventos para crear la almacen del almacen
    generarAlmacenButton.addEventListener('click', () => {
        const nombreZona = document.getElementById('nombreZona').value;
        const cantidadPasillos = parseInt(document.getElementById('cantidadPasillos').value);
        const cantidadUbicaciones = parseInt(document.getElementById('cantidadUbicaciones').value);
        const alturaUbicaciones = parseInt(document.getElementById('alturaUbicaciones').value);
        const opcionInicioPasillos = document.getElementById('opcionInicioPasillos').value;
        const opcionInicioUbicaciones = document.getElementById('opcionInicioUbicaciones').value;

        let nombreInicioPasillos = parseInt(document.getElementById('inicioPasillos').value);
        let nombreInicioUbicaciones = parseInt(document.getElementById('inicioUbicaciones').value);

        const { pasillos, ubicaciones } = crearPasillosYUbicaciones(cantidadPasillos, cantidadUbicaciones, alturaUbicaciones, nombreZona, nombreInicioPasillos, nombreInicioUbicaciones);

        // Crear pasillos y ubicaciones (estudiandolo, de momento pausado, se abre un gran abanico de formas de creacion, de distribucion, etc)
        // Llama a la función actualizarLienzo con los pasillos y las ubicaciones
        canvas.actualizarLienzo(pasillos, ubicaciones);

        // Realizar otras operaciones con los pasillos y ubicaciones según sea necesario
        pasillos.forEach(pasillo => {
            console.log(`Pasillo ${pasillo.getNumero()}:`);
            console.log(`Ubicaciones:`);
            pasillo.getUbicaciones().forEach(ubicacion => {
                console.log(ubicacion.generarNombre());
            });
        });
        console.log(pasillos);
        console.log(ubicaciones);
    });
    
});

        const tipoPasillosSelect = document.getElementById('opcionInicioPasillos');
        const personalizadoPasillosDiv = document.getElementById('personalizadoPasillos');
        const inicioPasillosInput = document.getElementById('inicioPasillos');

        tipoPasillosSelect.addEventListener('change', () => {
            if (tipoPasillosSelect.value === '2') {
                personalizadoPasillosDiv.style.display = 'block';
            } else {
                personalizadoPasillosDiv.style.display = 'none';
            }
        });

        const tipoUbicacionesSelect = document.getElementById('opcionInicioUbicaciones');
        const personalizadoUbicacionesDiv = document.getElementById('personalizadoUbicaciones');
        const inicioIbicacionesInput = document.getElementById('inicioUbicaciones');

        tipoUbicacionesSelect.addEventListener('change', () => {
            if (tipoUbicacionesSelect.value === '2') {
                personalizadoUbicacionesDiv.style.display = 'block';
            } else {
                personalizadoUbicacionesDiv.style.display = 'none';
            }
        });

// Exportar variables, para el archivo que lo necesite
export { tableroWidth, tableroHeight, cuadriculaSize, canvasPadding, marginCuadricula };