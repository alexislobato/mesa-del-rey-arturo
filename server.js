const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const SECRET_KEY = "clave_secreta_huva_coaching";

// 1. Acceso de Administradores
const administradores = [
    { id: 1, email: "alexis.lobato@h-uva.com", passwordProvisional: "H-UVA2026", nombre: "Alexis Lobato", puesto: "Coordinador de Logística" },
    { id: 2, email: "hvazquez@h-uva.com", passwordProvisional: "H-UVA2026", nombre: "Humberto Vázquez", puesto: "CEO" }
];

// 3. Base de datos vacía al iniciar
let registrosLideres = [];

// Cuestionario base metodológico (Escala 1 al 5 + Área Ciega)
const cuestionarioBase = [
    { id: 1, pregunta: "¿El líder mantiene una comunicación clara y transparente con el equipo?", tipo: "escala" },
    { id: 2, pregunta: "¿Demuestra empatía y apertura al recibir sugerencias?", tipo: "escala" },
    { id: 3, pregunta: "¿Toma decisiones fundamentadas buscando el beneficio común del equipo?", tipo: "escala" },
    { id: 4, pregunta: "[Área Ciega III - Johari] ¿Qué comportamientos o actitudes consideras que el líder realiza de forma inconsciente y que afectan al equipo?", tipo: "abierta", esCuadrante: true },
    { id: 5, pregunta: "¿Qué fortaleza principal destacarías de su liderazgo?", tipo: "abierta" }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Login directo
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const admin = administradores.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!admin || password !== admin.passwordProvisional) {
        return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    const token = jwt.sign(
        { id: admin.id, email: admin.email, nombre: admin.nombre, puesto: admin.puesto },
        SECRET_KEY,
        { expiresIn: '8h' }
    );

    res.json({
        mensaje: "Acceso correcto",
        token: token,
        usuario: { nombre: admin.nombre, puesto: admin.puesto, email: admin.email }
    });
});

// 4. Registro y Generación de 1 Enlace Único por Líder con Plantilla
app.post('/api/registros', (req, res) => {
    const { coacheeNombre, empresa } = req.body;

    if (!coacheeNombre || !empresa) {
        return res.status(400).json({ mensaje: "Nombre del líder y empresa son obligatorios." });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const codigoUnico = Math.random().toString(36).substring(2, 10);
    const enlaceGenerado = `${protocol}://${host}/?evaluar=${codigoUnico}`;

    const plantillaMensaje = `Extraordinario día,

Gracias por ser parte de este proceso de desarrollo.

Has sido seleccionado(a) como evaluador(a) de ${coacheeNombre} (${empresa}). En esta ocasión, participarás en una dinámica de Feedback 360°: La Mesa del Rey Arturo, cuyo objetivo es recopilar diferentes perspectivas que contribuyan a su desarrollo.

A continuación, te compartimos el enlace de acceso para que puedas realizar la evaluación:

🔗 Enlace de acceso:
${enlaceGenerado}

Te agradecemos mucho tu participación y el tiempo dedicado a este proceso. Te solicitamos ingresar al enlace y completar la evaluación correspondiente.

Si tienes alguna duda o dificultad para acceder, quedamos atentos para apoyarte.

Saludos cordiales,
H-UVA Coaching & Consulting`;

    const nuevoLider = {
        id: registrosLideres.length + 1,
        codigo: codigoUnico,
        coacheeNombre,
        empresa,
        enlace: enlaceGenerado,
        plantillaMensaje,
        fechaCreacion: new Date().toLocaleDateString(),
        evaluacionesRecibidas: []
    };

    registrosLideres.push(nuevoLider);
    res.json({ mensaje: "Líder registrado correctamente", registro: nuevoLider });
});

// Obtener datos del Dashboard
app.get('/api/registros', (req, res) => {
    res.json(registrosLideres);
});

// Cargar Cuestionario
app.get('/api/evaluacion/:codigo', (req, res) => {
    const lider = registrosLideres.find(l => l.codigo === req.params.codigo);
    if (!lider) {
        return res.status(404).json({ mensaje: "Evaluación no encontrada o enlace inválido." });
    }
    res.json({
        liderNombre: lider.coacheeNombre,
        empresa: lider.empresa,
        preguntas: cuestionarioBase
    });
});

// Guardar respuestas de cada evaluador
app.post('/api/evaluacion/:codigo', (req, res) => {
    const lider = registrosLideres.find(l => l.codigo === req.params.codigo);
    if (!lider) {
        return res.status(404).json({ mensaje: "Líder no encontrado." });
    }

    const { nombreEvaluador, puesto, relacion, correo, respuestas } = req.body;

    const nuevaRespuesta = {
        id: lider.evaluacionesRecibidas.length + 1,
        evaluador: { nombreEvaluador, puesto, relacion, correo },
        respuestas,
        fecha: new Date().toLocaleDateString()
    };

    lider.evaluacionesRecibidas.push(nuevaRespuesta);
    res.json({ mensaje: "¡Evaluación completada con éxito!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de La Mesa del Rey Arturo activo en puerto ${PORT}`);
});