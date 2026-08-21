const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const SECRET_KEY = "clave_secreta_huva_coaching";

// Administradores con acceso directo sin cambio de contraseña obligatorio
const administradores = [
    { id: 1, email: "alexis.lobato@h-uva.com", passwordProvisional: "H-UVA2026", nombre: "Alexis Lobato", puesto: "Coordinador de Logística" },
    { id: 2, email: "hvazquez@h-uva.com", passwordProvisional: "H-UVA2026", nombre: "Humberto Vázquez", puesto: "CEO" }
];

let registrosEvaluaciones = [];

// Ruta Principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Login Admin directo
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const admin = administradores.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!admin || (password !== admin.passwordProvisional && password !== admin.passwordActualizada)) {
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

// Endpoint para guardar registro y generar enlaces dinámicos
app.post('/api/registros', (req, res) => {
    const { coacheeNombre, empresa, evaluadores } = req.body;

    if (!coacheeNombre || !empresa || !evaluadores || evaluadores.length === 0) {
        return res.status(400).json({ mensaje: "Por favor completa todos los campos requeridos." });
    }

    const host = req.get('host');
    const protocol = req.protocol;

    const enlacesGenerados = evaluadores.map((evaluador, index) => {
        const codigoUnico = Math.random().toString(36).substring(2, 10);
        return {
            id: index + 1,
            nombreEvaluador: evaluador.nombre || `Evaluador ${index + 1}`,
            correoEvaluador: evaluador.correo,
            relacion: evaluador.relacion || 'Par',
            codigo: codigoUnico,
            enlace: `${protocol}://${host}/evaluacion/${codigoUnico}`,
            estatus: "Pendiente"
        };
    });

    const nuevoRegistro = {
        id: registrosEvaluaciones.length + 1,
        coacheeNombre,
        empresa,
        fechaCreacion: new Date().toLocaleDateString(),
        evaluaciones: enlacesGenerados
    };

    registrosEvaluaciones.push(nuevoRegistro);

    res.json({
        mensaje: "Registro creado exitosamente",
        registro: nuevoRegistro
    });
});

app.get('/api/registros', (req, res) => {
    res.json(registrosEvaluaciones);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de H-UVA ejecutándose en el puerto ${PORT}`);
});