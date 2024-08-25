const express = require('express'); // นำเข้าโมดูล express
const mysql = require('mysql2'); // นำเข้าโมดูล mysql2
const app = express(); // สร้างแอปพลิเคชัน Express
const port = 3000; // กำหนดพอร์ตที่ใช้สำหรับเซิร์ฟเวอร์

// สร้างการเชื่อมต่อกับฐานข้อมูล MySQL
const db = mysql.createConnection({
    host: "localhost", // โฮสต์ของฐานข้อมูล
    user: "root", // ชื่อผู้ใช้ฐานข้อมูล
    password: "1234", // รหัสผ่านฐานข้อมูล
    database: "shopdee" // ชื่อฐานข้อมูล
});

// เชื่อมต่อกับฐานข้อมูล
db.connect((err) => {
    if (err) throw err; // ถ้ามีข้อผิดพลาดในการเชื่อมต่อ ให้แสดงข้อผิดพลาด
    console.log('Connected to the database.'); // แสดงข้อความเมื่อเชื่อมต่อสำเร็จ
});

app.use(express.json()); // ใช้ middleware เพื่อให้ Express สามารถแปลง JSON body ได้
app.use(express.urlencoded({ extended: true })); // ใช้ middleware เพื่อให้ Express สามารถแปลง URL-encoded body ได้

// POST endpoint สำหรับเพิ่มข้อมูลสินค้าใหม่
app.post('/product', (req, res) => {
    const { productName, productDetail, price, cost, quantity } = req.body; // ดึงข้อมูลจาก body ของคำร้อง

    // สร้าง query สำหรับการเพิ่มข้อมูล โดยใช้ parameterized query เพื่อป้องกัน SQL injection
    const sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)";
    const values = [productName, productDetail, price, cost, quantity];

    // ส่ง query ไปยังฐานข้อมูล
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error executing query:', err); // แสดงข้อผิดพลาดในการรัน query
            res.status(500).send({'message': 'Internal server error', 'status': false}); // ส่งสถานะข้อผิดพลาด 500
            return;
        }
        res.send({'message': 'บันทึกข้อมูลสำเร็จ', 'status': true}); // ส่งข้อความยืนยันการบันทึกข้อมูล
    });
});

// GET endpoint สำหรับดึงข้อมูลสินค้าตาม ID
app.get('/product/:id', (req, res) => {
    const productID = req.params.id; // ดึง ID ของสินค้าออกจากพารามิเตอร์ใน URL

    // สร้าง query สำหรับการดึงข้อมูลสินค้า โดยใช้ parameterized query เพื่อป้องกัน SQL injection
    const sql = "SELECT * FROM product WHERE productID = ?";
    db.query(sql, [productID], (err, result) => {
        if (err) {
            console.error('Error executing query:', err); // แสดงข้อผิดพลาดในการรัน query
            res.status(500).send({'message': 'Internal server error', 'status': false}); // ส่งสถานะข้อผิดพลาด 500
            return;
        }
        if (result.length === 0) {
            res.status(404).send({'message': 'Product not found', 'status': false}); // ส่งสถานะข้อผิดพลาด 404 หากไม่พบสินค้า
        } else {
            res.send(result); // ส่งข้อมูลสินค้าหากพบ
        }
    });
});

// POST endpoint สำหรับการเข้าสู่ระบบของผู้ใช้
app.post('/login', (req, res) => {
    const { username, password } = req.body; // ดึงข้อมูลชื่อผู้ใช้และรหัสผ่านจาก body ของคำร้อง

    // สร้าง query สำหรับการตรวจสอบผู้ใช้ โดยใช้ parameterized query เพื่อป้องกัน SQL injection
    const sql = "SELECT * FROM customer WHERE username = ? AND password = ? AND isActive = 1";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Error executing query:', err); // แสดงข้อผิดพลาดในการรัน query
            res.status(500).send({'message': 'Internal server error', 'status': false}); // ส่งสถานะข้อผิดพลาด 500
            return;
        }
        if (result.length > 0) {
            let customer = result[0]; // ดึงข้อมูลผู้ใช้คนแรกจากผลลัพธ์
            customer['message'] = "เข้าสู่ระบบสำเร็จ"; // เพิ่มข้อความเข้าสู่ระบบสำเร็จ
            customer['status'] = true; // ตั้งสถานะการเข้าสู่ระบบสำเร็จ
            res.send(customer); // ส่งข้อมูลผู้ใช้
        } else {
            res.status(401).send({"message": "กรุณำระบุรหัสผ่านใหม่อีกครั้ง", "status": false}); // ส่งสถานะข้อผิดพลาด 401 หากเข้าสู่ระบบไม่สำเร็จ
        }
    });
});

// เริ่มเซิร์ฟเวอร์ที่พอร์ตที่กำหนด
app.listen(port, () => {
    console.log(`Server listening on port ${port}`); // แสดงข้อความเมื่อเซิร์ฟเวอร์เริ่มทำงาน
});
