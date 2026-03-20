// Script para manejar el registro e inicio de sesión
document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay sesión, redirigir al dashboard
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        checkSession();
    }

    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginMsg = document.getElementById('login-message');
    const registerMsg = document.getElementById('register-message');

    // Cambiar entre pestañas
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }

    // Manejar Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('btn-login');

            try {
                btn.textContent = 'Ingresando...';
                btn.disabled = true;
                
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                // Redirigir al dashboard
                window.location.href = 'dashboard.html';

            } catch (error) {
                loginMsg.innerHTML = `<span class="error-text">Error: ${error.message}</span>`;
                btn.textContent = 'Ingresar';
                btn.disabled = false;
            }
        });
    }

    // Manejar Registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const btn = document.getElementById('btn-register');

            try {
                btn.textContent = 'Creando Cuenta...';
                btn.disabled = true;

                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password
                });

                if (error) throw error;

                registerMsg.innerHTML = `<span class="success-text">¡Registro exitoso! Revisa tu correo o inicia sesión para continuar.</span>`;
                setTimeout(() => loginTab.click(), 3000);

            } catch (error) {
                registerMsg.innerHTML = `<span class="error-text">Error: ${error.message}</span>`;
            } finally {
                btn.textContent = 'Crear Cuenta';
                btn.disabled = false;
            }
        });
    }

});

// Verifica la sesión actual
async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }
}
