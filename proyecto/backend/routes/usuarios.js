const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
const query = 'SELECT * FROM usuarios ORDER BY id DESC';

db.query(query, (err, results) => {
    if (err) {
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({
            error: 'Error al obtener usuarios',
            details: err.message
        });
    }
    res.json(results);
});
});

const pool = require('../config/db.config'); // Conexión a MySQL
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    // Validación básica de campos
    if (!name || !email || !password) {
        return res.status(400).send({ message: "Nombre, email y contraseña son obligatorios." });
    }

    try {
        // Hashear la contraseña (Factor de Ciberseguridad)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Ejecutar la consulta de inserción
        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "user")';
        const [result] = await pool.execute(query, [name, email, hashedPassword]);

        res.status(201).send({ 
            id: result.insertId, 
            message: 'Usuario creado exitosamente',
            name: name,
            email: email
        });
        
    } catch (error) {
        // Manejo de error si el email ya existe (ER_DUP_ENTRY)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: 'El correo electrónico ya está registrado.' });
        }
        console.error("Error al crear usuario:", error);
        res.status(500).send({ message: 'Error interno del servidor.' });
    }
};

module.exports = router;