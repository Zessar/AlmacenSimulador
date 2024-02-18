// Class Pasillo, para la creacion de pasillos donde se podra enrutar los algoritmos de la ruta mas corta (sin completar informacion y funcionalidades)
class Pasillo {
    constructor(numero, ubicaciones, zona) {
        this.numero = numero;
        this.ubicaciones = ubicaciones;
        this.zona = zona;
    }
    
    getNumero() {
        return this.numero;
    }
    
    getUbicaciones() {
        return this.ubicaciones;
    }
    
    getZona() {
        return this.zona;
    }
}

// Class para representar las ubicaciónes (sin completar informacion y funcionalidades)
class Ubicacion {
    constructor(numero, altura, pasillo, zona) {
        this.numero = numero;
        this.altura = altura;
        this.pasillo = pasillo;
        this.zona = zona;
    }

    getNumero() {
        return this.numero;
    }

    getAltura() {
        return this.altura;
    }

    getPasillo() {
        return this.pasillo;
    }

    getZona() {
        return this.zona;
    }

    generarNombre() {
        const numeroPasillo = this.pasillo ? this.pasillo.getNumero() : 'N/A'; // Obtener número del pasillo
        const nombres = [];
        this.altura.forEach(altura => {
            nombres.push(`${this.getZona()}-${numeroPasillo}-${altura}-${this.getNumero()}`);
        });
        return nombres;
    }   
    
}

// Función para crear pasillos y ubicaciones asociadas (estudiandolo, pausado de momento, demasiadas funcionalidades en este apartado)
function crearPasillosYUbicaciones(cantidadPasillos, cantidadUbicaciones, alturaUbicaciones, nombreZona, nombreInicioPasillos, nombreInicioUbicaciones) {
    const pasillos = [];
    const ubicaciones = [];
    let numeroInicioPasillo = nombreInicioPasillos ? parseInt(nombreInicioPasillos) : 1;
    let numeroInicioUbicacion = nombreInicioUbicaciones ? parseInt(nombreInicioUbicaciones) : 1;

    for (let i = 0; i < cantidadPasillos; i++) {
        const nombrePasillos = numeroInicioPasillo + i;
        const pasillo = new Pasillo(nombrePasillos, [], nombreZona);
        pasillos.push(pasillo);

        for (let j = 0; j < cantidadUbicaciones; j++) {
            const numeroUbicacion = numeroInicioUbicacion + j;
            const ubicacion = new Ubicacion(numeroUbicacion, [], pasillo, nombreZona); 

            for (let k = 0; k < alturaUbicaciones; k++) {
                const alturaLetra = String.fromCharCode(65 + k); 
                ubicacion.getAltura().push(alturaLetra); 
            }

            pasillo.getUbicaciones().push(ubicacion); 
            ubicaciones.push(ubicacion); 
        }
    }

    return { pasillos, ubicaciones };
}

export { Pasillo, Ubicacion, crearPasillosYUbicaciones };
