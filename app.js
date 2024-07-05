//Libreria de Express
const express = require('express');
//Libreria Path
const path = require('path');
//Libreria Mysql
const mysql = require('mysql');
const app = express();
const port = 3000;
const multer = require('multer'); 
/////////////////////////////////////////////////////
const upload = multer({dest: 'imagenes/'});
//////////////////////////////////////////////////////
// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: '10.0.6.39',
    user: 'estudiante',
    password: 'Info-2023',
    database: 'heladeriaDM'
});
//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});
//////////////////////////////////////////////////////////
//Envio los datos del formulario por url
app.use(express.urlencoded({ extended: true }));
//////////////////////////////////////////////////////////
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
/////////////////////////////////////////////////////////////////////////////
//Peticion para subir las imagenes a la BDD
app.post('/subir_imagenes', upload.single('imagen'), (req, res) =>{
    //Extraigo los datos de la url
    const {nombre, descripcion} = req.body;
    //Extraigo la imagen
    const imagen = req.file.filename;
    //Defino la consulta SQL para insertar la imagen
    const sql ='INSERT INTO imagenes (nombre, descripcion, imagen) VALUES (?, ?, ?)';
    //Ejecuto la consulta SQL con los valores extraidos
connection.query(sql, [nombre, descripcion, imagen], (err) =>{
        //Si hay error muestra una exepcion
        if(err) throw err;
        //Si la insercion es exitosa
        res.redirect('/')
    });
});
////////////////////////////////////////////////////////////////////////////////
//Peticion para obtener las imagenes
app.get('/imagenes', (req, res) => {
    const sql = 'SELECT nombre, descripcion, imagen FROM imagenes';
    connection.query(sql, (err, result) =>{
        if(err){
            console.error('Error al obtener los datos de la BDD' + err.stack);
            res.status(500).send('Error al obtener los datos de la BDD');
            return;
        }
        //Si los datos existen los convierto en formato JSON
        res.json(result);
    });
});
///////////////////////////////////////////////////////////////////////
//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));
//Recibo los valores y los envio a la tabla
app.post('/guardar_helado',(req, res) => {
    const { nombre, descripcion, sabor, tipo, cobertura, precio } = req.body;
    const sql = 'INSERT INTO Helado (nombre, descripcion, sabor, tipo, cobertura, precio) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, descripcion, sabor, tipo, cobertura, precio], (err, result) => {
        if (err) throw err;
        console.log('Helado insertada correctamente.');
        res.redirect('/listardatos.html');
    });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/guardar_usuario',(req, res) => {
    const { correo, clave, rol } = req.body;
    const sql = 'INSERT INTO usuario (correo, clave, rol) VALUES (?, ?, ?)';
    connection.query(sql, [correo, clave, rol], (err, result) => {
        if (err) throw err;
        console.log('Usuario creado correctamente.');
        res.redirect('/listardatos.html');
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Ruta para mostrar las películas en el listardatos.html con metodo GET
app.get('/helados', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "peliculas"
    connection.query('SELECT * FROM Helado', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});
// Ruta para obtener los datos de una película por su ID XD
app.get('/helado_especifico/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de la película con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE id = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos de la película:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Verificar si no se encontró ninguna película con el ID proporcionado
        if (result.length === 0) {
            res.status(404).send('Película no encontrada');
            return;
        }
        // Enviar los datos de la película como respuesta en formato JSON
        res.json(result[0]);
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////
// Nueva ruta para eliminar un usuario
app.delete('/eliminar_helado/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Helado WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el helado:', err);
            res.status(500).send('Error al eliminar el helado');
        } else {
            res.status(200).send('Helado eliminado exitosamente');
        }
    });
});
///////////////////////////////////////////////////////////////////////////////////////////
//Ruta o peticion para iniciar sesion
app.post('/iniciar_sesion', (req, res) =>{
    const {correo, clave} = req.body;
    //Defino una consulta SQL para obtener el rol del usuario
    const sql = 'SELECT rol FROM usuario WHERE correo = ? AND clave = ?';
    //Ejecuto la consulta y paso los datos a la consulta
    connection.query(sql, [correo,clave], (err, result) =>{
        if(err){
            console.error('Error al iniciar sesion', err);
            res.send('Error al Iniciar Sesion');
        //Si existe por lo menus 1 resultado de la consulta SQL
        }else if(result.length > 0){
            const rol = result[0].rol;
            if(rol === 1){
                res.redirect('/listardatos.html');
            }else if(rol === 2){
                res.redirect('/index.html');
            }
        }else{
            res.send('Correo o Clave Incorrectos');
        }
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////
//Servidor ejecutandose en el puerto 3000
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

