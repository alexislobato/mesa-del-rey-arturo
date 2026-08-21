<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Mesa del Rey Arturo - H-UVA</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            background-color: #fafafa;
            color: #1f104f;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            background-color: #ffffff;
            border-bottom: 1px solid #eaeaea;
        }

        .logo-container img {
            height: 60px;
            object-fit: contain;
        }

        .header-title {
            text-align: center;
            flex-grow: 1;
        }

        .header-title h1 {
            font-size: 24px;
            color: #1f104f;
        }

        .header-title p {
            font-size: 14px;
            color: #666;
        }

        main {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
        }

        .login-card {
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            width: 100%;
            max-width: 420px;
            text-align: center;
        }

        .login-card h2 {
            margin-bottom: 10px;
            font-size: 22px;
            color: #1f104f;
        }

        .login-card p.subtitle {
            font-size: 13px;
            color: #777;
            margin-bottom: 25px;
        }

        .form-group {
            text-align: left;
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 6px;
            color: #1f104f;
        }

        .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
        }

        .form-group input:focus {
            border-color: #1f104f;
        }

        .btn-submit {
            width: 100%;
            padding: 12px;
            background-color: #1f104f;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        }

        .btn-submit:hover {
            background-color: #140a35;
        }

        #respuesta {
            margin-top: 15px;
            font-size: 14px;
        }

        footer {
            text-align: center;
            padding: 20px;
            background-color: #ffffff;
            border-top: 1px solid #eaeaea;
            font-size: 12px;
            color: #666;
        }

        footer a {
            color: #1f104f;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <header>
        <div class="logo-container">
            <img src="logo.png" alt="H-UVA Logo" id="logoImg">
        </div>
        <div class="header-title">
            <h1>La Mesa del Rey Arturo</h1>
            <p>Dinámica de Feedback 360°</p>
        </div>
        <div style="width: 60px;"></div> <!-- Espaciador para centrar el título -->
    </header>

    <main>
        <div class="login-card">
            <h2>Acceso Administrativo</h2>
            <p class="subtitle">Ingresa tus credenciales corporativas H-UVA</p>

            <div class="form-group">
                <label for="correo">Correo Electrónico:</label>
                <input type="email" id="correo" placeholder="usuario@h-uva.com">
            </div>

            <div class="form-group">
                <label for="password">Contraseña:</label>
                <input type="password" id="password" placeholder="••••••••">
            </div>

            <button class="btn-submit" onclick="ingresar()">Ingresar</button>

            <div id="respuesta"></div>
        </div>
    </main>

    <footer>
        <p><strong><a href="mailto:hvazquez@h-uva.com">hvazquez@h-uva.com</a></strong> | 33 1340 4958</p>
        <p>H-UVA Coaching & Consulting</p>
    </footer>

    <script>
    async function ingresar() {
        const email = document.getElementById('correo').value;
        const password = document.getElementById('password').value;
        const respuestaDiv = document.getElementById('respuesta');

        if (!email || !password) {
            respuestaDiv.style.color = "red";
            respuestaDiv.innerText = "Por favor ingresa tu correo y contraseña.";
            return;
        }

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                
                // Muestra la bienvenida limpia con el botón amarillo para Salir
                respuestaDiv.style.color = "#1f104f";
                respuestaDiv.innerHTML = `
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                        <p style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">¡Bienvenido, ${data.usuario.nombre}!</p>
                        <p style="font-size: 13px; color: #666; margin-bottom: 15px;">${data.usuario.puesto}</p>
                        <button onclick="salir()" style="background-color: #ffc107; color: #000; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;">Salir</button>
                    </div>
                `;
            } else {
                respuestaDiv.style.color = "red";
                respuestaDiv.innerText = data.mensaje;
            }
        } catch (error) {
            respuestaDiv.style.color = "red";
            respuestaDiv.innerText = "Error de conexión con el servidor.";
        }
    }

    function salir() {
        localStorage.removeItem('token');
        window.location.reload();
    }
    </script>
</body>
</html>