const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();

app.use(express.json());

// Servir archivos estáticos (index.html, logo.png, etc.)
app.use(express.static(path.join(__dirname)));

const SECRET_KEY = "clave_secreta_huva_coaching";

const administradores = [
    {
        id: 1,
        email: "alexis.lobato@h-uva.com",
        passwordProvisional: "H-UVA2026", 
        nombre: "Alexis Lobato",
        puesto: "Coordinador de Logística",
        requiereCambioPass: true
    },
    {
        id: 2,
        email: "hvazquez@h-uva.com",
        passwordProvisional: "H-UVA2026",
        nombre: "Humberto Vázquez",
        puesto: "CEO",
        requiereCambioPass: true
    }
];

// Ruta para cargar la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint de login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const admin = administradores.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!admin) {
        return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    if (password !== admin.passwordProvisional && password !== admin.passwordActualizada) {
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
        requiereCambioPass: admin.requiereCambioPass,
        usuario: { nombre: admin.nombre, puesto: admin.puesto, email: admin.email }
    });
});

// Configuración del puerto para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de H-UVA ejecutándose en el puerto ${PORT}`);
});